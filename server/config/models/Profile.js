const mongoose = require('mongoose');
const connection = require('../connection');

// Creates simple schema for a unique icon that user uploads.
const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        lowercase: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: null
    },
    bg: {
        type: String,
        default: ""
    },
    icon: {
        type: String,
        default: ""
    },
    name: {
        type: String
    },
    desc: {
        type: String
    },
    followers: { // small numbers - otherwise hashtable
        type: [ mongoose.Schema.Types.ObjectId ],
        default: []
    },
    following: {
        type: [ mongoose.Schema.Types.ObjectId ],
        default: []
    }
});

const Profile = connection.model('profiles', ProfileSchema);

// Expose the Icon shema
module.exports = Profile;