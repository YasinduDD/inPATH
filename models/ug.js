const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ugSchema = new Schema({
    fn: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    regnum: {
        type: String,
        required: true
    },
    gpa: {
        type: String,
        required: true  
    },
    desk_no: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    propic: {
        type: String,
        default: 'uploads/default_propic.png' // Set the default profile picture path here
    }
}, {timestamps: true});

const Ug = mongoose.model('Ug', ugSchema);

module.exports = Ug;