const { boomify } = require('@hapi/boom');
const User = require('../config/models/User');

function isValidUserData(data) {
    return new Promise((resolve, reject) => {
        try {
            User.findOne(data).then((dbData) => {
                if (dbData === null) {
                    resolve(dbData);
                }
                else {
                    reject(dbData);
                }
            });
        }
        catch (error) {
            console.log('Validity of user data could not be checked.');
            throw boomify(error);
        }
    })
}

module.exports.isValidUserData = isValidUserData;