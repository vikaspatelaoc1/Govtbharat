const fs = require("fs");
const path = require("path");

const runtimeDb = path.resolve(__dirname, "../.runtime_data/GovtBharat_database.json");
const editorDb = path.resolve(__dirname, "../data/GovtBharat_database.json");

console.log("🔍 Checking Database integrity & file size health...");

let isValid = true;

if (fs.existsSync(editorDb)) {
  const stat = fs.statSync(editorDb);
  const sizeKb = (stat.size / 1024).toFixed(1);
  console.log(`✅ data/GovtBharat_database.json exists: ${sizeKb} KB (Safe for Monaco Editor)`);
  if (stat.size > 1024 * 1024) {
    console.warn("⚠️ Warning: data/GovtBharat_database.json is larger than 1MB");
  }
} else {
  console.error("❌ data/GovtBharat_database.json missing!");
  isValid = false;
}

if (fs.existsSync(runtimeDb)) {
  try {
    const raw = fs.readFileSync(runtimeDb, "utf8");
    const parsed = JSON.parse(raw);
    console.log(`✅ Full runtime database intact with ${parsed.jobs ? parsed.jobs.length : 0} jobs.`);
  } catch (e) {
    console.error("❌ Runtime database parse error:", e.message);
    isValid = false;
  }
} else {
  console.warn("⚠️ .runtime_data/GovtBharat_database.json will be seeded from src/data/fullCatalogJobs.ts on next server start.");
}

console.log(isValid ? "🎉 All checks passed cleanly!" : "⚠️ Check completed with issues.");
