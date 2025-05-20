// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  originalname: String,
  filename: String,
  path: String,
  mimetype: String,
  size: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
