const { getContainer } = require("../db/cosmos");
const CacheService = require("./CacheService");

/**
 * Service to manage JUPAS Programme data in Cosmos DB.
 * Replaces static JS files with dynamic DB storage.
 */
class JupasProgrammeService {
    constructor() {
        this.containerName = "jupas_programmes";
        this.cacheKey = "jupas_programmes_all";
        this.cacheTTL = 3600; // 1 hour cache
    }

    async getContainer() {
        return getContainer(this.containerName, "/pk");
    }

    /**
     * Get all JUPAS programmes (with caching)
     */
    async getAllProgrammes() {
        const cached = CacheService.getDbCache(this.cacheKey);
        if (cached) return cached;

        const container = await this.getContainer();
        const query = {
            query: "SELECT * FROM c WHERE c.type = 'programme' ORDER BY c.code"
        };
        const { resources } = await container.items.query(query).fetchAll();
        
        CacheService.setDbCache(this.cacheKey, resources, this.cacheTTL);
        return resources;
    }

    /**
     * Get programmes by university
     */
    async getProgrammesByUniversity(university) {
        const all = await this.getAllProgrammes();
        return all.filter(p => p.university === university);
    }

    /**
     * Get a single programme by code
     */
    async getProgrammeByCode(code) {
        const all = await this.getAllProgrammes();
        return all.find(p => p.code === code) || null;
    }

    /**
     * Get programme details by code
     */
    async getProgrammeDetails(code) {
        const container = await this.getContainer();
        const query = {
            query: "SELECT * FROM c WHERE c.type = 'programme_detail' AND c.code = @code",
            parameters: [{ name: "@code", value: code }]
        };
        const { resources } = await container.items.query(query).fetchAll();
        return resources[0] || null;
    }

    /**
     * Upsert a programme (admin use)
     */
    async upsertProgramme(programme) {
        const container = await this.getContainer();
        const doc = {
            id: `prog_${programme.code}`,
            pk: "programmes",
            type: "programme",
            ...programme,
            updatedAt: new Date().toISOString()
        };
        await container.items.upsert(doc);
        CacheService.setDbCache(this.cacheKey, null, 0); // Invalidate cache
        return doc;
    }

    /**
     * Upsert programme details (admin use)
     */
    async upsertProgrammeDetails(details) {
        const container = await this.getContainer();
        const doc = {
            id: `detail_${details.code}`,
            pk: "details",
            type: "programme_detail",
            ...details,
            updatedAt: new Date().toISOString()
        };
        await container.items.upsert(doc);
        return doc;
    }

    /**
     * Seed initial data - for one-off setup
     */
    async seedProgramme(programme) {
        const existing = await this.getProgrammeByCode(programme.code);
        if (existing) {
            console.log(`[JupasProgrammeService] Programme ${programme.code} already exists, skipping.`);
            return existing;
        }
        console.log(`[JupasProgrammeService] Seeding programme ${programme.code}...`);
        return this.upsertProgramme(programme);
    }
}

module.exports = new JupasProgrammeService();
