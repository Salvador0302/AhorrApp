import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Usa la clave API desde el archivo .env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("Advertencia: no se encontró VITE_GEMINI_API_KEY en las variables de entorno.");
}
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

// Función para extraer JSON del texto
function extractJson(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  // Buscar bloque ```json ... ```
  const codeBlock = /```json\s*([\s\S]*?)```/i.exec(text);
  if (codeBlock && codeBlock[1]) return codeBlock[1].trim();

  // Buscar el primer '{' y extraer un objeto balanceado
  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) return null;
  let depth = 0;
  for (let i = firstBrace; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) {
      const candidate = text.slice(firstBrace, i + 1);
      return candidate.trim();
    }
  }
  return null;
}

// Función para convertir archivo a base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extraer la parte base64 del resultado
      const base64String = reader.result as string;
      // Si es un data URL, extraer solo la parte base64
      const base64Match = base64String.match(/;base64,(.*)$/);
      resolve(base64Match ? base64Match[1] : base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Función para consultar imágenes
export async function queryImage(
  imageBase64: string, 
  mimeType: string, 
  promptText: string
): Promise<{ rawText: string; jsonData: any | null }> {
  const contents = [
    { inlineData: { mimeType, data: imageBase64 } },
    { text: promptText },
  ];

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  const rawText = res.text;
  let jsonData = null;
  
  // Extraer JSON si existe
  const candidate = extractJson(rawText);
  if (candidate) {
    try {
      jsonData = JSON.parse(candidate);
    } catch (e) {
      console.warn("Se encontró bloque JSON pero no es válido:", e);
    }
  }

  // Si no se pudo extraer JSON, intentar limpieza
  if (!jsonData) {
    try {
      const cleanPrompt = `La respuesta anterior fue:\n\n${rawText}\n\nPor favor, convierte la respuesta anterior en JSON válido y devuelve SOLO el JSON.`;
      const clean = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: cleanPrompt }],
      });
      const candidateClean = extractJson(clean.text) || clean.text;
      jsonData = JSON.parse(candidateClean);
    } catch (e) {
      console.warn("Reintento de limpieza falló:", e);
    }
  }

  return { rawText, jsonData };
}

// Función para consultar múltiples imágenes juntas
export async function queryMultipleImages(
  images: Array<{ base64: string; mimeType: string }>,
  promptText: string
): Promise<string> {
  const contents = [
    ...images.map(img => ({ inlineData: { mimeType: img.mimeType, data: img.base64 } })),
    { text: promptText },
  ];

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  return res.text;
}

// Función para chatear con Gemini
export async function chatWithGemini(message: string): Promise<string> {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: message }],
  });

  return res.text;
}