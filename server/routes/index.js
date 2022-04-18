const router = require('express').Router();
const passport = require('passport');
require('../config/passport');
const messageUtils = require('../lib/messageUtils');
const registerUtils = require('../lib/registerUtils');
const rateLimiter = require('../lib/rateLimiter');
const isAuth = require('./authMiddleware').isAuth;

const User = require('../config/models/User');
const Chat = require('../config/models/Chat');


/**
 * -------------- POST ROUTES ----------------
 */


router.post('/login', passport.authenticate('local', {
    successRedirect: '/protected-route',
    failureRedirect: '/login-failure', 
}), (req, res, next) => {
    res.status(200);
    res.json(req.user);
});

router.post('/register', async (req, res, next) => {
    const usernameToSave = req.body.username;
    const emailToSave = req.body.email;
    Promise.all([
        registerUtils.isValidUserData({username:  usernameToSave}),
        registerUtils.isValidUserData({email: emailToSave})
    ])
    .then(async () => {
        try {
            const user = await User.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                salt: req.body.password
                });
            await 
                user.save()
                    .then(user => {
                        res.status(200);
                        res.json(user);
                        console.log('User registered.');
                    });
        }
        catch (error) {
            console.log(error.message);
            throw boomify(error);
        }
    })
    .catch((dbData) => {
        if (dbData.username === usernameToSave) {
            console.log('User not registered.');
            res.status(480);
            res.json({error: 'Username already in use.'});
        } 
        else if (dbData.email === emailToSave) {
            console.log('User not registered.');
            res.status(481);
            res.json({error: 'Email already in use.'});
        }
        else {
            console.log('Error during registration.');
            res.status(450);
            res.json({error: 'Error during registration.'});
        }
    });
 });



 /**
 * -------------- GET ROUTES ----------------
 */

 /* GET CALLS - unlimited */
router.get('/', (req, res) => {
    console.log(req.session);
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'text/html')
        res.write('<p>views: ' + req.session.views + '</p>')
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
        res.end()
    } 
    else {
        req.session.views = 1
        res.end('welcome to the session demo. refresh!')
    }
    /*
    res.json({
        message: 'Hello World!'
    });*/
});

router.get('/chats', async (req, res) => {
    try {
        await Chat
            .find()
            .then(chats => {
                res.json(chats);
            });
    }
    catch (error) {
        console.log(e.message);
        throw boomify(error);
    }
});


/* POST CALLS - limited (using IP addr) */
router.post('/chats', rateLimiter(10, 10), async (req, res) => {
    if (messageUtils.isValidChat(req.body)) {
        try {
            const chat = await Chat.create({
                name: messageUtils.structureContent(req.body.name.toString(), false),
                content: messageUtils.structureContent(req.body.content.toString(), true),
                created: new Date()
            });
            await 
                chat.save()
                    .then(chat => {
                        res.json(chat);
                    });
        }
        catch (error) {
            console.log(error.message);
            throw boomify(error);
        }
    }
    else {
        res.status(442);
        res.json({error: 'Missing name and/or message.'});
    }
});



router.get('/protected-route', isAuth, (req, res, next) => {
    console.log('protected-route: made it! user is authenticated and logged in.');
    res.json({message: 'User authenticated.'});
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    console.log('User logged out.');
    res.json({message: 'User logged out.'}).redirect('/');
});

router.get('/login-success', isAuth, (req, res, next) => {
    console.log('login-success: user is authenticated and logged in.');
    res.json({message: 'User logged in.'});
});

router.get('/login-failure', (req, res, next) => {
    res.status(401).json({error: 'Wrong username / email or password.'});
});

router.get('/is-auth', (req, res, next) => {
    if (req.isAuthenticated()) res.status(200).json({message: 'Use is logged in.'});
    else res.status(401).json({message: 'User is not logged in.'});
})



module.exports = router;