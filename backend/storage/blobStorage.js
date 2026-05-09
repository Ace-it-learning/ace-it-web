const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require("@azure/storage-blob");

function getBlobServiceClient() {
    const connStr = process.env.AZURE_BLOB_CONNECTION_STRING;
    if (connStr) {
        return BlobServiceClient.fromConnectionString(connStr);
    }

    const accountName = process.env.AZURE_BLOB_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_BLOB_ACCOUNT_KEY;
    if (!accountName || !accountKey) {
        throw new Error("Missing Azure Blob credentials");
    }

    const credential = new StorageSharedKeyCredential(accountName, accountKey);
    return new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, credential);
}

async function ensureContainer(containerName) {
    const service = getBlobServiceClient();
    const container = service.getContainerClient(containerName);
    await container.createIfNotExists({ access: "blob" });
    return container;
}

async function createUploadSasUrl({ containerName, blobName, contentType, expiresInMinutes = 20 }) {
    const accountName = process.env.AZURE_BLOB_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_BLOB_ACCOUNT_KEY;
    if (!accountName || !accountKey) {
        throw new Error("Missing AZURE_BLOB_ACCOUNT_NAME or AZURE_BLOB_ACCOUNT_KEY");
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
    const publicUrl = container.getBlockBlobClient(blobName).url;
    return { uploadUrl, publicUrl, expiresOn };
}

module.exports = {
    getBlobServiceClient,
    ensureContainer,
    createUploadSasUrl
};
