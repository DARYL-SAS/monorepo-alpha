module.exports = (req, res) => {
    // Supposons une initialisation spéciale (ex: setup par défaut)
    res.status(200).json({
        message: "Projet initialisé avec succès",
        timestamp: new Date()
    });
};

