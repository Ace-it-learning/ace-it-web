const fs = require('fs');
const path = require('path');

const PAST_PAPERS_DIR = path.join(__dirname, '..', 'past_papers');
let PAST_PAPER_METADATA = [];

/**
 * Scans the past papers directory and builds a metadata map for RAG.
 */
const scanPastPapers = () => {
    try {
        if (!fs.existsSync(PAST_PAPERS_DIR)) {
            fs.mkdirSync(PAST_PAPERS_DIR, { recursive: true });
        }

        const getFilesRecursively = (dir) => {
            let results = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                file = path.join(dir, file);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(getFilesRecursively(file));
                } else {
                    results.push(file);
                }
            });
            return results;
        };

        const allFiles = getFilesRecursively(PAST_PAPERS_DIR);

        PAST_PAPER_METADATA = allFiles.filter(f => f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.json')).map(filePath => {
            const fileName = path.basename(filePath);
            const content = fs.readFileSync(filePath, 'utf8');

            if (filePath.endsWith('.json')) {
                try {
                    const jsonData = JSON.parse(content);
                    const meta = jsonData.paper_metadata || {};
                    return {
                        filename: fileName,
                        year: meta.year || "Unknown",
                        paper: meta.paper_id || fileName,
                        difficulty: "Official",
                        type: "DSE Paper",
                        summary: meta.description || `Official DSE Paper from ${meta.year}`
                    };
                } catch (e) {
                    console.warn(`Failed to parse JSON for ${fileName}`);
                }
            }

            // Fallback for txt/md
            const difficultyMatch = content.match(/\[DIFFICULTY:\s*(\w+)\]/i);
            const typeMatch = content.match(/\[TYPE:\s*([\w\s]+)\]/i);

            return {
                filename: fileName,
                difficulty: difficultyMatch ? difficultyMatch[1] : (fileName.toLowerCase().includes('hard') ? 'High' : 'Mid'),
                type: typeMatch ? typeMatch[1] : (fileName.toLowerCase().includes('essay') ? 'Essay' : 'General'),
                summary: content.substring(0, 100) + "..."
            };
        }).filter(item => item !== undefined);

        console.log(`[KnowledgeService] Scan complete: ${PAST_PAPER_METADATA.length} papers tagged.`);
    } catch (err) {
        console.error("[KnowledgeService] Error scanning past papers:", err);
    }
};

/**
 * Hybrid Storage: RAG Knowledge Retrieval
 * Queries the knowledge base for specific snippets instead of loading full files.
 */
const retrieveKnowledge = (query, limit = 3) => {
    if (!query) return ""; // Handle undefined/null query

    console.log(`[RAG] Retrieving snippets for: "${query}"`);
    // Simulated Vector Search: Find relevant papers by metadata and return small snippets
    const queryLower = query.toLowerCase();
    const relevantPapers = PAST_PAPER_METADATA.filter(p =>
        p.filename.toLowerCase().includes(queryLower) ||
        p.summary.toLowerCase().includes(queryLower) ||
        (p.year && p.year.toString().includes(queryLower))
    ).slice(0, limit);

    if (relevantPapers.length === 0) return "No specific snippets found.";

    return relevantPapers.map(p => {
        return `[Source: ${p.filename}]\nSnippet: ${p.summary}`;
    }).join('\n\n');
};

// Initial scan
scanPastPapers();

module.exports = {
    scanPastPapers,
    retrieveKnowledge
};
