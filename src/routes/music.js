const express = require("express");
const uuid = require("uuid/v1");
const User = require("../models/user");
const Playlist = require("../models/playlist");
const Music = require("../models/music");

const router = express.Router();


// Create Music
router.post("/createMusic", (req, res) => {
    const data = req.body.data;

    User.findOne({ uuid: data.owner_id }, (err, user) => {
        if (user) {
            data.uuid = uuid();
            data.createdDate = new Date()

            new Music(data).save(res.send({ uuid: data.uuid, createdDate: data.createdDate }))
        } else res.send({ el: false });
    });
});


// Update Music
router.post("/updateMusic", (req, res) => {
    const data = req.body.data

    Music.findOne({ uuid: data.uuid }, (err, music) => {
        if (music) {

            music.photo = data.photo
            music.name = data.name
            music.description = data.description
            music.lyrics = data.lyrics
            music.artists = data.artists
            music.playlists = data.playlists
            music.categories = data.categories
            music.tags = data.tags
            music.audio = data.audio

            music.save()

            res.send({ msg: "updated" })
        }
        else res.send({ el: false })
    })
})

// Delete Music
router.delete("/deleteMusic", (req, res) => {

    const music = req.query.music

    Music.findOne({ uuid: music }, (err, music) => {
        if (music) {
            music.remove()
            res.send({ msg: "deleted" })
        } else res.send({ el: false })
    })

})


// Get User Musics
router.get('/getUserMusics', (req, res) => {
    const data = req.query.user

    Music.find({ owner_id: data }, (err, musics) => {

        if (musics) {

            const data = []

            for (let i in musics) {
                let x = {}

                x.uuid = musics[i].uuid
                x.owner_id = musics[i].owner_id
                x.owner_username = musics[i].owner_username
                x.photo = musics[i].photo
                x.name = musics[i].name
                x.description = musics[i].description
                x.lyrics = musics[i].lyrics
                x.artists = musics[i].artists
                x.Playlist = musics[i].Playlist
                x.categories = musics[i].categories
                x.tags = musics[i].tags

                data.push(x)

                x = {}
            }

            res.send(data)
        }
        else res.send({ el: false })
    })
})


// Get User Music
router.get("/getUserMusic", (req, res) => {
    const data = req.query

    Music.findOne({ uuid: data.music }, (err, music) => {

        if (music) {
            const data = {}

            data.photo = music.photo
            data.name = music.name
            data.description = music.description
            data.lyrics = music.lyrics
            data.artists = music.artists
            data.playlists = music.playlists
            data.categories = music.categories
            data.tags = music.tags
            data.audio = music.audio

            res.send(data)
        }
        else res.send({ el: false })
    })
})


module.exports = router;



// const imagePath = `/src/public/${data.owner_id}/musics`

// if (!fs.exists(imagePath)) fs.mkdir(imagePath);

// const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

// const buf = new Buffer(imageData, 'base64');

// const imageName = `/${data.uuid}${new Date().getTime()}.${data.photo.split(";")[0].split("/")[1]}`

// fs.writeFile(imagePath + imageName, buf);