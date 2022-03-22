const express = require('express');
const app = express();
const monk = require('monk');
require('dotenv').config({path: '../.env'});
const cors = require('cors');
app.use(cors());

exports.connectDatabase = function() {
    const db = monk(process.env.MONGO_URI || process.env.LOCAL_DB);
    db.then(() => {
        console.log('Connected to the database.');
    });
    return db;
}