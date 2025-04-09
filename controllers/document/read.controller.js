module.exports = (req, res) => {
    const { id } = req.params;

    res.status(200).json({
        message: `Lecture du document avec ID: ${id}`,
        documentId: id
    });
};

