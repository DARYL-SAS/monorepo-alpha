module.exports = (req, res) => {
    const document = req.body;

    res.status(201).json({
        message: "Document reçu en input",
        data: document
    });
};

