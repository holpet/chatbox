const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const expressLayouts = require('express-ejs-layouts');
require('./config/passport');
require('dotenv').config(); //{path: '../.env'}

/* ROUTES */
const routes = require('./routes');

/* MIDDLEWARE */

// headers & parsing
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sessions
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 24 * 60 * 60, // 1 day
        secure: false,
        sameSite: false,
        httpOnly: true,
    }
}));

// authentication
app.use(passport.initialize());
app.use(passport.session());

// static files
app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/uploads', express.static(__dirname + 'public/uploads'));

// view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layout/layout');


// ~~~ print statements for development ~~~ //
/*
app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});*/
// ^^^ to be deleted ^^^ //


// USE ROUTES
app.use(routes);


/**********************************************************/


/* Start server */
const start = function() {
    try {
        app.listen(process.env.PORT, () => {
            console.log(`Running server at localhost: ${process.env.PORT}`);
        });
    }
    catch (error) {
        throw boomify(error);
    };
}
start();

