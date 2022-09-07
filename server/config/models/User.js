const mongoose = require('mongoose');
const connection = require('../connection');
const bcrypt = require('bcrypt');
const findOrCreate = require('mongoose-findorcreate');

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        //required: true,
        lowercase: true
    },
    email: {
        type: String,
        //required: true,
        lowercase: true
    },
    password: {
        type: String,
        //required: true
    },
    salt:{
        type: String,
        //required: true
    },
    googleId: { 
        type: String,
        default: ""
    }
});

UserSchema.pre('save', async function (next) {
    const user = this; // Only hash password if user is new
    try {
        if (user.isNew && user.googleId === "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hash(user.password, salt);
            user.password = hashedPassword;
            user.salt = salt;
        }
        next();
    }
    catch (error) {
        next(error);
    }
});

UserSchema.methods.isValidPassword = async function (password) {
    const user = this;
    try {
        const isValid = await bcrypt.compare(password, user.password);
        return isValid;
    }
    catch (error) {
        console.log(error);
    }
}
UserSchema.plugin(findOrCreate);

const User = connection.model('users', UserSchema);

// Expose user
module.exports = User;