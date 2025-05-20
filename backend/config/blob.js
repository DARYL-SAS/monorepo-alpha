// config/blob.js

const { BlobServiceClient } = require('@azure/storage-blob');

const connectBlob = () => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

        console.log('Connexion à Azure Blob Storage réussie !');
        return blobServiceClient;
    } catch (err) {
        console.error('Erreur de connexion à Azure Blob Storage :', err.message);
        process.exit(1);
    }
};

module.exports = connectBlob;