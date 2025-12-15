
import { GoogleGenAI } from "@google/genai";
import type { ScanResult } from "../../../types.ts";

const SYSTEM_INSTRUCTION = `
You are an expert Halal Compliance Analyst AI (Shafi'i School/Jumhur).
Your task: Analyze product packaging images for Halal status.

STEPS:
1. OCR: Read product name and ingredients.
2. CHECK: Look for Halal Logos (MUI, BPJPH, JAKIM).
3. ANALYZE: Scan ingredients for:
   - HARAM: Pork (Babi), Lard, Alcohol/Ethanol (khamr), Mirin, Sake, Rhum, Gelatin (unspecified), Carmine (E120).
   - SYUBHAT: E471/E472 (if origin unspecified), Collagen, Emulsifier.
   - HALAL: Plant-based, Water, Sugar, Salt, Certified Halal Meat.

OUTPUT JSON ONLY:
{
  "productName": "string",
  "status": "halal" | "syubhat" | "haram" | "unknown",
  "confidence": "High" | "Medium" | "Low",
  "ingredients": [
    { "name": "string", "status": "safe" | "warning" | "critical", "reason": "short explanation" }
  ],
  "reasoning": "Concise explanation in Indonesian (max 2 sentences).",
  "detectedLogos": ["string"]
}

IMPORTANT:
- Return RAW JSON only. No markdown formatting.
- If Pork/Lard found -> Status HARAM.
- If Halal Logo found -> Status HALAL (unless clearly haram ingredients visible).
- If text unreadable -> Status UNKNOWN.
`;

/**
 * Clean Markdown code blocks from response
 */
const sanitizeResponse = (text: string): string => {
  // Remove ```json and ``` markers
  let clean = text.replace(/```json/g, '').replace(/```/g, '');
  return clean.trim();
};

/**
 * Compress image to ensure it fits payload limits and is standard base64
 */
const compressImage = async (base64Str: string, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down keeping aspect ratio
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Return pure base64 without prefix
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl.split(',')[1]); 
      } else {
          // Fallback if context fails
          resolve(base64Str.includes(',') ? base64Str.split(',')[1] : base64Str);
      }
    };
    img.onerror = () => {
        // Fallback for load error, return stripped input
        resolve(base64Str.includes(',') ? base64Str.split(',')[1] : base64Str);
    };
  });
};

export const analyzeImage = async (base64Image: string): Promise<ScanResult> => {
  try {
    // 1. Prepare Image
    const compressedData = await compressImage(base64Image);


    // 2. Init Gemini
    // We trust the environment to provide the key.
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    // 3. Call API
    // Using gemini-2.5-flash for speed and multimodal capability
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: compressedData } },
          { text: "Analyze this product image for Halal compliance. Output valid JSON." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.1 // Low temperature for deterministic output
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI tidak memberikan respon (Empty Response).");

    // 4. Parse Result
    const cleanJson = sanitizeResponse(text);
    const result = JSON.parse(cleanJson) as ScanResult;
    
    // Add Client-side Timestamp
    result.timestamp = new Date().toISOString();
    
    return result;

  } catch (error: any) {
    console.error("Halal Scan Service Error:", error);
    
    let userMsg = "Gagal menganalisa gambar.";
    
    if (error.message) {
        if (error.message.includes("429")) userMsg = "Server sibuk (Rate Limit). Coba sesaat lagi.";
        else if (error.message.includes("SAFETY")) userMsg = "Gambar ditolak filter keamanan (Safety).";
        else if (error.message.includes("JSON")) userMsg = "Format data tidak valid.";
        else if (error.message.includes("API Key") || error.message.includes("API key")) userMsg = "Masalah konfigurasi API Key (Cek .env).";
    }
    
    throw new Error(userMsg);
  }
};
