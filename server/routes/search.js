const router = require("express").Router();
const Chat = require("../config/models/Chat");
const Profile = require("../config/models/Profile");

/* helpers */
const searchUtils = require("../lib/searchUtils");

router.post("/search", async (req, res) => {
  try {
    const searched = searchUtils.stripSpecialChars(req.body.search);
    if (req.isAuthenticated()) {
      const profile = await Profile.findOne({ userID: req.user._id });
      res.render("search", {
        authenticated: true,
        username: req.user.username,
        profile: profile,
        search: searched,
      });
    } else res.render("search", { authenticated: false, search: searched });
  } catch (error) {
    console.log(error);
  }
});

router.get("/search/:phrase", async (req, res) => {
  try {
    /* // simple search
    let data = await Chat.find({
      $or: [
        { name: { $regex: req.params.phrase, $options: "i" } },
        { content: { $regex: req.params.phrase, $options: "i" } },
      ],
    });
    */

    /* expanded search: returns chat by priority (closest to match) */
    const chats = await Chat.find({});
    const searched = req.params.phrase;
    console.log("searched phrase: ", searched);

    // 0 - no matches
    var partial_match = []; // 1
    var full_match = []; // 2

    chats.forEach((chat) => {
      const match_content = searchUtils.comparePhrase(chat.content, searched);
      const match_name = searchUtils.comparePhrase(chat.name, searched);
      const match = Math.max(match_content, match_name);
      if (match == 2) full_match.push(chat);
      else if (match == 1) partial_match.push(chat);
    });
    const matches = full_match.concat(partial_match);
    res.json(matches);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
