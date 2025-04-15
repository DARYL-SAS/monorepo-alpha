// controllers/document/input.controller.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Création du dossier de destination si besoin
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage }).single('document');

// Contrôleur principal
const inputController = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier reçu' });
    }

    return res.status(200).json({
      message: 'Fichier reçu avec succès',
      data: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path
      }
    });
  });
};

module.exports = inputController;



// const response = await fetch('http://localhost:3000/document/input', {
//    method: 'POST',