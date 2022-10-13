const router = require("express").Router();
const isAuth = require("./middleware/auth").isAuth;
const messageUtils = require("../lib/messageUtils");

/* image storage */
const upload = require("./middleware/imgStore");

/* db */
const Profile = require("../config/models/Profile");
const User = require("../config/models/User");

// PROFILE EDIT.
const cpUpload = upload.fields([
  { name: "bg", maxCount: 1 },
  { name: "icon", maxCount: 1 },
]);
router.post("/profile", isAuth, cpUpload, async (req, res) => {
  const filter = req.user.username;
  try {
    const createUpdate = () => {
      var update = {};
      if (req.files !== undefined) {
        if (req.files["bg"] !== undefined) {
          update.bg = "/" + filter + "/bg/" + req.files["bg"][0].filename;
        }
        if (req.files["icon"] !== undefined) {
          update.icon = "/" + filter + "/icon/" + req.files["icon"][0].filename;
        }
      }
      update.name = messageUtils.structureContent(req.body.name, false);
      update.desc = messageUtils.structureContent(req.body.desc, true);
      return update;
    };
    const update = createUpdate();
    console.log(update);
    await Profile.findOneAndUpdate({ username: filter }, update, {
      new: true,
    }).then((profile) => {
      console.log(profile);
      console.log("Profile has been updated.");
      res.status(200).redirect("/" + req.user.username);
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/profiles", async (req, res) => {
  try {
    await Profile.find().then((profiles) => res.json(profiles));
  } catch (error) {
    console.log(error);
  }
});

router.get("/profiles/:userid", async (req, res) => {
  const userID = req.params.userid;
  try {
    await Profile.findOne({ userID: userID })
      .exec()
      .then((profile) => res.json([profile]));
  } catch (error) {
    console.log(error);
  }
});

/* ---- username search ----*/
router.get("/:username", async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username: username });
    const authUsername = req.isAuthenticated() ? req.user.username : "";
    if (user) {
      const profile = await Profile.findOne({ userID: user._id });
      res.render("profile", {
        exists: true,
        authenticated: req.isAuthenticated(),
        username: authUsername,
        profile: profile,
        usernameToDisplay: username,
      });
    } else {
      res.render("profile", {
        exists: false,
        authenticated: req.isAuthenticated(),
        username: authUsername,
        profile: {},
        usernameToDisplay: username,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
