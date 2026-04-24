const fs = require('fs');
const path = require('path');

class EnglishMockService {
    constructor() {
        this.baseDir = path.join(__dirname, '..', 'generated_mocks');
    }

    /**
     * Get a mock paper by its library ID (e.g., eng_p1_01)
     * Maps library IDs to actual files in generated_mocks
     */
    async getMockPaper(paperId) {
        // IDs are like: eng_p1_01, eng_p2_05, etc.
        const parts = paperId.split('_');
        if (parts.length < 3) throw new Error("Invalid Paper ID");

        const paperCode = parts[1]; // p1, p2, p3, p4
        const index = parseInt(parts[2]) - 1; // 0-based index

        const folderMap = {
            'p1': 'reading',
            'p2': 'writing',
            'p3': 'listening',
            'p4': 'speaking'
        };

        const folder = folderMap[paperCode];
        if (!folder) throw new Error("Invalid Paper Category");

        const dir = path.join(this.baseDir, folder);
        if (!fs.existsSync(dir)) return null;

        let files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        
        // For Reading, we often suffix with _FullMock
        if (folder === 'reading') {
            const mockFiles = files.filter(f => f.endsWith('_FullMock.json'));
            if (mockFiles.length > 0) files = mockFiles;
        }

        // Sort files to ensure deterministic retrieval
        files.sort();

        if (files.length === 0) return null;

        // Use modulo to wrap around if library says 10 but we have 7
        const finalFile = files[index % files.length];
        const filePath = path.join(dir, finalFile);
        
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            // Standardize metadata
            data.id = paperId;
            data.originalFilename = finalFile;
            return data;
        } catch (e) {
            console.error(`Error reading mock file ${finalFile}:`, e);
            return null;
        }
    }

    /**
     * Get the list of all available mock headers for the library
     */
    async getLibraryHeaders(paperCode) {
        const folderMap = { 'p1': 'reading', 'p2': 'writing', 'p3': 'listening', 'p4': 'speaking' };
        const folder = folderMap[paperCode];
        if (!folder) return [];

        const dir = path.join(this.baseDir, folder);
        if (!fs.existsSync(dir)) return [];

        let files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        if (folder === 'reading') files = files.filter(f => f.endsWith('_FullMock.json'));
        
        files.sort();

        return files.map((f, i) => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                return {
                    id: `eng_${paperCode}_${String(i + 1).padStart(2, '0')}`,
                    name: data.title || data.meta?.title || f.replace('.json', '').replace(/_/g, ' '),
                    description: data.topic || data.meta?.topic || "Full Mock Challenge"
                };
            } catch (err) { return null; }
        }).filter(h => h !== null);
    }
}

module.exports = new EnglishMockService();
