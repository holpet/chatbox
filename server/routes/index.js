const router = require('express').Router();

/* helpers */
const messageUtils = require('../lib/messageUtils');
const registerUtils = require('../lib/registerUtils');
const storageUtils = require('../lib/storageUtils');
const searchUtils = require('../lib/searchUtils');
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
const { default: mongoose } = require('mongoose');


/**
 * -------------- POST ROUTES ----------------
 */

// CHATS: limited (using IP addr)
router.post('/chats', rateLimiter(10, 10), upload.any("files"), async (req, res) => {
    if (req.isAuthenticated()) req.body.name = req.user.username;
    if (messageUtils.isValidChat(req.body)) {
        try {
            const chat = await Chat.create({
                name: messageUtils.structureContent(req.body.name.toString(), false),
                userID: (req.isAuthenticated()) ? req.user._id : "",
                content: messageUtils.structureContent(req.body.content.toString(), true),
                img: req.files,
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
        res.status(442).json({error: 'Missing name and/or message.'});
    }
});

// LOGIN & LOGOUT
router.post('/login', passport.authenticate('local', {
    //successRedirect: '/profile',
    //failureRedirect: '/', 
}), (req, res, next) => {
    res.status(200).redirect('/' + req.user.username);
});

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile'] 
}), (req, res, next) => {
    console.log('auth in google.');
});

router.get('/auth/google/chatbox', 
  passport.authenticate('google', { failureRedirect: '/home' }),
  function(req, res) {
    // Successful authentication, redirect to custom page.
    res.status(200).redirect('/' + req.user.username);
  });

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        console.log('User logged out.');
        res.redirect('/home');
      });
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
            const savedUser = await 
                user.save()
                    .then(user => {
                        console.log('User registered.');
                        return user;
                    });
            const profile = await Profile.create({
                username: usernameToSave,
                userID: savedUser._id,
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
        console.log(error);
    }
});


router.post('/search', async (req, res) => {
    try {
        const searched = searchUtils.stripSpecialChars(req.body.search);
        if (req.isAuthenticated()) {
            const profile = await Profile.findOne({ userID: req.user._id });
            res.render('search', { authenticated: true, username: req.user.username, profile: profile, search: searched });
        }
        else res.render('search', { authenticated: false, search: searched });
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/search/:phrase', async (req, res) => {
    try {
        const chats = await Chat.find({});
        const searched = req.params.phrase;
        console.log('searched phrase: ', searched);

        // TODO: search through name and username

        // 0 - no matches
        var partial_match = []; // 1
        var full_match = []; // 2

        chats.forEach(chat => {
            const match = searchUtils.comparePhrase(chat.content, searched);
            if (match == 1) partial_match.push(chat);
            else if (match == 2) full_match.push(chat);
            else console.log('NO MATCH');
        });

        console.log('partial: ', partial_match);
        console.log('full: ', full_match);
        const matches = full_match.concat(partial_match);
        console.log('MATCHES: ', matches);
        res.json(matches);

    }
    catch (error) {
        console.log(error);
    }
})



 /**
 * -------------- GET ROUTES ----------------
 */

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/home', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const profile = await Profile.findOne({ userID: req.user._id });
            res.render('home', { authenticated: true, username: req.user.username, profile: profile });
        }
        else res.render('home', { authenticated: false });
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/chats', async (req, res) => {
    try {
        await Chat.find().then(chats => res.json(chats));
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/chats/:userid', async (req, res) => {
    const userID = req.params.userid;
    try {
        await Chat.find({ userID: userID }).exec().then(chats => res.json(chats));
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/profiles', async (req, res) => {
    try {
        await Profile.find().then(profiles => res.json(profiles));
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/profiles/:userid', async (req, res) => {
    const userID = req.params.userid;
    try {
        await Profile.findOne({ userID: userID }).exec().then(profile => res.json([profile]));
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/stats-:userid', async (req, res) => {
    try {
        const profile = await Profile.findOne({ userID: req.params.userid });
        const chats = await Chat.find({ userID: req.params.userid });
        const stats = { 
            following: profile.following,
            followers: profile.followers,
            chats: chats
        }
        res.status(200).json(stats);
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/isfollowing-:userid', async (req, res) => {
    try {
        const profile = await Profile.findOne({ userID: req.user._id });
        if (profile.following.includes(req.params.userid)) res.send(true);
        else res.send(false);
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/follow-:userid', isAuth, async (req, res) => {
    try {
        // change following
        const userToFollow = mongoose.Types.ObjectId(req.params.userid);
        var profile = await Profile.findOne({ userID: req.user._id });
        var array = profile.following;
        if (array.includes(userToFollow)) return; 
        array.push(userToFollow);
        var update = { following: array };
        var filter = { userID: req.user._id };
        await 
            Profile.findOneAndUpdate(filter, update, { new: true })
                .then(() => console.log('Added to following.'));
        // change followers
        const userThatFollows = mongoose.Types.ObjectId(req.user._id);
        profile = await Profile.findOne({ userID: req.params.userid });
        array = profile.followers;
        if (array.includes(userThatFollows)) return; 
        array.push(userThatFollows);
        update = { followers: array };
        filter = { userID: req.params.userid };
        await 
            Profile.findOneAndUpdate(filter, update, { new: true })
                .then(() => {
                    console.log('Added to followers.'); 
                    res.send(true);
                });
    }
    catch (error) {
        console.log(error);
    }
});

router.get('/unfollow-:userid', isAuth, async (req, res) => {
    try {
        // change following
        const userToUnfollow = mongoose.Types.ObjectId(req.params.userid);
        var profile = await Profile.findOne({ userID: req.user._id });
        var array = profile.following;
        if (!array.includes(userToUnfollow)) return;
        var index = array.indexOf(userToUnfollow);
        array.splice(index, 1);
        var update = { following: array };
        var filter = { userID: req.user._id };
        await 
            Profile.findOneAndUpdate(filter, update, { new: true })
                .then(() => console.log('Removed from following.'));
        // change followers
        const userThatUnfollows = mongoose.Types.ObjectId(req.user._id);
        profile = await Profile.findOne({ userID: req.params.userid });
        array = profile.followers;
        if (!array.includes(userThatUnfollows)) return;
        index = array.indexOf(userThatUnfollows);
        array.splice(index, 1);
        update = { followers: array };
        filter = { userID: req.params.userid };
        await 
            Profile.findOneAndUpdate(filter, update, { new: true })
                .then(() => {
                    console.log('Removed to followers.'); 
                    res.send(false);
                });
    }
    catch (error) {
        console.log(error);
    }
});



/* ---- username search ----*/
router.get('/:username', async (req, res, next) => {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username: username });
        const authUsername = (req.isAuthenticated()) ? req.user.username : "";
        if (user) {
            const profile = await Profile.findOne({ userID: user._id });
            res.render('profile', { exists: true, authenticated: req.isAuthenticated(), username: authUsername, profile: profile, usernameToDisplay: username });
        }
        else {
            res.render('profile', { exists: false, authenticated: req.isAuthenticated(), username: authUsername, profile: {}, usernameToDisplay: username });
        }
    }
    catch (error) {
        console.log(error);
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