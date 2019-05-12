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


module.exports = router