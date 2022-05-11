const mongoose = require('mongoose');
const connection = require('../connection');

// Creates simple schema for a Chat message.
const ChatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    registered: {
        type: Boolean,
        required: true,
        default: false
    },
    content: {
        type: String,
        required: true
    },
    img: {
        type: Array,
        default: []
    },
    created: {
        type: Date,
        required: true,
        immutable: true,
        default: () => Date.now()
    }
});

const Chat = connection.model('Chats', ChatSchema);

// Expose the User shema
module.exports = Chat;