// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connectée avec succès');
  } catch (err) {
    console.error('Erreur connexion MongoDB :', err.message);
    process.exit(1); // Stop le serveur
  }
};

module.exports = connectDB;
