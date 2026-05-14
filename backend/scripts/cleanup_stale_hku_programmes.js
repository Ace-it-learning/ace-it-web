/**
 * Remove stale HKU programmes that no longer exist on the JUPAS official website
 * These 18 programmes have old codes that were discontinued or replaced
 * Backup will be created before deletion
 * Run: node backend/scripts/cleanup_stale_hku_programmes.js
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { CosmosClient } = require("@azure/cosmos");

const STALE_CODES = [
  "JS6056", // 社會科學學士 → replaced by JS6717
  "JS6070", // 法學士 → replaced by JS6406 (but keeping as it has details, will be removed via this script)
  "JS6102", // 藥劑學學士 → replaced by JS6494
  "JS6108", // 生物醫學科學學士 → replaced by JS6949
  "JS6112", // 工程學學士 → split into multiple engineering codes
  "JS6113", // 牙醫學士 → merged into JS6107
  "JS6114", // 運動及健康學士 → likely discontinued
  "JS6115", // 食物及營養學學士 → likely discontinued
  "JS6116", // 地理學學士 → likely discontinued
  "JS6117", // 海洋生物學學士 → likely discontinued
  "JS6120", // 言語及聽覺科學學士 → likely discontinued
  "JS6121", // 工商管理學學士 → replaced by JS6755
  "JS6122", // 工商管理學學士（資訊系統） → likely discontinued
  "JS6227", // 計量金融學士 → replaced by JS6884
  "JS6411", // 建築學士 → different degree type
  "JS6462", // 護理學學士 → replaced by JS6468
  "JS6951", // 工程學士(計算機科學) → replaced by JS6987
  "JS6963", // 土木工程學士 → replaced by JS6353
];

async function cleanup() {
  console.log("[Cleanup] Starting stale HKU programme cleanup...");
  console.log(`[Cleanup] Total stale programmes to remove: ${STALE_CODES.length}`);

  // Initialize Cosmos DB client directly
  const endpoint = process.env.AZURE_COSMOS_ENDPOINT;
  const key = process.env.AZURE_COSMOS_KEY;
  const databaseId = process.env.AZURE_COSMOS_DATABASE;
  const containerId = "jupas_programmes";

  if (!endpoint || !key || !databaseId) {
    console.error("[Cleanup] ✗ Missing Cosmos DB credentials in environment");
    process.exit(1);
  }

  const client = new CosmosClient({ endpoint, key });
  const database = client.database(databaseId);
  const container = database.container(containerId);

  // Create backup before deletion
  const backupData = [];
  for (const code of STALE_CODES) {
    try {
      const query = {
        query: "SELECT * FROM c WHERE c.type = 'programme' AND c.code = @code",
        parameters: [{ name: "@code", value: code }],
      };
      const { resources } = await container.items.query(query).fetchAll();
      if (resources.length > 0) {
        backupData.push(...resources);
      }
    } catch (err) {
      console.error(`[Cleanup] Error querying ${code}: ${err.message}`);
    }
  }

  const backupPath = path.join(__dirname, `../backups/stale_hku_programmes_${new Date().toISOString().split("T")[0]}.json`);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`[Cleanup] ✓ Backup created: ${backupPath} (${backupData.length} records)`);

  // Delete stale programmes
  let deleted = 0;
  let notFound = 0;
  let failed = 0;

  for (const code of STALE_CODES) {
    try {
      const query = {
        query: "SELECT * FROM c WHERE c.type = 'programme' AND c.code = @code",
        parameters: [{ name: "@code", value: code }],
      };
      const { resources } = await container.items.query(query).fetchAll();

      if (resources.length === 0) {
        console.log(`[Cleanup] ○ Not found: ${code}`);
        notFound++;
        continue;
      }

      for (const doc of resources) {
        await container.item(doc.id, doc.pk || "programmes").delete();
        console.log(`[Cleanup] ✓ Deleted: ${code} (id: ${doc.id})`);
        deleted++;
      }
    } catch (err) {
      console.error(`[Cleanup] ✗ Failed: ${code} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[Cleanup] Complete. Deleted: ${deleted}, Not found: ${notFound}, Failed: ${failed}`);
  console.log(`[Cleanup] Backup saved to: ${backupPath}`);
  process.exit(0);
}

cleanup().catch((err) => {
  console.error("[Cleanup] Fatal error:", err);
  process.exit(1);
});
