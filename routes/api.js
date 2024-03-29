/*
 * Nova Trauben (C) 2019
 *
 * This file is part of QuiteLive.
 * https://www.github.com/1fabunicorn/QuiteLive-API
 *
 * QuiteLive is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QuiteLive is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QuiteLive.  If not, see <https://www.gnu.org/licenses/>.
 */

const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Video = require("../src/Videos");


require("../models/Auths");
const AuthSchema = mongoose.model("AuthSchema");

router.get("/get_init_key", (req, res) => {
  /**
   * hello
   * @type {string} thing
   */
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
