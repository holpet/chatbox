const mongoose = require('mongoose');

require('dotenv').config();


const conn = process.env.MONGO_URI;

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Expose the connection
module.exports = connection;