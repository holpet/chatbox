const fs = require('fs');
const path = require('path');
const User = require('../config/models/User');
const Profile = require('../config/models/Profile');

// confirm that such a user already registered in db
// (-> user exists -> continue route)
async function isUser(username) {
    try {
        var user = await User.findOne({ username: username });
        if (user) return true;
        return false;
    }
    catch (error) {
        done(error);
    }
}

// confirm that such a profile was already added into db
// (-> profile exists -> continue route)
async function savedProfile(username) {
    try {
        var profile = await Profile.findOne({ username: username });
        if (profile) return profile;
        return null;
    }
    catch (error) {
        done(error);
    }
}

// deletes a file from server
async function deleteFileByPrep(prep, username) {
    if (prep === 'misc') return;
    try {
        const filename = fs.readdirSync(path.resolve(__dirname, '../public/uploads/' + username + '/' + prep + '/')).filter(fn => fn.startsWith(prep));
        if (filename.length > 0) {
            const file = path.resolve(__dirname, '../public/uploads/' + username + '/' + prep + '/' + filename[0].toString());
            fs.unlinkSync(file);
        }
    } 
    catch(err) {
        console.error(err);
    }
}

function ensureDirExists(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

module.exports.isUser = isUser;
module.exports.deleteFileByPrep = deleteFileByPrep;
module.exports.ensureDirExists = ensureDirExists;
module.exports.savedProfile = savedProfile;