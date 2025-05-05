// utils/getContainerClient.js

const { BlobServiceClient } = require('@azure/storage-blob');

const getContainerClient = () => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);
  return containerClient;

};



module.exports = getContainerClient;