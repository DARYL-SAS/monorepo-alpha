const Document = require('../../models/Document');
const fs = require('fs');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document introuvable' });
    }

    const filePath = document.path;

    // On vérifie que le fichier existe physiquement
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier manquant sur le serveur' });
    }

    res.setHeader('Content-Type', document.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalname}"`);
    fs.createReadStream(filePath).pipe(res);

  } catch (err) {
    console.error('Erreur lecture document :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
