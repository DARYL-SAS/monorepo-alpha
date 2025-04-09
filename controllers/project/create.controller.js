module.exports = (req, res) => {
    const data = req.body;
    console.log("Création de projet :", data);

    res.status(201).json({
        message: "Projet créé avec succès",
        data
    });
};

