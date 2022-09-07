const fs = require('fs');
const path = require('path');
const User = require('../config/models/User');
const Profile = require('../config/models/Profile');

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

module.exports.deleteFileByPrep = deleteFileByPrep;
module.exports.ensureDirExists = ensureDirExists;