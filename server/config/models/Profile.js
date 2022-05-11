const mongoose = require('mongoose');
const connection = require('../connection');

// Creates simple schema for a unique icon that user uploads.
const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    bg: {
        type: String
    },
    icon: {
        type: String
    },
    name: {
        type: String
    },
    desc: {
        type: String
    }
});

const Profile = connection.model('profiles', ProfileSchema);

// Expose the Icon shema
module.exports = Profile;