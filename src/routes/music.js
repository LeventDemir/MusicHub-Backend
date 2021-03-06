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
                data.playlists = []

                if (!fs.existsSync(`src/public/${data.owner_id}`))
                    fs.mkdirSync(`src/public/${data.owner_id}`)

                if (!fs.existsSync(`src/public/${data.owner_id}/musics`))
                    fs.mkdirSync(`src/public/${data.owner_id}/musics`)

                const path = `src/public/${data.owner_id}/musics/${data.uuid}`

                fs.mkdirSync(path)
                fs.mkdirSync(`${path}/image`)
                fs.mkdirSync(`${path}/audio`)

                if (data.photo.substr(0, 4) === "http") {

                    const file = fs.createWriteStream(`${path}/image/${data.uuid}.jpg`);

                    https.get("https://musichubs.herokuapp.com/public/base?image=music",
                        response => response.pipe(file)
                    );

                } else {
                    // Save image
                    const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

                    const imageName = `${data.uuid}.${data.photo.split(";")[0].split("/")[1]}`

                    const buffer = new Buffer(imageData, 'base64');

                    fs.writeFileSync(`${path}/image/${imageName}`, buffer);
                }

                const base_url = "http://127.0.0.1:3000/"

                data.photo = `${base_url}public/music?user=${data.owner_id}&music=${data.uuid}&file=image`

                // Save audio
                const audioData = data.audio.replace(/^data:audio\/\w+;base64,/, "");

                const audioName = `${data.uuid}.${data.audio.split(";")[0].split("/")[1]}`

                const buffer = new Buffer(audioData, 'base64');

                fs.writeFileSync(`${path}/audio/${audioName}`, buffer);

                data.audio = `${base_url}public/music?user=${data.owner_id}&music=${data.uuid}&file=audio`

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

                        const path = `src/public/${music.owner_id}/musics/${data.uuid}/`

                        if (data.photo.substr(0, 4) !== "http") {
                            const imageData = data.photo.replace(/^data:image\/\w+;base64,/, "");

                            const imageName = `${data.uuid}.${data.photo.split(";")[0].split("/")[1]}`

                            const buffer = new Buffer(imageData, 'base64');

                            fs.readdir(`${path}/image/`, (err, image) => {
                                fs.unlinkSync(`${path}/image/${image[0]}`)
                                fs.writeFileSync(`${path}/image/${imageName}`, buffer)
                            })
                        }

                        if (data.audio.substr(0, 4) !== "http") {
                            const audioData = data.audio.replace(/^data:audio\/\w+;base64,/, "");

                            const audioName = `${data.uuid}.${data.audio.split(";")[0].split("/")[1]}`

                            const audioBuffer = new Buffer(audioData, 'base64');

                            fs.readdir(`${path}/audio/`, (err, audio) => {
                                fs.unlinkSync(`${path}/audio/${audio[0]}`)
                                fs.writeFileSync(`${path}/audio/${audioName}`, audioBuffer)
                            })
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
                x.audio = musics[i].audio

                data.push(x)
            }

            res.send(data)
        } else res.send({ el: false })
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
        } else res.send({ el: false })
    })
})


// Get playlist musics
router.get('/getPlaylistMusics', (req, res) => {
    const playlist = req.query.playlist

    Music.find({ playlists: playlist }, (err, musics) => {
        if (musics) {
            const data = []

            for (let music in musics) {
                let x = {}

                x.uuid = musics[music].uuid
                x.photo = musics[music].photo
                x.owner_id = musics[music].owner_id
                x.owner_username = musics[music].owner_username
                x.name = musics[music].name
                x.description = musics[music].description
                x.lyrics = musics[music].lyrics
                x.artists = musics[music].artists
                x.playlists = musics[music].playlists
                x.categories = musics[music].categories
                x.tags = musics[music].tags
                x.audio = musics[music].audio

                data.push(x)
            }
            res.send(data)
        } else res.send({ el: false })
    })
})


// Get music
router.get('/getMusic', (req, res) => {
    const music = req.query.music

    Music.findOne({ uuid: music }, (err, music) => {
        if (music)
            res.send({
                uuid: music.uuid,
                owner_id: music.owner_id,
                owner_username: music.owner_username,
                photo: music.photo,
                name: music.name,
                description: music.description,
                lyrics: music.lyrics,
                artists: music.artists,
                playlists: music.playlists,
                categories: music.categories,
                tags: music.tags,
                audio: music.audio
            })
        else res.send({ el: false })
    })
})


// Get musics
router.get('/getMusics', (req, res) => {

    Music.find({}, (err, musics) => {
        if (musics) {
            const data = []

            const page = +req.query.page === 1 ? [0, 8] : [(+req.query.page * 8) - 8, 8 * +req.query.page]

            content = musics.slice(page[0], page[1])

            for (let music in content) {
                let x = {}

                x.uuid = content[music].uuid
                x.photo = content[music].photo
                x.name = content[music].name
                x.owner_id = content[music].owner_id
                x.owner_username = content[music].owner_username
                x.description = content[music].description
                x.lyrics = content[music].lyrics
                x.artists = content[music].artists
                x.playlists = content[music].playlists
                x.categories = content[music].categories
                x.tags = content[music].tags
                x.audio = content[music].audio

                data.push(x)
            }

            data.push({ pages: Math.ceil(musics.length / 8), currentPage: +req.query.page })

            res.send(data)
        } else res.send({ el: false })
    })

})


router.get('/search', (req, res) => {

    const query = req.query.query

    Music.find({
        $or: [
            { name: { $regex: query } },
            { owner_username: { $regex: query } },
            { description: { $regex: query } },
            { lyrics: { $regex: query } },
            { artists: { $regex: query } },
            { categories: { $regex: query } },
            { tags: { $regex: query } },
        ]
    }, (err, musics) => {
        if (musics) {

            const data = []

            for (music in musics) {
                let x = {}

                x.uuid = musics[music].uuid
                x.photo = musics[music].photo
                x.title = musics[music].name
                x.owner_id = musics[music].owner_id
                x.owner_username = musics[music].owner_username
                x.description = musics[music].description
                x.lyrics = musics[music].lyrics
                x.artists = musics[music].artists
                x.playlists = musics[music].playlists
                x.categories = musics[music].categories
                x.tags = musics[music].tags
                x.audio = musics[music].audio

                data.push(x)
            }

            Playlist.find({
                $or: [
                    { name: { $regex: query } },
                    { owner_username: { $regex: query } },
                ]
            }, (err, playlists) => {
                if (playlists) {

                    for (playlist in playlists) {
                        let x = {}

                        x.uuid = playlists[playlist].uuid
                        x.photo = playlists[playlist].photo
                        x.title = playlists[playlist].name
                        x.owner_id = playlists[playlist].owner_id
                        x.owner_username = playlists[playlist].owner_username
                        x.musics = playlists[playlist].musics
                        x.createdDate = playlists[playlist].createdDate

                        data.push(x)
                    }

                    res.send(data)

                } else res.send({ el: false })
            })

        } else res.send({ el: false })
    })


})


module.exports = router;