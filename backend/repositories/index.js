const { isAzureData, isDualData } = require("../config/runtime");
const FirestoreUserRepository = require("./firestore/FirestoreUserRepository");
const FirestoreChatRepository = require("./firestore/FirestoreChatRepository");
const FirestoreUsageRepository = require("./firestore/FirestoreUsageRepository");
const AzureUserRepository = require("./azure/AzureUserRepository");
const AzureChatRepository = require("./azure/AzureChatRepository");
const AzureUsageRepository = require("./azure/AzureUsageRepository");

function createRepositories() {
    const primary = isAzureData()
        ? {
            userRepo: new AzureUserRepository(),
            chatRepo: new AzureChatRepository(),
            usageRepo: new AzureUsageRepository(),
            provider: "azure"
        }
        : {
            userRepo: new FirestoreUserRepository(),
            chatRepo: new FirestoreChatRepository(),
            usageRepo: new FirestoreUsageRepository(),
            provider: "firebase"
        };

    if (!isDualData()) return { ...primary, fallback: null };

    const fallback = primary.provider === "azure"
        ? {
            userRepo: new FirestoreUserRepository(),
            chatRepo: new FirestoreChatRepository(),
            usageRepo: new FirestoreUsageRepository(),
            provider: "firebase"
        }
        : {
            userRepo: new AzureUserRepository(),
            chatRepo: new AzureChatRepository(),
            usageRepo: new AzureUsageRepository(),
            provider: "azure"
        };

    return { ...primary, fallback };
}

module.exports = {
    createRepositories
};
