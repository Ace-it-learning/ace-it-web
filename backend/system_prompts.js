const path = require('path');
const fs = require('fs');

let promptsConfig;
try {
    const configPath = path.join(__dirname, 'config', 'prompts.json');
    const rawData = fs.readFileSync(configPath, 'utf8');
    promptsConfig = JSON.parse(rawData);
} catch (error) {
    console.error("Failed to load prompts.json:", error);
    promptsConfig = {
        GLOBAL_BASE_RULES: "",
        ONBOARDING_PROTOCOL: "",
        AGENT_PROMPTS: {},
        GAUNTLET_ASSETS: {}
    };
}

module.exports = {
    GLOBAL_BASE_RULES: promptsConfig.GLOBAL_BASE_RULES,
    ONBOARDING_PROTOCOL: promptsConfig.ONBOARDING_PROTOCOL,
    AGENT_PROMPTS: promptsConfig.AGENT_PROMPTS,
    GAUNTLET_ASSETS: promptsConfig.GAUNTLET_ASSETS,
    
    // For backwards compatibility before full server.js refactor
    SINGLE_ROUTER_CONSTRAINT: promptsConfig.GLOBAL_BASE_RULES
};
