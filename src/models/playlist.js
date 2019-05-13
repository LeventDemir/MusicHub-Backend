const mongoose = require("mongoose");


const playlist = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 30
  },
  photo: {
    type: String,
    required: true
  },
  owner_id: {
    type: String,
    required: true
  },
  owner_username: {
    type: String,
    required: true
  },
  musics: { type: Array },
  createdDate: {
    type: Date,
    required: true,
    default: new Date()
  }
});


module.exports = mongoose.model("Playlist", playlist);
