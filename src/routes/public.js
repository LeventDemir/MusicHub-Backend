const express = require('express')
const router = express.Router()
const fs = require('fs')


const base_path = __dirname.split('routes')[0] + "public/"

router.get("/music", (req, res) => {

    const data = req.query

    const path = `${base_path}${data.user}/musics/${data.music}/${data.file}/`

    fs.readdir(path, (err, files) => {
        if (files) res.sendFile(path + files[0])
        else res.send({ error: 404 })
    })
})


router.get("/avatar", (req, res) => {

    const user = req.query.user

    const path = `${base_path}${user}/avatar/`

    fs.readdir(path, (err, files) => {
        if (files) res.sendFile(path + files[0])
        else res.send({ error: 404 })
    })

})


router.get("/playlist", (req, res) => {

    const data = req.query

    const path = `${base_path}${data.user}/playlists/${data.playlist}/`


    fs.readdir(path, (err, files) => {
        if (files) res.sendFile(path + files[0])
        else res.send({ error: 404 })
    })

})


router.get('/base', (req, res) => {
    if (req.query.image === 'avatar') res.sendFile(`${base_path}base/avatar.png`)
    else if (req.query.image === 'music') res.sendFile(`${base_path}base/music.jpg`)
    else res.sendFile(`${base_path}base/playlist.jpg`)
})


module.exports = router