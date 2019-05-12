const fs = require('fs')


module.exports = setAvatar = (photo, user) => {
    if (photo.substr(0, 4) !== "http") {

        const imageData = photo.replace(/^data:image\/\w+;base64,/, "");

        const imagePath = `src/public/${user}/avatar/`

        const imageName = `avatar.${photo.split(";")[0].split("/")[1]}`

        const buffer = new Buffer(imageData, 'base64');

        fs.readdir(imagePath, (err, image) => {
            fs.unlink(`${imagePath}${image[0]}`, () =>
                fs.writeFile(imagePath + imageName, buffer, () => { })
            )
        })
    }
}