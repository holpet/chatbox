const router = require("express").Router();

/* db */
const Profile = require("../config/models/Profile");

/* other */
const getRandomUser = require("../lib/demoUserUtils");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/home", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      const profile = await Profile.findOne({ userID: req.user._id });
      res.render("home", {
        authenticated: true,
        username: req.user.username,
        profile: profile,
      });
    } else res.render("home", { authenticated: false });
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-auth-data", async (req, res) => {
  try {
    res.json({
      auth: req.isAuthenticated(),
      userID: req.isAuthenticated() ? req.user._id : null,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-random-user", async (req, res) => {
  const user = getRandomUser();
  res.json(user);
});

module.exports = router;
