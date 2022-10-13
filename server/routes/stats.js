const router = require("express").Router();
const isAuth = require("./middleware/auth").isAuth;

/* db */
const { default: mongoose } = require("mongoose");
const Chat = require("../config/models/Chat");
const Profile = require("../config/models/Profile");

router.get("/stats-:userid", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userID: req.params.userid });
    const chats = await Chat.find({ userID: req.params.userid });
    const stats = {
      following: profile.following,
      followers: profile.followers,
      chats: chats,
    };
    res.status(200).json(stats);
  } catch (error) {
    console.log(error);
  }
});

router.get("/isfollowing-:userid", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userID: req.user._id });
    if (profile.following.includes(req.params.userid)) res.send(true);
    else res.send(false);
  } catch (error) {
    console.log(error);
  }
});

router.get("/follow-:userid", isAuth, async (req, res) => {
  try {
    // change following
    const userToFollow = mongoose.Types.ObjectId(req.params.userid);
    var profile = await Profile.findOne({ userID: req.user._id });
    var array = profile.following;
    if (array.includes(userToFollow)) return;
    array.push(userToFollow);
    var update = { following: array };
    var filter = { userID: req.user._id };
    await Profile.findOneAndUpdate(filter, update, { new: true }).then(() =>
      console.log("Added to following.")
    );
    // change followers
    const userThatFollows = mongoose.Types.ObjectId(req.user._id);
    profile = await Profile.findOne({ userID: req.params.userid });
    array = profile.followers;
    if (array.includes(userThatFollows)) return;
    array.push(userThatFollows);
    update = { followers: array };
    filter = { userID: req.params.userid };
    await Profile.findOneAndUpdate(filter, update, { new: true }).then(() => {
      console.log("Added to followers.");
      res.send(true);
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/unfollow-:userid", isAuth, async (req, res) => {
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
    await Profile.findOneAndUpdate(filter, update, { new: true }).then(() =>
      console.log("Removed from following.")
    );
    // change followers
    const userThatUnfollows = mongoose.Types.ObjectId(req.user._id);
    profile = await Profile.findOne({ userID: req.params.userid });
    array = profile.followers;
    if (!array.includes(userThatUnfollows)) return;
    index = array.indexOf(userThatUnfollows);
    array.splice(index, 1);
    update = { followers: array };
    filter = { userID: req.params.userid };
    await Profile.findOneAndUpdate(filter, update, { new: true }).then(() => {
      console.log("Removed to followers.");
      res.send(false);
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
