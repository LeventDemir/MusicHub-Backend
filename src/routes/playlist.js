const express = require("express");
const http = require('http')
const fs = require('fs')
const uuid = require("uuid/v1");
const User = require("../models/user");
const Playlist = require("../models/playlist");
const Music = require("../models/music");

const router = express.Router();


// Create Playlist
router.post("/createPlaylist", (req, res) => {
  const data = req.body.data;

  User.findOne({ token: data.token }, (err, user) => {

    if (user)
      if (+user.login + 31536000000 > new Date().getTime()) {
        data.uuid = uuid();
        data.owner_id = user.uuid
        data.owner_username = user.username

        if (!fs.existsSync(`src/public/${data.owner_id}/playlists`))
          fs.mkdirSync(`src/public/${data.owner_id}/playlists`)

        fs.mkdirSync(`src/public/${data.owner_id}/playlists/${data.uuid}`)

        if (data.photo.substr(0, 4) === "http") {

          const file = fs.createWriteStream(`src/public/${data.owner_id}/playlists/${data.uuid}/${data.uuid}.jpg`);

          http.get("http://fordhampoliticalreview.org/wp-content/uploads/2016/09/mic-headphones-silhouette-bw.jpg",
            response => response.pipe(file)
          );

        } else {
          const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

          const imagePath = `src/public/${data.owner_id}/playlists/${data.uuid}/`

          const imageName = `${data.uuid}.${data.photo.split(";")[0].split("/")[1]}`

          const buffer = new Buffer(imageData, 'base64');

          fs.writeFile(imagePath + imageName, buffer, () => { });
        }

        data.photo = `http://127.0.0.1:3000/public/playlist?user=${data.owner_id}&playlist=${data.uuid}`

        new Playlist(data).save(res.status(200).send());
      }
      else res.send({ el: false })
    else res.send({ el: false })

  })
});


// Add music to playlist
router.post("/addMusicToPlaylist", (req, res) => {
  const data = req.body.data;

  User.findOne({ token: data.token }, (err, user) => {
    if (user)
      if (+user.login + 31536000000 > new Date().getTime())
        Playlist.findOne({ uuid: data.playlist, owner_id: user.uuid }, (err, playlist) => {
          if (playlist)
            if (!playlist.musics.includes(data.music))
              Music.findOne({ uuid: data.music }, (err, music) => {
                if (music) {
                  playlist.musics.push(data.music);
                  music.playlists.push(data.playlist);
                  playlist.save(music.save(res.send({ msg: "updated" })));
                }
                else res.send({ el: false })
              })
            else res.send({ msg: "There is" })
          else res.send({ el: false })
        })
      else res.send({ el: false })
    else res.send({ el: false })
  })
});


router.get("/getUserPlaylists", (req, res) => {

  const data = req.query.user

  Playlist.find({ owner_id: data }, (err, playlists) => {
    if (playlists) {

      const data = []

      playlists.forEach(playlist => {
        let x = {}

        x.uuid = playlist.uuid
        x.owner_id = playlist.owner_id
        x.owner_username = playlist.owner_username
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
