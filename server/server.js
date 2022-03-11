const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const PORT = 5050;
const app = express();

/* Start server */
const start = () => {
    try {
        app.listen(PORT, () => {
            console.log('Running server at localhost:', PORT);
        });
    }
    catch (error) {
        throw boomify(error);
    }
};
start();

/* Connect to database */
const db = monk('localhost/chatboxDB');
db.then(() => {
    console.log('Connected to the database.');
});
const Chats = db.get('chats'); // get a db collection


/* Other */
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
app.post('/chats', rateLimiter(1, 10), (req, res) => {
    const validChat = isValidChat(req.body);
    if (validChat === 0) {
        // insert into db...
        console.log('Chat was validated. -> POST')
        const chat = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.content.toString()),
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
        res.status(validChat);
        res.json({
            message: 'Missing name and/or content!'
        });
    }
});


/* Helper functions */

function isValidChat(chat) {
    if (chat.name && chat.name.toString().trim() !== '' &&
        chat.content && chat.content.toString().trim() !== '') return 0;
    else if (chat.name && chat.name.toString().trim() !== '') return 441;
    else if (chat.content && chat.content.toString().trim() !== '') return 442;
    else return 443;
}
