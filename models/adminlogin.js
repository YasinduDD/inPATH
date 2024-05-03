const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
const LogInSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }, 
    password: {
        type: String,
        required: true
    },
    fn: {
        type: String,
        required: true
    },
    acq: {
        type: String,
        required: true
    },
    propic: {
        type: String,
        default: 'uploads/default_propic.png' // Set the default profile picture path here
    }
}, {timestamps: true});

const Admin = new mongoose.model("Collection1", LogInSchema);

module.exports = Admin;