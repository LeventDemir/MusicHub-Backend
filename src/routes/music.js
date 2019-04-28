const express = require("express");
const uuid = require("uuid/v1");
const User = require("../models/user");
const Playlist = require("../models/playlist");
const Music = require("../models/music");

const router = express.Router();

// Create Music

router.post("/createMusic", (req, res) => {
  const data = req.body.data;

  User.findOne({ uuid: data.owner }, (err, user) => {
    if (user) {
      data.uuid = uuid();

      new Music(data).save(res.status(200).send())
    } else res.send({ el: "owner" });
  });
});

// Get Musics
// For development

router.get("/musics", (req, res) => {
  Music.find({}, (err, users) => {
    res.send(users);
  });
});

module.exports = router;
