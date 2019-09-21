const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Video = require("../src/Video");


require("../models/Auths");
const AuthSchema = mongoose.model("AuthSchema");

router.get("/get_init_key", (req, res) => {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const newAuth = new AuthSchema({
    key: randomBytes
  });
  newAuth.save();
  // .catch(err => {
  //
  // })

  res.send({
    api_key: randomBytes
  });
});

router.post("/video_feed", (req, res) => {

});

module.exports = router;
