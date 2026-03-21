import { GoogleGenAI } from "@google/genai";

// API Key de Google Gemini insertada directamente
const apiKey = "AIzaSyC4E4TrfPI2AfSh7KZO0yeqpLYjfoZdEJM";

// Inicializar la API de Gemini con la clave API
let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey });
  console.log("API de Google Gemini inicializada correctamente");
} catch (error) {
  console.error("Error al inicializar GoogleGenAI:", error);
  // Creamos un objeto simulado para evitar errores en tiempo de ejecución si falla la inicialización
  ai = {
    models: {
      generateContent: async () => ({ 
        text: "Error: No se pudo inicializar la API de Google Gemini. Verifica tu API Key."
      })
    }
  } as unknown as GoogleGenAI;
}

// Función para extraer JSON del texto
function extractJson(text: string | undefined): string | null {
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

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const rawText = res.text || "";
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
    if (!jsonData && rawText) {
      try {
        const cleanPrompt = `La respuesta anterior fue:\n\n${rawText}\n\nPor favor, convierte la respuesta anterior en JSON válido y devuelve SOLO el JSON.`;
        const clean = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ text: cleanPrompt }],
        });
        const cleanText = clean.text || "";
        const candidateClean = extractJson(cleanText) || cleanText;
        if (candidateClean) {
          jsonData = JSON.parse(candidateClean);
        }
      } catch (e) {
        console.warn("Reintento de limpieza falló:", e);
      }
    }

    return { rawText, jsonData };
  } catch (error) {
    console.error("Error al consultar imagen con Gemini:", error);
    return { rawText: "Error al procesar la imagen", jsonData: null };
  }
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

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    return res.text || "No se pudo obtener una respuesta";
  } catch (error) {
    console.error("Error al consultar múltiples imágenes:", error);
    return "Error al procesar las imágenes";
  }
}

// Función para chatear con Gemini
export async function chatWithGemini(message: string): Promise<string> {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: message }],
    });

    return res.text || "No se pudo obtener una respuesta";
  } catch (error) {
    console.error("Error al chatear con Gemini:", error);
    return "Lo siento, tuve un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.";
  }
}