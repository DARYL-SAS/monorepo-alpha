module.exports = (req, res) => {
    const { id } = req.params;

    res.status(200).json({
        message: `Projet avec ID ${id} supprimé`
    });
};

