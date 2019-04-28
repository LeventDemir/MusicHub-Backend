const mongoose = require("mongoose");

const music = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
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
  video: { type: String },
  audio: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    required: true,
    default: new Date()
  }
});

module.exports = mongoose.model("Music", music);
