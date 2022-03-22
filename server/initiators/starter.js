const express = require('express');
const app = express();
require('dotenv').config({path: '../.env'});
const cors = require('cors');
app.use(cors());

exports.startListening = function() {
    try {
        app.listen(process.env.PORT, () => {
            console.log(`Running the server at localhost: ${process.env.PORT}`);
        });
    }
    catch (error) {
        throw boomify(error);
    };
};