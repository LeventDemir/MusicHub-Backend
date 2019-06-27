const express = require("express");
const https = require('https')
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

        const path = `src/public/${data.owner_id}/playlists/${data.uuid}`

        fs.mkdirSync(path)

        if (data.photo.substr(0, 4) === "http") {

          const file = fs.createWriteStream(`${path}/${data.uuid}.jpg`);

          https.get("https://musichubs.herokuapp.com/public/base?image=playlist",
            response => response.pipe(file)
          );

        } else {
          const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

          const imageName = `${data.uuid}.${data.photo.split(";")[0].split("/")[1]}`

          const buffer = new Buffer(imageData, 'base64');

          fs.writeFileSync(`${path}/${imageName}`, buffer);
        }

        data.photo = `https://musichubs.herokuapp.com/public/playlist?user=${data.owner_id}&playlist=${data.uuid}`
        data.createdDate = new Date()

        new Playlist(data).save(res.send({ uuid: data.uuid, createdDate: data.createdDate }));
      }
      else res.send({ el: false })
    else res.send({ el: false })

  })
});


// Update playlist
router.post('/updatePlaylist', (req, res) => {
  const data = req.body.data

  User.findOne({ token: data.token }, (err, user) => {
    if (user)
      if (+user.login + 31536000000 > new Date().getTime())
        Playlist.findOne({ uuid: data.playlist }, (err, playlist) => {
          if (playlist)
            if (playlist.owner_id === user.uuid) {
              playlist.name = data.name

              if (data.photo.substr(0, 4) !== "http") {
                const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

                const imagePath = `src/public/${playlist.owner_id}/playlists/${playlist.uuid}/`

                const imageName = `${playlist.uuid}.${data.photo.split(";")[0].split("/")[1]}`

                const buffer = new Buffer(imageData, 'base64');

                fs.readdir(imagePath, (err, image) => {
                  fs.unlink(`${imagePath}${image[0]}`, () =>
                    fs.writeFile(imagePath + imageName, buffer, () => { })
                  )
                })
              }

              playlist.save(res.send({ msg: 'updated' }))
            }
            else res.send({ el: false })
          else res.send({ el: false })
        })
      else res.send({ el: false })
    else res.send({ el: false })
  })
})


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


// Remove music from playlist
router.delete('/removeMusicFromPlaylist', (req, res) => {
  const data = req.body.data

  User.findOne({ token: data.token }, (err, user) => {
    if (user)
      if (+user.login + 31536000000 > new Date().getTime())
        Playlist.findOne({ uuid: data.playlist }, (err, playlist) => {
          if (playlist)
            if (playlist.owner_id === user.uuid) {
              playlist.musics.splice(playlist.musics.indexOf(data.music), 1)
              playlist.save()

              Music.findOne({ uuid: data.music }, (err, music) => {
                if (music) {
                  music.playlists.splice(music.playlists.indexOf(data.playlist), 1)
                  music.save(res.send({ msg: 'removed' }))
                }
                else res.send({ el: false })
              })
            }
            else res.send({ el: false })
          else res.send({ el: false })
        })
      else res.send({ el: false })
    else res.send({ el: false })
  })
})


// Remove playlist
router.delete('/removePlaylist', (req, res) => {
  const data = req.body

  User.findOne({ token: data.token }, (err, user) => {
    if (user)
      if (+user.login + 31536000000 > new Date().getTime())
        Playlist.findOne({ uuid: data.playlist }, (err, playlist) => {
          if (playlist)
            if (playlist.owner_id === user.uuid) {
              for (let i in playlist.musics) {
                Music.findOne({ uuid: playlist.musics[i] }, (err, music) => {
                  if (music) {
                    music.playlists.splice(playlist.musics[i], 1)
                    music.save()
                  }
                })
              }

              const path = `src/public/${playlist.owner_id}/playlists/${playlist.uuid}`

              fs.readdir(path, (err, file) => {
                if (file)
                  fs.unlink(`${path}/${file[0]}`, () => fs.rmdir(path, () => { }))
              })

              playlist.remove(res.send({ msg: 'deleted' }))
            }
            else res.send({ el: false })
          else res.send({ el: false })
        })
      else res.send({ el: false })
    else res.send({ el: false })
  })
})


// Get user playlists
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


module.exports = router;