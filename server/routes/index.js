const router = require('express').Router();

/* helpers */
const messageUtils = require('../lib/messageUtils');
const registerUtils = require('../lib/registerUtils');
const storageUtils = require('../lib/storageUtils');
const rateLimiter = require('../lib/rateLimiter');
const isAuth = require('./authMiddleware').isAuth;

/* authentication */
const passport = require('passport');
require('../config/passport');

/* image storage */
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (req.user === undefined) {
            const dir = './public/uploads/___' + file.fieldname + '/';
            storageUtils.ensureDirExists(dir);
            cb(null, dir);
        }
        else {
            const dir = './public/uploads/' + req.user.username + '/' + file.fieldname + '/';
            storageUtils.ensureDirExists(dir);
            cb(null, dir);
        }
    },
    filename: function(req, file, cb) {
        if (req.user ===  undefined) {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname); 
        }
        else {
            storageUtils.deleteFileByPrep(file.fieldname, req.user.username); // delete old file
            cb(null, file.fieldname + '-' + file.originalname);
        }
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/gif') {
        cb(null, true);
    }
    else cb(new Error('File rejected: incorrect format.'), false)
}
const upload = multer({ storage: storage , limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
}, fileFilter: fileFilter});

/* db */
const User = require('../config/models/User');
const Chat = require('../config/models/Chat');
const Profile = require('../config/models/Profile');


/**
 * -------------- POST ROUTES ----------------
 */

// CHATS: limited (using IP addr)
router.post('/chats', rateLimiter(10, 10), upload.any("files"), async (req, res) => {
    console.log('in chats...');
    if (req.isAuthenticated()) req.body.name = req.user.username;
    if (messageUtils.isValidChat(req.body)) {
        try {
            const chat = await Chat.create({
                name: messageUtils.structureContent(req.body.name.toString(), false),
                registered: req.isAuthenticated(),
                content: messageUtils.structureContent(req.body.content.toString(), true),
                img: req.files,
                created: new Date()
            });
            await 
                chat.save()
                    .then(chat => {
                        console.log('in saving chat...');
                        res.json(chat);
                    });
        }
        catch (error) {
            console.log(error.message);
            throw boomify(error);
        }
    }
    else {
        res.status(442).json({error: 'Missing name and/or message.'});
    }
});

// LOGIN
router.post('/login', passport.authenticate('local', {
    //successRedirect: '/profile',
    //failureRedirect: '/', 
}), (req, res, next) => {
    res.status(200).redirect('/' + req.user.username);
});

// REGISTER
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
                username: usernameToSave,
                email: emailToSave,
                password: req.body.password,
                salt: req.body.password
                });
            await 
                user.save()
                    .then(user => {
                        //console.log(user);
                        console.log('User registered.');
                    });
            const profile = await Profile.create({
                username: usernameToSave,
                bg: "",
                icon: "",
                name: usernameToSave,
                desc: "Hello, I'm " + usernameToSave + ". Welcome to my profile!"
                });
            await 
                profile.save()
                    .then(profile => {
                        //console.log(profile);
                        console.log('Default profile added.');
                        res.status(200).json(profile);
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


// PROFILE EDIT.
const cpUpload = upload.fields([{ name: 'bg', maxCount: 1 }, { name: 'icon', maxCount: 1 }]);
router.post('/profile', isAuth, cpUpload, async (req, res) => {
    const filter = req.user.username;
    try {
        const createUpdate = () => {
            var update = {};
            if (req.files !== undefined) {
                if (req.files['bg'] !== undefined) {
                    update.bg = '/' + filter + '/bg/' + req.files['bg'][0].filename;
                }
                if (req.files['icon'] !== undefined) {
                    update.icon = '/' + filter + '/icon/' + req.files['icon'][0].filename;
                }
            }
            update.name = messageUtils.structureContent(req.body.name, false);
            update.desc = messageUtils.structureContent(req.body.desc, true);
            return update;
        }
        const update = createUpdate();
        await 
            Profile.findOneAndUpdate(filter, update, { new: true })
                .then(profile => {
                console.log('profile after update -> ' + profile);
                console.log('Profile has been updated.');
                res.status(200).redirect('/' + req.user.username);
        });
    }
    catch (error) {
        console.log(error.message);
    }
});


 /**
 * -------------- GET ROUTES ----------------
 */

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/home', async (req, res) => {
    if (req.isAuthenticated()) {
        const profile = await storageUtils.savedProfile(req.user.username);
        res.render('home', { authenticated: true, username: req.user.username, profile: profile });
    }
    else res.render('home', { authenticated: false });
});

router.get('/chats', async (req, res) => {
    try {
        await Chat.find().then(chats => res.json(chats));
    }
    catch (error) {
        console.log(e.message);
    }
});

router.get('/chats/:username', async (req, res) => {
    const username = req.params.username;
    //console.log('username from params: ' + username);
    try {
        await Chat.find({ name: username }).exec().then(chats => res.json(chats));
    }
    catch (error) {
        console.log(e.message);
    }
});

router.get('/profiles', async (req, res) => {
    try {
        await Profile.find().then(profiles => res.json(profiles));
    }
    catch (error) {
        console.log(e.message);
    }
});

router.get('/profiles/:username', async (req, res) => {
    const username = req.params.username;
    try {
        await Profile.findOne({ username: username }).exec().then(profile => res.json(profile));
    }
    catch (error) {
        console.log(e.message);
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    console.log('User logged out.');
    res.redirect('/home');
});

router.get('/is-auth', (req, res, next) => {
    if (req.isAuthenticated()) res.status(200).json({message: 'Use is logged in.'});
    else res.status(201).json({message: 'User is not logged in.'}); // 401 for GET error
})


/* ---- PARAM ROUTES ----*/
router.get('/:username', async (req, res, next) => {
    const username = req.params.username;
    const isUser = await storageUtils.isUser(username);
    //console.log(req.params['username'] + ' is user?: ' + isUser);
    if (isUser) {
        const profile = await storageUtils.savedProfile(username);
        res.render('profile', { exists: true, authenticated: req.isAuthenticated(), username: username, profile: profile });
    }
    else {
        var account = username;
        if (req.isAuthenticated()) account = req.user.username;
        res.render('profile', { exists: false, authenticated: req.isAuthenticated(), username: account, account: username, profile: {} });
    }
    
});


/***** HELPER FUNCTIONS *****/

/* count page views */
function countPageViews(req, res) {
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
}

module.exports = router;