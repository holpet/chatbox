const express = require('express');
const cors = require('cors');
const monk = require('monk');
require('dotenv').config(); //{path: '../.env'}
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const app = express();

/* Start server */
const start = () => {
    try {
        app.listen(process.env.PORT, () => {
            console.log('Running server at localhost:', process.env.PORT);
        });
    }
    catch (error) {
        throw boomify(error);
    }
};
start();

/* Connect to database */
const db = monk(process.env.MONGO_URI || 'localhost/chatboxDB');
db.then(() => {
    console.log('Connected to the database.');
});
const Chats = db.get('chats'); // get a db collection


/* Additional middleware */
app.use(cors()); //automatically adds cors headers to all incoming reqs - to prevent cross-origin error
app.use(express.json());

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


/* GET CALLS - unlimited */
app.get('/', (req, res) => {
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
        console.log('Chat was validated. -> POST')
        const chat = {
            name: structureContent(req.body.name.toString(), false),
            content: structureContent(req.body.content.toString(), true),
            created: new Date()
        };
        try {
            Chats
            .insert(chat)
            .then(createdChat => {
                console.log('Response with chat inserted in the DB sent back.')
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
                message: 'Missing name and/or content'
            }
        });
    }
});


/* Helper functions */

function isValidChat(chat) {
    return chat.name && chat.name.toString().trim() !== '' &&
        chat.content && chat.content.toString().trim() !== '';
}

function structureContent(chat, multiLine) {
    var filteredContent = filter.clean(chat);
    if (multiLine) filteredContent = filteredContent.replace(/\n/g, '<br />');
    return filteredContent;
}
