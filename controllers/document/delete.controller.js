const Document = require('../../models/Document');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // On cherche le document en base
    const doc = await Document.findById(id);

    if (!doc) {
      return res.status(404).json({ error: 'Document introuvable en base de données' });
    }

    // On supprime le fichier sur le disque
    fs.unlink(doc.path, (err) => {
      if (err) {
        console.error('Erreur suppression fichier :', err);
        // On continue quand même la suppression BDD
      }
    });

    // Suppression du document en base
    await Document.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Document supprimé avec succès',
      id,
      filename: doc.filename
    });

  } catch (err) {
    console.error('Erreur backend :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du document' });
  }
};
