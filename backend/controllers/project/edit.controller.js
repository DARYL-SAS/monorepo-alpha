module.exports = (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    res.status(200).json({
        message: `Projet avec ID ${id} mis à jour`,
        updates
    });
};

