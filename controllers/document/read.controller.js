// controllers/document/read.controller.js

// controllers/document/read.controller.js
const getContainerClient = require('../../utils/getContainerClient');

const listDocuments = async (req, res) => {
  try {
    const containerClient = getContainerClient();
    const files = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      // Construire l'URL complète de chaque fichier (en fonction de ton blob storage)
      const blobClient = containerClient.getBlobClient(blob.name);
      const url = blobClient.url;
      
      // Récupérer la taille du fichier (en octets)
      const blobProperties = await blobClient.getProperties();
      const size = blobProperties.contentLength;

      files.push({
        name: blob.name,
        url: url,
        size: size
      });
    }

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve documents' });
  }
};

module.exports = listDocuments;
