const storageUtils = require("../../lib/storageUtils");

/* image storage */
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.user === undefined) {
      const dir = "./public/uploads/___" + file.fieldname + "/";
      storageUtils.ensureDirExists(dir);
      cb(null, dir);
    } else {
      const dir =
        "./public/uploads/" + req.user.username + "/" + file.fieldname + "/";
      storageUtils.ensureDirExists(dir);
      cb(null, dir);
    }
  },
  filename: function (req, file, cb) {
    if (req.user === undefined) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      storageUtils.deleteFileByPrep(file.fieldname, req.user.username); // delete old file
      cb(null, file.fieldname + "-" + file.originalname);
    }
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else cb(new Error("File rejected: incorrect format."), false);
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
