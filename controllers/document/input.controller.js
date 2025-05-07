const getContainerClient = require('../../utils/getContainerClient');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() }).single('file');

const uploadDocument = (req, res) => {
  console.log("[UPLOAD] Requête reçue")
  upload(req, res, async (err) => {
    if (err) {
      console.error('Erreur Multer:', err.message);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    try {
      const containerClient = getContainerClient();
      const blobName = `${path.basename(req.file.originalname)}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype },
      });

      res.status(200).json({
        message: "Fichier téléchargé avec succès",
        id: blobName,
        filename: req.file.originalname
      });
    } catch (error) {
      console.error('Erreur upload Azure Blob:', error.message);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
};

module.exports = uploadDocument;
