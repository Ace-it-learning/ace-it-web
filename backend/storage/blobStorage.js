const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require("@azure/storage-blob");

/**
 * Parse AccountName / AccountKey from an Azure Storage connection string (portal default format).
 * Needed because SAS token generation requires shared key credentials, not only BlobServiceClient.fromConnectionString.
 */
function parseBlobConnectionString(connStr) {
    if (!connStr || typeof connStr !== "string") {
        return { accountName: null, accountKey: null };
    }
    const out = {};
    for (const seg of connStr.split(";")) {
        if (!seg.trim()) continue;
        const eq = seg.indexOf("=");
        if (eq <= 0) continue;
        const k = seg.slice(0, eq).trim();
        const v = seg.slice(eq + 1).trim();
        if (k && v) out[k] = v;
    }
    return {
        accountName: out.AccountName || null,
        accountKey: out.AccountKey || null
    };
}

function getAzureBlobAccountCredentials() {
    const n = process.env.AZURE_BLOB_ACCOUNT_NAME?.trim();
    const k = process.env.AZURE_BLOB_ACCOUNT_KEY?.trim();
    if (n && k) {
        return { accountName: n, accountKey: k };
    }
    return parseBlobConnectionString(process.env.AZURE_BLOB_CONNECTION_STRING);
}

const MISSING_CREDS_MSG =
    "Missing Azure Blob credentials — in backend .env set AZURE_BLOB_CONNECTION_STRING (from Azure Portal → Storage → Access keys), or set AZURE_BLOB_ACCOUNT_NAME and AZURE_BLOB_ACCOUNT_KEY";

function getBlobServiceClient() {
    const connStr = process.env.AZURE_BLOB_CONNECTION_STRING?.trim();
    if (connStr) {
        return BlobServiceClient.fromConnectionString(connStr);
    }

    const { accountName, accountKey } = getAzureBlobAccountCredentials();
    if (!accountName || !accountKey) {
        throw new Error(MISSING_CREDS_MSG);
    }

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    return new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
}

/**
 * Private container only. New Azure accounts default to "disallow blob public access";
 * using access: "blob" caused "Public access is not permitted on this storage account."
 */
async function ensureContainer(containerName) {
    const service = getBlobServiceClient();
    const container = service.getContainerClient(containerName);
    await container.createIfNotExists();
    return container;
}

/**
 * Time-limited read URL for private blobs (browser previews + server-side grading fetch).
 * Override with AZURE_BLOB_READ_SAS_MINUTES (default 7 days).
 */
async function createBlobReadSasUrl({ containerName, blobName, expiresInMinutes }) {
    const ttl =
        expiresInMinutes != null
            ? expiresInMinutes
            : parseInt(process.env.AZURE_BLOB_READ_SAS_MINUTES || "", 10) || 10080;

    await ensureContainer(containerName);
    const { accountName, accountKey } = getAzureBlobAccountCredentials();
    if (!accountName || !accountKey) {
        throw new Error(MISSING_CREDS_MSG);
    }

    const service = getBlobServiceClient();
    const container = service.getContainerClient(containerName);
    const blobClient = container.getBlockBlobClient(blobName);
    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(Date.now() + ttl * 60 * 1000);

    const sas = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn: new Date(Date.now() - 5 * 60 * 1000),
        expiresOn
    }, credential).toString();

    return `${blobClient.url}?${sas}`;
}

async function createUploadSasUrl({ containerName, blobName, contentType, expiresInMinutes = 20 }) {
    const { accountName, accountKey } = getAzureBlobAccountCredentials();
    if (!accountName || !accountKey) {
        throw new Error(MISSING_CREDS_MSG);
    }

    const container = await ensureContainer(containerName);
    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const sas = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("cw"),
        startsOn: new Date(Date.now() - 5 * 60 * 1000),
        expiresOn,
        contentType
    }, credential).toString();

    const uploadUrl = `${container.getBlockBlobClient(blobName).url}?${sas}`;
    const readTtl =
        parseInt(process.env.AZURE_BLOB_READ_SAS_MINUTES || "", 10) || 10080;
    const publicUrl = await createBlobReadSasUrl({
        containerName,
        blobName,
        expiresInMinutes: readTtl
    });
    return { uploadUrl, publicUrl, expiresOn };
}

/**
 * Directly upload a buffer to Azure Blob Storage.
 * Returns the blob URL (without SAS — use createBlobReadSasUrl for access).
 */
async function uploadBuffer({ containerName, blobName, buffer, contentType }) {
    const container = await ensureContainer(containerName);
    const blobClient = container.getBlockBlobClient(blobName);
    await blobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType || 'application/octet-stream' }
    });
    return blobClient.url;
}

module.exports = {
    getBlobServiceClient,
    ensureContainer,
    createUploadSasUrl,
    createBlobReadSasUrl,
    uploadBuffer
};
