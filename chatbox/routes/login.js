const router = require("express").Router();

/* authentication */
const passport = require("passport");
require("../config/passport");

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/login-success",
    failureRedirect: "/login-failure",
    failureMessage: "Incorrect username or password.",
  })
);

router.get("/login-success", (req, res) => {
  res.status(200).redirect("/" + req.user.username);
});

router.get("/login-failure", (req, res) => {
  res.status(205).send({ error: "Incorrect username or password." });
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    console.log("User logged out.");
    res.redirect("/home");
  });
});

// ************* preparation for google auth ************* //
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile"],
  }),
  (req, res, next) => {
    console.log("auth in google.");
  }
);

router.get(
  "/auth/google/chatbox",
  passport.authenticate("google", { failureRedirect: "/home" }),
  function (req, res) {
    // Successful authentication, redirect to custom page.
    res.status(200).redirect("/" + req.user.username);
  }
);

module.exports = router;
