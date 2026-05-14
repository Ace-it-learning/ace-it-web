require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.AZURE_COSMOS_ENDPOINT,
  key: process.env.AZURE_COSMOS_KEY
});

async function invalidate() {
  const db = client.database("aceit");
  const container = db.container("jupas_programmes");
  
  // Update a dummy document to trigger cache invalidation
  // Actually, let's just update the timestamp on an existing doc
  const { resources } = await container.items
    .query({ query: "SELECT * FROM c WHERE c.type = 'programme' AND c.code = 'JS4202'" })
    .fetchAll();
  
  if (resources.length > 0) {
    const doc = resources[0];
    doc.updatedAt = new Date().toISOString();
    await container.items.upsert(doc);
    console.log("[Invalidate] Updated JS4202 timestamp to invalidate cache");
  }
}

invalidate().catch(console.error);
