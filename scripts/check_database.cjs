const fs = require("fs");
const path = require("path");

const runtimeDb = "/tmp/runtime_data/GovtBharat_database.json";

console.log("🔍 Checking Database integrity & system health...");

let isValid = true;

if (fs.existsSync(runtimeDb)) {
  try {
    const raw = fs.readFileSync(runtimeDb, "utf8");
    const parsed = JSON.parse(raw);
    console.log(`✅ System database in /tmp intact with ${parsed.jobs ? parsed.jobs.length : 0} jobs.`);
  } catch (e) {
    console.error("❌ Runtime database parse error:", e.message);
    isValid = false;
  }
} else {
  console.log("ℹ️ Database will auto-seed from src/data/fullCatalogJobs.ts on server boot.");
}

console.log(isValid ? "🎉 All checks passed cleanly!" : "⚠️ Check completed with issues.");
