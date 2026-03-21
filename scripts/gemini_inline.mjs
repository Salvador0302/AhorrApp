import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Para ejecutar este script use "VITE_GEMINI_API_KEY=<tu_key> node ./scripts/gemini_inline.mjs"

// Usa VITE_GEMINI_API_KEY desde env
const apiKey = process.env.VITE_GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("Advertencia: no se encontró VITE_GEMINI_API_KEY en el entorno. Asegúrate de exportarla antes de ejecutar.");
}
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

async function main() {
  try {
    // 1) Lee tus imágenes y pásalas a base64
    // Resolución de rutas relativa al archivo, no al CWD
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const billPath = join(__dirname, "recibo_estatico.png");
    const labelPath = join(__dirname, "etiqueta_electro.jpeg");

    if (!fs.existsSync(billPath) || !fs.existsSync(labelPath)) {
      console.error("Error: coloca 'recibo_estatico.png' y 'etiqueta_electro.jpeg' en la carpeta 'scripts' junto a este script.");
      process.exit(1);
    }

    const billB64 = fs.readFileSync(billPath, { encoding: "base64" });
    const labelB64 = fs.readFileSync(labelPath, { encoding: "base64" });

    // 2) Arma el prompt multimodal (imagen(es) + texto)
    const contents = [
  { inlineData: { mimeType: "image/png", data: billB64 } }, // recibo
  { inlineData: { mimeType: "image/jpeg", data: labelB64 } }, // etiqueta del equipo (W, modelo)
      {
        text: `Extrae del recibo: periodo, kWh facturados, costo total en S/.
Devuélvelo en JSON con llaves: {periodo, kWh, costo}.
Luego estima kWh/mes del electrodoméstico de la etiqueta y su costo mensual (S/), asumiendo 6 h/día.`,
      },
    ];

    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    console.log(res.text);
  } catch (err) {
    console.error("Error al llamar a la API de Gemini:", err);
    process.exit(2);
  }
}

await main();
