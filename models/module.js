const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: true,
  },
  resultSheet: {
    type: String, // assuming you'll store the file path
    required: true,
  },
});

module.exports = mongoose.model('Module', moduleSchema);
