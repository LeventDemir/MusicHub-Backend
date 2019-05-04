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


module.exports = router;