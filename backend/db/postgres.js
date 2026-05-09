const { Pool } = require("pg");

let pool = null;

function getPool() {
    if (pool) return pool;

    const connectionString = process.env.AZURE_POSTGRES_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
        throw new Error("Missing AZURE_POSTGRES_URL (or POSTGRES_URL) for Azure data provider");
    }

    pool = new Pool({
        connectionString,
        ssl: process.env.POSTGRES_SSL === "false" ? false : { rejectUnauthorized: false },
        max: Number(process.env.POSTGRES_POOL_MAX || 20),
        idleTimeoutMillis: Number(process.env.POSTGRES_IDLE_MS || 30000),
        connectionTimeoutMillis: Number(process.env.POSTGRES_CONN_TIMEOUT_MS || 5000)
    });

    pool.on("error", (err) => {
        console.error("[postgres] Unexpected pool error:", err);
    });

    return pool;
}

async function query(text, params = []) {
    const p = getPool();
    return p.query(text, params);
}

async function withTransaction(work) {
    const p = getPool();
    const client = await p.connect();
    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    getPool,
    query,
    withTransaction
};
