
import { GoogleGenAI } from "@google/genai";
import type { ScanResult } from "../../../types.ts";

const SYSTEM_INSTRUCTION = `Anda adalah pakar audit Halal digital kelas dunia.
Tugas: Analisa gambar produk (kemasan, label bahan, logo) untuk status kehalalan.
Output WAJIB berupa JSON valid. Jangan tambahkan teks lain di luar JSON.

Format JSON:
{
  "productName": "Nama Produk",
  "status": "halal" | "syubhat" | "haram" | "unknown",
  "confidence": "High" | "Medium" | "Low",
  "ingredients": [
    { "name": "nama bahan", "status": "safe" | "warning" | "critical", "reason": "penjelasan singkat" }
  ],
  "reasoning": "Kesimpulan audit dalam Bahasa Indonesia",
  "detectedLogos": ["MUI", "BPJPH", "dll"]
}

Kaidah Analisis:
1. Haram: Babi (Pork, Lard), Alkohol/Khamr, Gelatin non-halal.
2. Syubhat: E471, E120, bahan hewani tanpa logo halal.
3. Halal: Ada logo halal resmi atau komposisi nabati 100%.
4. Unknown: Teks tidak terbaca.`;

const compressImage = async (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Safety for some environments
    
    // Timeout to prevent hanging
    const timer = setTimeout(() => reject(new Error("Timeout memproses gambar.")), 5000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Increased slightly for better OCR
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            // JPEG Quality 0.7 for balance
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl.split(',')[1]);
        } else {
            reject(new Error("Gagal membuat canvas context."));
        }
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = (e) => {
        clearTimeout(timer);
        console.error("Image load error:", e);
        reject(new Error("Format gambar tidak dikenali atau rusak."));
    };
    
    img.src = base64Str;
  });
};

export const analyzeBatch = async (images: string[]): Promise<ScanResult> => {
  if (images.length === 0) throw new Error("Tidak ada gambar.");

  try {
    const compressedImages = await Promise.all(images.map(img => compressImage(img)));
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    const imageParts = compressedImages.map(data => ({
      inlineData: { mimeType: 'image/jpeg', data }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest', // Updated to a valid multimodal model
      contents: {
        parts: [
          ...imageParts,
          { text: "Analisa status halal produk ini. Keluarkan JSON saja." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json", 
        temperature: 0.1
      }
    });

    const rawText = response.text || "";
    
    if (!rawText) {
        throw new Error("Respon AI kosong. Silakan coba lagi.");
    }

    // Cleaning JSON
    let cleanText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
        console.error("Raw AI Response:", rawText);
        throw new Error("Format respon tidak valid (Bukan JSON).");
    }
    
    cleanText = cleanText.substring(start, end + 1);
    
    const result = JSON.parse(cleanText) as ScanResult;
    result.timestamp = new Date().toISOString();
    
    // Validasi basic
    if (!result.status) result.status = 'unknown';
    
    return result;

  } catch (error: any) {
    console.error("Scanner Error:", error);
    
    // Expose specific API errors
    if (error.message) {
        if (error.message.includes("Safety")) return Promise.reject(new Error("Konten diblokir oleh filter keamanan."));
        if (error.message.includes("400")) return Promise.reject(new Error("Permintaan tidak valid (Bad Request)."));
        if (error.message.includes("403")) return Promise.reject(new Error("Akses API ditolak (Cek API Key)."));
        if (error.message.includes("429")) return Promise.reject(new Error("Terlalu banyak permintaan. Tunggu sebentar."));
        if (error.message.includes("500")) return Promise.reject(new Error("Server Google sedang sibuk."));
        
        // Return original error if it's a known logic error
        if (!error.message.includes("Gagal menganalisa")) return Promise.reject(error);
    }
    
    throw new Error("Gagal menganalisa. Cek koneksi internet atau coba foto ulang.");
  }
};
