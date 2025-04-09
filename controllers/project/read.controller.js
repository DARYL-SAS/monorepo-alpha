module.exports = (req, res) => {
    const { id } = req.params;

    res.status(200).json({
        message: `Lecture du projet avec ID: ${id}`,
        data: { id }
    });
};

