import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sqlite3 from "sqlite3";

// Para ejecutar este script use "node ./scripts/gemini_two_queries_sqlite.mjs"

// API Key de Gemini insertada directamente
const apiKey = "AIzaSyC4E4TrfPI2AfSh7KZO0yeqpLYjfoZdEJM";
const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "results.db");

function ensureDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
        // Crear tabla con columnas para texto crudo y JSON limpiado
        db.run(
          `CREATE TABLE IF NOT EXISTS results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file TEXT,
            raw_text TEXT,
            json_clean TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          (err) => {
            if (err) return reject(err);
            // Asegurar columnas existentes (migración suave para tablas antiguas)
            db.all("PRAGMA table_info(results)", (err, cols) => {
              if (err) return reject(err);
              const names = cols.map((c) => c.name);
              const tasks = [];
              if (!names.includes("raw_text")) {
                tasks.push(new Promise((res, rej) => db.run("ALTER TABLE results ADD COLUMN raw_text TEXT", (e) => (e ? rej(e) : res()))));
              }
              if (!names.includes("json_clean")) {
                tasks.push(new Promise((res, rej) => db.run("ALTER TABLE results ADD COLUMN json_clean TEXT", (e) => (e ? rej(e) : res()))));
              }
              Promise.all(tasks)
                .then(() => resolve(db))
                .catch(reject);
            });
          }
        );
    });
  });
}

  // Extrae primer bloque JSON del texto. Intenta detectar ```json ... ``` y luego el primer objeto { ... } balanceado.
  function extractJson(text) {
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

async function queryImage(fileName, mimeType, promptText) {
  const filePath = join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`No existe ${filePath}`);
  }
  const b64 = fs.readFileSync(filePath, { encoding: "base64" });

  const contents = [
    { inlineData: { mimeType, data: b64 } },
    { text: promptText },
  ];

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  return res.text;
}

async function main() {
  try {
    const db = await ensureDb();

    // Query 1: recibo (PNG)
      const prompt1 = `Extrae del recibo: periodo, kWh facturados, costo total en S/. Devuélvelo SOLO en JSON EXACTO con llaves: {periodo, kWh, costo}. Sin texto adicional, sin explicaciones.`;
      let out1 = await queryImage("recibo_estatico.png", "image/png", prompt1);

    // Query 2: etiqueta (JPEG)
  const prompt2 = `Extrae de la etiqueta: potencia (W) y modelo. Devuélvelo SOLO en JSON EXACTO con llaves: {potenciaW, modelo, estimacion_kWh_mes, costo_mensual_soles}. Sin texto adicional.`;
  let out2 = await queryImage("etiqueta_electro.jpeg", "image/jpeg", prompt2);

    // Procesar respuestas: extraer JSON si existe en el texto, si no reintentar limpieza.
    let parsed1 = null;
    let parsed2 = null;

    const raw1 = out1;
    const raw2 = out2;

    // Extraer bloque JSON si existe
    const candidate1 = extractJson(raw1);
    if (candidate1) {
      try {
        parsed1 = JSON.parse(candidate1);
        out1 = candidate1; // usar la versión limpia
      } catch (e) {
        console.warn("Se encontró bloque JSON en respuesta 1 pero no es válido:", e.message);
      }
    }

    if (!parsed1) {
      console.warn("Respuesta 1 no tiene JSON extraíble o no parsea, intentaré una segunda llamada para convertirla a JSON.");
      try {
        const cleanPrompt = `La respuesta anterior fue:\n\n${raw1}\n\nPor favor, convierte la respuesta anterior en JSON válido y devuelve SOLO el JSON.`;
        const clean = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ text: cleanPrompt }],
        });
        const candidateClean = extractJson(clean.text) || clean.text;
        parsed1 = JSON.parse(candidateClean);
        out1 = candidateClean;
      } catch (e2) {
        console.warn("Reintento de limpieza 1 falló:", e2?.message ?? e2);
      }
    }

    // Segunda respuesta
    const candidate2 = extractJson(raw2);
    if (candidate2) {
      try {
        parsed2 = JSON.parse(candidate2);
        out2 = candidate2;
      } catch (e) {
        console.warn("Se encontró bloque JSON en respuesta 2 pero no es válido:", e.message);
      }
    }

    if (!parsed2) {
      console.warn("Respuesta 2 no tiene JSON extraíble o no parsea, intentaré una segunda llamada para convertirla a JSON.");
      try {
        const cleanPrompt2 = `La respuesta anterior fue:\n\n${raw2}\n\nPor favor, convierte la respuesta anterior en JSON válido y devuelve SOLO el JSON.`;
        const clean2 = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ text: cleanPrompt2 }],
        });
        const candidateClean2 = extractJson(clean2.text) || clean2.text;
        parsed2 = JSON.parse(candidateClean2);
        out2 = candidateClean2;
      } catch (e2) {
        console.warn("Reintento de limpieza 2 falló:", e2?.message ?? e2);
      }
    }

    // Insertar en DB
    const insert = (db, file, jsonText) =>
      new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO results (file, json) VALUES (?, ?)`,
          [file, jsonText],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });

    // Insertar raw_text y json_clean (si existe)
    const insertFull = (db, file, rawText, jsonClean) =>
      new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO results (file, raw_text, json_clean) VALUES (?, ?, ?)`,
          [file, rawText, jsonClean ? JSON.stringify(jsonClean) : null],
          function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
          }
        );
      });

    await insertFull(db, "recibo_estatico.png", raw1, parsed1);
    await insertFull(db, "etiqueta_electro.jpeg", raw2, parsed2);

    console.log("Resultados guardados en:", dbPath);

    db.close();
  } catch (err) {
    console.error("Error en proceso:", err);
    process.exit(2);
  }
}

await main();
 