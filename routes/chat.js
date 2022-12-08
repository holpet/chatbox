const router = require("express").Router();
const messageUtils = require("../lib/messageUtils");
const rateLimiter = require("../lib/rateLimiter");

/* image storage */
const upload = require("./middleware/imgStore");

/* db */
const Chat = require("../config/models/Chat");

// CHATS: limited (using IP addr)
router.post("/", rateLimiter(10, 10), upload.any("files"), async (req, res) => {
  if (req.isAuthenticated()) req.body.name = req.user.username;
  if (messageUtils.isValidChat(req.body)) {
    try {
      const chat = await Chat.create({
        name: messageUtils.structureContent(req.body.name.toString(), false),
        userID: req.isAuthenticated() ? req.user._id : "",
        content: messageUtils.structureContent(
          req.body.content.toString(),
          true
        ),
        img: req.files,
        created: new Date(),
      });
      await chat.save().then((chat) => {
        res.json(chat);
      });
    } catch (error) {
      console.log(error.message);
    }
  } else {
    res.status(442).json({ error: "Missing name and/or message." });
  }
});

router.get("/", async (req, res) => {
  try {
    await Chat.find().then((chats) => res.json(chats));
  } catch (error) {
    console.log(error);
  }
});

router.get("/:userid", async (req, res) => {
  const userID = req.params.userid;
  try {
    await Chat.find({ userID: userID })
      .exec()
      .then((chats) => res.json(chats));
  } catch (error) {
    console.log(error);
  }
});

router.delete("/:chatid", async (req, res) => {
  try {
    const deletedFile = await Chat.findOneAndDelete({ _id: req.params.chatid });
    if (deletedFile) res.json({ isDeleted: true });
    else res.json({ isDeleted: false });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
