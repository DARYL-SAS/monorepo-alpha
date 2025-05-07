// controllers/document/read.controller.js
const getContainerClient = require('../../utils/getContainerClient');

const listDocuments = async (req, res) => {
  try {
    const containerClient = getContainerClient();
    const files = [];

    // Liste des fichiers dans le container
    for await (const blob of containerClient.listBlobsFlat()) {
      const blobClient = containerClient.getBlobClient(blob.name);
      const url = blobClient.url;

      const blobProperties = await blobClient.getProperties();
      const size = blobProperties.contentLength;

      files.push({
        name: blob.name,
        url: url,
        size: size
      });
    }

    // Vérifier si des fichiers existent
    if (files.length === 0) {
      return res.status(404).json({ error: 'Aucun fichier trouvé' });
    }

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: 'Unable to retrieve documents' });
  }
};

module.exports = listDocuments;
