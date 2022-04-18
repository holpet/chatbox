const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport');
require('dotenv').config(); //{path: '../.env'}

/* ROUTES */
const routes = require('./routes');

/* APP USE */
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
})


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

