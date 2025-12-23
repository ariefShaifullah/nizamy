
import { GoogleGenAI, Type } from "@google/genai";
import type { ScanResult } from "../../../types.ts";

const SCAN_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: "Nama produk yang terdeteksi" },
    status: { 
      type: Type.STRING, 
      enum: ["halal", "syubhat", "haram", "unknown"],
      description: "Status hukum produk"
    },
    confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["safe", "warning", "critical"] },
          reason: { type: Type.STRING }
        },
        required: ["name", "status"]
      }
    },
    reasoning: { type: Type.STRING, description: "Penjelasan ringkas dalam Bahasa Indonesia" },
    detectedLogos: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Nama lembaga sertifikasi yang logonya terdeteksi (MUI, BPJPH, dll)"
    }
  },
  required: ["productName", "status", "ingredients", "reasoning", "detectedLogos"],
};

const SYSTEM_INSTRUCTION = `Anda adalah pakar audit Halal digital kelas dunia.
Tugas: Analisa gambar produk (kemasan/label bahan) untuk menentukan status kehalalan.
Kaidah:
1. Prioritas: Logo Halal resmi (MUI, BPJPH, JAKIM, MUIB, dll). Jika ada, tandai di 'detectedLogos'.
2. Analisis E-Numbers: Cek daftar kode E (misal: E471, E120). Berikan catatan jika sumbernya tidak jelas (Syubhat).
3. Bahan Kritis: Deteksi babi (Pork, Lard), Alkohol/Khamr, Gelatin non-halal, atau bahan hewani tanpa label sembelihan halal.
4. Kejujuran AI: Jika gambar buram atau teks tidak terbaca, set status ke 'unknown' dan minta user foto ulang area komposisi.
Output: JSON murni sesuai schema. Gunakan Bahasa Indonesia yang sopan dan profesional.`;

const compressImage = async (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200; // Ukuran sedikit lebih besar untuk deteksi teks lebih baik
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
      }
      resolve(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
    };
  });
};

export const analyzeImage = async (base64Image: string): Promise<ScanResult> => {
  try {
    const imageData = await compressImage(base64Image);
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageData } },
          { text: "Lakukan audit halal menyeluruh pada produk dalam gambar ini. Ekstrak nama produk dan analisa daftar bahan yang terlihat." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: SCAN_RESPONSE_SCHEMA,
        temperature: 0.1 // Rendah untuk konsistensi data
      }
    });

    // Robust JSON Extraction
    const rawText = response.text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format analisis tidak valid.");
    
    const result = JSON.parse(jsonMatch[0]) as ScanResult;
    result.timestamp = new Date().toISOString();
    return result;
  } catch (error: any) {
    console.error("Scanner Service Error:", error);
    if (error.message?.includes("Safety")) throw new Error("Gambar mengandung konten yang diblokir sistem keamanan.");
    throw new Error("Gagal menganalisa produk. Pastikan teks komposisi terlihat jelas.");
  }
};
