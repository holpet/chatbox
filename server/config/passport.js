const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
//var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        var user = await User.findOne({ email: email });
        if (!user) user = await User.findOne({ username: email });
        if (!user) {
          //console.log("No such user registered.");
          return done(null, false, {
            message: "Username / email not registered.",
          });
        }
        // User exists, so now we verify password
        const isMatch = await user.isValidPassword(password);
        if (isMatch) return done(null, user, { status: 200 });
        else
          return done(null, false, {
            message: "Incorrect password.",
          });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// ************ preparation for Google auth ************ //
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:5050/auth/google/chatbox",
//       userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // Google+ accounts deprecated -> workaround
//     },
//     function (accessToken, refreshToken, profile, cb) {
//       User.findOrCreate({ googleId: profile.id }, function (err, user) {
//         console.log(user);
//         return cb(err, user);
//       });
//     }
//   )
// );
