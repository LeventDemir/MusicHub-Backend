const express = require("express");
const uuid = require("uuid/v1");
const User = require("../models/user");
const Playlist = require("../models/playlist");
const Music = require("../models/music");

const router = express.Router();


// Create Playlist
router.post("/createPlaylist", (req, res) => {
  const data = req.body.data;

  User.findOne({ uuid: data.owner }, (err, user) => {
    if (user) {
      data.uuid = uuid();
      new Playlist(data).save(res.status(200).send());
    } else res.send({ el: false });
  });
});


// Add music to playlist

router.post("/addMusicToPlaylist", (req, res) => {
  const data = req.body.data;

  Playlist.findOne({ uuid: data.playlist }, (err, playlist) => {
    if (playlist) {
      if (playlist.musics.includes(data.music)) {
        res.send({ msg: "there is" });
      } else {
        Music.findOne({ uuid: data.music }, (err, music) => {
          if (music) {
            music.playlists.push(data.playlist);
            playlist.musics.push(data.music);
            music.save(playlist.save(res.send({ msg: "updated" })));
          } else res.send({ el: false });
        });
      }
    } else res.send({ el: false });
  });
});


router.get("/getUserPlaylists", (req, res) => {

  const data = req.query.user

  Playlist.find({ owner: data }, (err, playlists) => {
    if (playlists) {

      const data = []

      playlists.forEach(playlist => {
        let x = {}

        x.uuid = playlist.uuid
        x.owner = playlist.owner
        x.photo = playlist.photo
        x.name = playlist.name
        x.musics = playlist.musics
        x.createdDate = playlist.createdDate

        data.push(x)
      })

      res.send(data)
    }
    else res.send({ el: false })
  })

})

// Get Playlists
// For development

router.get("/playlists", (req, res) => {
  Playlist.find({}, (err, users) => {
    res.send(users);
  });
});

module.exports = router;
