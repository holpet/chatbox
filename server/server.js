/* Require middleware */
const express = require('express');
const app = express();
const monk = require('monk');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config(); //{path: '../.env'}
const crypto = require('crypto');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

/* Require initiators */
//const serverInit = require('./initiators/starter');
//const database = require('./initiators/database');

/* Require routes */
const login = require('./routes/login');

/* Start server */
const start = function() {
    try {
        app.listen(process.env.PORT, () => {
            console.log(`Running the server at localhost: ${process.env.PORT}`);
        });
    }
    catch (error) {
        throw boomify(error);
    };
}
start();

/* Connect to database */
//const db = database.connectDatabase();
const db = monk(process.env.MONGO_URI || process.env.LOCAL_DB);
db.then(() => {
    console.log('Connected to the database.');
});
// get db collections
const Chats = db.get('chats');
const Users = db.get('users');


/* Additional middleware */
app.use(cors()); //automatically adds cors headers to all incoming reqs - to prevent cross-origin error
app.use(express.json());
app.use(session({
    secret: 'key that will sign cookie to server',
    resave: false,
    saveUninitialized: false
}));

const filter = new Filter();
const rateLimiter = (limit, timeFrame) => {
    return rateLimit({
        max: limit, // limit each IP to x request per windowMS
        windowMs: timeFrame * 1000, // per every x seconds,
        message: {
            error: {
                status: 429,
                message: 'TOO_MANY_REQUESTS',
                expiry: timeFrame,
            }
        }
    });
};


/**********************************************************/


/* GET CALLS - unlimited */
app.get('/', (req, res) => {
    console.log(req.session);
    res.json({
        message: 'Chat is working.'
    });
});

app.get('/chats', (req, res) => {
    Chats
        .find()
        .then(chats => {
            res.json(chats);
        });
});


/* POST CALLS - limited (using IP addr) */
app.post('/chats', rateLimiter(10, 10), (req, res) => {
    if (isValidChat(req.body)) {
        // insert into db...
        const chat = {
            name: structureContent(req.body.name.toString(), false),
            content: structureContent(req.body.content.toString(), true),
            created: new Date()
        };
        try {
            Chats
            .insert(chat)
            .then(createdChat => {
                res.json(createdChat);
            });
        }
        catch (error) {
            throw boomify(error);
        }
    }
    else {
        res.status(442);
        res.json({
            error: {
                status: 442,
                message: 'Missing name and/or content.'
            }
        });
    }
});

/* Login */
app.post('/login', rateLimiter(10, 10), (req, res) => {
    Users
        .find({ 'email': { $eq: req.body.email } })
        .then(logData => {
            // TODO: Check if password is ok + bcrypt
            res.json(logData);
        });
});

/* Register */
app.post('/register', rateLimiter(10, 10), (req, res) => {
    const regValidation = isValidRegister(req.body);
    console.log('reg val num: ' + regValidation);
    if (regValidation === 200) {
        const reg = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };
        try {
            Users
                .insert(reg)
                .then(regData => {
                    res.json(regData);
                });
        }
        catch (error) {
            throw boomify(error);
        }
    }
    else {
        res.status(regValidation);
        res.json({
            error: {
                status: regValidation,
                message: 'Registration request rejected - username or email already in use.'
            }
        });
    }
});


/* Helper functions */

function isValidChat(chat) {
    return chat.name && chat.name.toString().trim() !== '' &&
        chat.content && chat.content.toString().trim() !== '';
}

function isValidRegister(regData) {
        Users
            .find({ 'username': { $eq: regData.username } })
            .then(data => {
                if (data.length !== 0) {
                    console.log(data);
                    return 450;
                }
            });
        Users
            .find({ 'email': { $eq: regData.email } })
            .then(data => {
                if (data.length !== 0) {
                    console.log(data);
                    return 451;
                }
            });
    return 200;
}

function structureContent(chat, multiLine) {
    var filteredContent = filter.clean(chat);
    if (multiLine) filteredContent = filteredContent.replace(/\n/g, '<br />');
    return filteredContent;
}
