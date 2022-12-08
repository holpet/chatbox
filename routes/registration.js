const router = require("express").Router();
const registerUtils = require("../lib/registerUtils");

/* db */
const User = require("../config/models/User");
const Profile = require("../config/models/Profile");

// REGISTER
router.post("/", async (req, res, next) => {
  const usernameToSave = req.body.username;
  const emailToSave = req.body.email;
  Promise.all([
    registerUtils.isValidUserData({ username: usernameToSave }),
    registerUtils.isValidUserData({ email: emailToSave }),
  ])
    .then(async () => {
      try {
        // create user
        const user = await User.create({
          username: usernameToSave,
          email: emailToSave,
          password: req.body.password,
          salt: req.body.password,
        });
        const savedUser = await user.save().then((user) => {
          console.log("User registered.");
          return user;
        });

        //create profile
        const profile = await Profile.create({
          username: usernameToSave,
          userID: savedUser._id,
          name: usernameToSave,
          desc: "Hello, I'm " + usernameToSave + ". Welcome to my profile!",
        });
        await profile.save().then((profile) => {
          console.log("Default profile added.");
          res.status(200).json(profile);
        });
      } catch (error) {
        console.log(error.message);
      }
    })
    .catch((dbData) => {
      if (dbData.username === usernameToSave) {
        console.log("User not registered.");
        res.status(480);
        res.json({ error: "Username already in use." });
      } else if (dbData.email === emailToSave) {
        console.log("User not registered.");
        res.status(481);
        res.json({ error: "Email already in use." });
      } else {
        console.log("Error during registration.");
        res.status(450);
        res.json({ error: "Error during registration." });
      }
    });
});

module.exports = router;
