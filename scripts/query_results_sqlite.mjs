import sqlite3 from "sqlite3";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Para ejecutar este script use "node ./scripts/query_results_sqlite.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "results.db");

function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      resolve(db);
    });
  });
}

async function runQuery(sql) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function main() {
  const arg = process.argv.slice(2).join(" ");
  const sql = arg && arg.trim().length ? arg : "SELECT id, file, raw_text, json_clean, created_at FROM results ORDER BY id DESC LIMIT 100";

  try {
    const rows = await runQuery(sql);
    // Parse json_clean into object when possible
    const normalized = rows.map((r) => {
      let parsed = null;
      if (r.json_clean) {
        try {
          parsed = JSON.parse(r.json_clean);
        } catch (e) {
          parsed = null;
        }
      }
      return {
        id: r.id,
        file: r.file,
        raw_text: r.raw_text,
        json_clean: parsed !== null ? parsed : r.json_clean,
        created_at: r.created_at,
      };
    });
    console.log(JSON.stringify({ ok: true, rows: normalized }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err.message }, null, 2));
    process.exit(2);
  }
}

await main();
