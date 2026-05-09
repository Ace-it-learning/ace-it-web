const DATA_PROVIDER = (process.env.DATA_PROVIDER || "cosmos").toLowerCase();
const STORAGE_PROVIDER = (process.env.STORAGE_PROVIDER || "azure").toLowerCase();

function isAzureData() {
    return DATA_PROVIDER === "azure" || DATA_PROVIDER === "cosmos" || DATA_PROVIDER === "dual";
}

function isDualData() {
    return DATA_PROVIDER === "dual";
}

function isAzureStorage() {
    return STORAGE_PROVIDER === "azure";
}

module.exports = {
    DATA_PROVIDER,
    STORAGE_PROVIDER,
    isAzureData,
    isDualData,
    isAzureStorage
};
