const monk = require('monk');

require('dotenv').config({path: '../.env'});

/* Connect to database */
const db = monk(process.env.MONGO_URI || process.env.LOCAL_DB);
db.then(() => {
    console.log('Connected to database.');
});

// Expose the connection
module.exports = db;