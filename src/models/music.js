const mongoose = require("mongoose");


const music = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    owner_id: {
        type: String,
        required: true
    },
    owner_username: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 30
    },
    description: {
        type: String,
        required: true,
        maxlength: 500000
    },
    lyrics: {
        type: String,
        required: true,
        maxlength: 500000
    },
    artists: {
        type: Array,
        required: true,
        maxlength: 100
    },
    playlists: {
        type: Array
    },
    categories: {
        type: Array,
        required: true
    },
    tags: {
        type: Array,
        maxlength: 100
    },
    audio: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        required: true,
    }
});


module.exports = mongoose.model("Music", music);