require('dotenv').config(); // Importation des modules nécessaires
const express = require('express');
const app = express();

// Connexion BDD
//connectDB();

// Middlewares
app.use(express.json());

//Project routes
app.use('/project', require('./routes/project/create.routes'));
app.use('/project', require('./routes/project/read.routes'));
app.use('/project', require('./routes/project/edit.routes'));
app.use('/project', require('./routes/project/delete.routes'));
app.use('/project', require('./routes/project/initiate.routes'));

//Document routes
app.use('/document', require('./routes/document/input.routes'));
app.use('/document', require('./routes/document/read.routes'));
app.use('/document', require('./routes/document/edit.routes'));
app.use('/document', require('./routes/document/delete.routes'));

// Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
