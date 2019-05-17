const express = require("express");
const https = require('https')
const fs = require('fs')
const uuid = require("uuid/v1");
const User = require("../models/user");
const Playlist = require("../models/playlist");
const Music = require("../models/music");

const router = express.Router();


// Create Music
router.post("/createMusic", (req, res) => {
    const data = req.body.data;

    User.findOne({ token: data.token }, (err, user) => {
        if (user)
            if (+user.login + 31536000000 > new Date().getTime()) {
                data.uuid = uuid();
                data.owner_id = user.uuid
                data.owner_username = user.username
                data.createdDate = new Date()

                if (!fs.existsSync(`src/public/${data.owner_id}`))
                    fs.mkdirSync(`src/public/${data.owner_id}`)

                if (!fs.existsSync(`src/public/${data.owner_id}/musics`))
                    fs.mkdirSync(`src/public/${data.owner_id}/musics`)

                fs.mkdirSync(`src/public/${data.owner_id}/musics/${data.uuid}`)
                fs.mkdirSync(`src/public/${data.owner_id}/musics/${data.uuid}/image`)
                fs.mkdirSync(`src/public/${data.owner_id}/musics/${data.uuid}/audio`)

                if (data.photo.substr(0, 4) === "http") {

                    const file = fs.createWriteStream(`src/public/${data.owner_id}/musics/${data.uuid}/image/${data.uuid}.jpg`);

                    https.get("https://i.pinimg.com/originals/be/f1/a4/bef1a4dd9359b7ca253e5d01964ff761.jpg",
                        response => response.pipe(file)
                    );

                } else {
                    // Save image
                    const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

                    const imagePath = `src/public/${data.owner_id}/musics/${data.uuid}/image/`

                    const imageName = `${data.uuid}.${data.photo.split(";")[0].split("/")[1]}`

                    const buffer = new Buffer(imageData, 'base64');

                    fs.writeFile(imagePath + imageName, buffer, () => { });

                }

                data.photo = `http://127.0.0.1:3000/public/music?user=${data.owner_id}&music=${data.uuid}&file=image`

                // Save audio
                const audioData = data.audio.replace(/^data:audio\/\w+;base64,/, "");

                const audioPath = `src/public/${data.owner_id}/musics/${data.uuid}/audio/`

                const audioName = `${data.uuid}.${data.audio.split(";")[0].split("/")[1]}`

                const audioBuffer = new Buffer(audioData, 'base64');

                fs.writeFile(audioPath + audioName, audioBuffer, () => { });

                data.audio = `http://127.0.0.1:3000/public/music?user=${data.owner_id}&music=${data.uuid}&file=audio`

                new Music(data).save(res.send({ uuid: data.uuid, createdDate: data.createdDate }))
            }
            else res.send({ el: false })
        else res.send({ el: false })
    })
});


// Update Music
router.post("/updateMusic", (req, res) => {
    const data = req.body.data

    User.findOne({ token: data.token }, (err, user) => {
        if (user)
            Music.findOne({ uuid: data.uuid }, (err, music) => {
                if (music)
                    if (music.owner_id === user.uuid && +user.login + 31536000000 > new Date().getTime()) {
                        if (data.photo.substr(0, 4) !== "http") {
                            const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

                            const imagePath = `src/public/${music.owner_id}/musics/${data.uuid}/image/`

                            const imageName = `${data.uuid}.${data.photo.split(";")[0].split("/")[1]}`

                            const buffer = new Buffer(imageData, 'base64');

                            fs.readdir(imagePath, (err, image) => {
                                fs.unlink(`${imagePath}${image[0]}`, () =>
                                    fs.writeFile(imagePath + imageName, buffer, () => { })
                                )
                            })
                        }

                        if (data.audio.substr(0, 4) !== "http") {
                            const audioData = data.audio.replace(/^data:audio\/\w+;base64,/, "");

                            const audioPath = `src/public/${music.owner_id}/musics/${data.uuid}/audio/`

                            const audioName = `${data.uuid}.${data.audio.split(";")[0].split("/")[1]}`

                            const audioBuffer = new Buffer(audioData, 'base64');

                            fs.readdir(audioPath, (err, audio) =>
                                fs.unlink(`${audioPath}${audio[0]}`, () =>
                                    fs.writeFile(audioPath + audioName, audioBuffer, () => { })
                                )
                            )
                        }

                        music.name = data.name
                        music.description = data.description
                        music.lyrics = data.lyrics
                        music.artists = data.artists
                        music.categories = data.categories
                        music.tags = data.tags

                        music.save(res.send({ msg: "updated" }))
                    }
                    else res.send({ el: false })
                else res.send({ el: false })
            })
        else res.send({ el: false })
    })
})


// Delete Music
router.delete("/deleteMusic", (req, res) => {

    const data = req.query

    User.findOne({ token: data.token }, (err, user) => {
        if (user)
            Music.findOne({ uuid: data.music }, (err, music) => {
                if (music)
                    if (music.owner_id === user.uuid && +user.login + 31536000000 > new Date().getTime()) {
                        const path = `src/public/${music.owner_id}/musics/${music.uuid}/`

                        fs.readdir(`${path}image`, (err, image) => {
                            fs.unlink(`${path}image/${image[0]}`, () => fs.rmdir(`${path}image`, () =>
                                fs.readdir(`${path}audio`, (err, audio) => {
                                    fs.unlink(`${path}audio/${audio[0]}`, () => fs.rmdir(`${path}audio`, () =>
                                        fs.rmdir(`${path}`, () => { })
                                    ))
                                })
                            ))
                        })

                        for (let i in music.playlists)
                            Playlist.findOne({ uuid: music.playlists[i] }, (err, playlist) => {
                                if (playlist) {
                                    playlist.musics.splice(playlist.musics.indexOf(music.uuid), 1)
                                    playlist.save()
                                }
                            })

                        music.remove(res.send({ msg: "deleted" }))
                    }
                    else res.send({ el: false })
                else res.send({ el: false })
            })
        else res.send({ el: false })
    })

})


// Get User Musics
router.get('/getUserMusics', (req, res) => {
    const owner_id = req.query.user

    Music.find({ owner_id }, (err, musics) => {

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
                x.playlists = musics[i].playlists
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
    const uuid = req.query.music

    Music.findOne({ uuid }, (err, music) => {

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