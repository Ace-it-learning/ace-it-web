const { CosmosClient } = require("@azure/cosmos");

let client = null;
let database = null;

function getClient() {
    if (client) return client;
    const endpoint = process.env.AZURE_COSMOS_ENDPOINT;
    const key = process.env.AZURE_COSMOS_KEY;
    if (!endpoint || !key) {
        throw new Error("Missing AZURE_COSMOS_ENDPOINT or AZURE_COSMOS_KEY");
    }
    client = new CosmosClient({ endpoint, key });
    return client;
}

async function getDatabase() {
    if (database) return database;
    const dbName = process.env.AZURE_COSMOS_DATABASE || "aceit";
    const c = getClient();
    const { database: db } = await c.databases.createIfNotExists({ id: dbName });
    database = db;
    return database;
}

async function getContainer(id, partitionKey = "/pk") {
    const db = await getDatabase();
    const { container } = await db.containers.createIfNotExists({
        id,
        partitionKey: { paths: [partitionKey] }
    });
    return container;
}

async function upsert(containerId, doc) {
    const container = await getContainer(containerId);
    return container.items.upsert(doc);
}

module.exports = {
    getClient,
    getDatabase,
    getContainer,
    upsert
};
