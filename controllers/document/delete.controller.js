const getContainerClient = require('../../utils/getContainerClient');
const path = require('path');

const deleteDocument = async (req, res) => {
  const { filename } = req.params;  // Récupère le nom du fichier depuis l'URL

  try {
    // Récupérer le client du conteneur Azure Blob Storage
    const containerClient = getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(filename);  // Utilise le nom du fichier pour accéder au blob

    // Supprimer le fichier du Blob Storage
    await blockBlobClient.delete();

    // Répondre avec succès
    res.status(200).json({
      message: 'Document supprimé avec succès',
      filename
    });
  } catch (err) {
    console.error('Erreur suppression du fichier Azure Blob:', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du document' });
  }
};

module.exports = deleteDocument;
