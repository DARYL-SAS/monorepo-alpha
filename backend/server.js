// server.js

require('dotenv').config(); // Importation des modules nécessaires
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Connexion BlobStorage
const connectBlob = require('./config/blob');
connectBlob();

// Middlewares
app.use(express.json());

//Project routes
app.use('/project', require('./routes/project/create.routes'));
app.use('/project', require('./routes/project/read.routes'));
app.use('/project', require('./routes/project/edit.routes'));
app.use('/project', require('./routes/project/delete.routes'));
app.use('/project', require('./routes/project/initiate.routes'));

//Document routes
const inputRoutes = require('./routes/document/input.routes');
const readRoutes = require('./routes/document/read.routes');
const deleteRoutes = require('./routes/document/delete.routes');

app.use('/document/input', inputRoutes);
app.use('/document/read', readRoutes);
app.use('/document', deleteRoutes);

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
