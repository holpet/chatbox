const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const expressLayouts = require("express-ejs-layouts");
require("./config/passport");
require("dotenv").config(); //{path: '../.env'}

/* ROUTES */
const routes = require("./routes");
const registerRoute = require("./routes/registration");
const loginRoute = require("./routes/login");
const chatRoute = require("./routes/chat");
const profileRoute = require("./routes/profile");
const statsRoute = require("./routes/stats");
const searchRoute = require("./routes/search");

/* MIDDLEWARE */

// headers & parsing
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sessions
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 24 * 60 * 60, // 1 day
      secure: false,
      sameSite: false,
      httpOnly: true,
    },
  })
);

// authentication
app.use(passport.initialize());
app.use(passport.session());

// static files
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));
app.use("/img", express.static(__dirname + "public/img"));
app.use("/uploads", express.static(__dirname + "public/uploads"));

// view engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "layout/layout");

// USE ROUTES
app.use(routes);
app.use("/chats", chatRoute);
app.use(statsRoute);
app.use("/register", registerRoute);
app.use(loginRoute);
app.use(searchRoute);
app.use(profileRoute);

/**********************************************************/

/* Start server */
const start = function () {
  const port = process.env.PORT ?? 5050;
  try {
    app.listen(port, () => {
      console.log(`Running server at port: ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
