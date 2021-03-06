const mongoose = require("mongoose");


const user = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30
  },
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: new Date()
  },
  login: {
    type: String,
    required: true,
    default: new Date().getTime()
  },
  token: {
    type: String,
    required: true,
    unique: true
  }
});


module.exports = mongoose.model("User", user);