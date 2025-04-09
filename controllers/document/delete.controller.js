module.exports = (req, res) => {
    const { id } = req.params;

    res.status(200).json({
        message: `Document avec ID ${id} supprimé`
    });
};

