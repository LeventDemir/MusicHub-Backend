const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require('fs')
const https = require('https')
const uuid = require("uuid/v1");
const User = require("../models/user");
const genToken = require("../utils/token");
const setAvatar = require("../utils/avatar");
const sendMail = require("../utils/mail");

const router = express.Router();


// Register
router.post("/createUser", (req, res) => {
    const user = req.body.user;

    User.findOne({ $or: [{ username: user.username }, { email: user.email }] },
        (err, result) => {
            if (result) {
                if (result.username === user.username && result.email === user.email) res.send({ el: "both" });
                else if (result.username === user.username) res.send({ el: "username" });
                else if (result.email === user.email) res.send({ el: "email" });
            } else {
                if (user.username.includes("@") && !user.email.includes("@")) res.send({ error: "both" });
                else if (user.username.includes("@")) res.send({ error: "username" });
                else if (!user.email.includes("@")) res.send({ error: "email" });
                else {
                    const token = genToken(100);

                    user.uuid = uuid();
                    user.photo = `http://127.0.0.1:3000/public/avatar?user=${user.uuid}`
                    user.token = token;

                    fs.mkdir(`src/public/${user.uuid}`, () =>
                        fs.mkdir(`src/public/${user.uuid}/avatar`, () => {
                            const file = fs.createWriteStream(`src/public/${user.uuid}/avatar/avatar.png`);

                            https.get("https://musichubs.herokuapp.com/public/base?image=avatar",
                                response => response.pipe(file)
                            );
                        })
                    )

                    const newUser = new User(user);

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            newUser.password = hash;

                            newUser.save(res.send({ token }));
                        });
                    });
                }
            }
        }
    );
});


// Login
router.post("/login", (req, res) => {
    const user = req.body.user;

    User.findOne({ $or: [{ username: user.uniqueData }, { email: user.uniqueData }] },
        (err, result) => {
            if (result) {
                bcrypt.compare(user.password, result.password, (err, status) => {
                    if (status) {
                        const token = genToken(100);

                        result.login = new Date().getTime();
                        result.token = token;

                        result.save(res.send({ token }));
                    } else res.send({ el: "password" });
                });
            } else res.send({ el: "uniqueData" });
        }
    );
});


// Logout
router.post("/logout", (req, res) => {
    const token = req.body.token;

    User.findOne({ token }, (err, user) => {
        if (user) {
            user.login = "0";

            user.save(res.send());
        } else res.send({ el: "token" });
    });
});


// Update User Data
router.post("/updateUserData", (req, res) => {
    const userData = req.body.userData;

    User.findOne({ token: userData.token }, (err, user) => {
        if (user)
            if (+user.login + 31536000000 > new Date().getTime())
                bcrypt.compare(userData.password, user.password, (err, status) => {
                    if (status) {

                        setAvatar(userData.photo, user.uuid)
                        user.fullName = userData.fullName;

                        if (
                            userData.username === user.username &&
                            userData.email === user.email
                        ) user.save(res.send({ msg: "updated" }));

                        else if (userData.username === user.username)
                            User.findOne({ email: userData.email }, (err, result) => {
                                if (result) res.send({ el: "email" });
                                else {
                                    user.email = userData.email;

                                    user.save(res.send({ msg: "updated" }));
                                }
                            });

                        else if (userData.email === user.email)
                            User.findOne({ username: userData.username }, (err, result) => {
                                if (result) res.send({ el: "username" });
                                else {
                                    user.username = userData.username;

                                    user.save(res.send({ msg: "updated" }));
                                }
                            });

                        else
                            User.findOne({
                                $or: [
                                    { username: userData.username },
                                    { email: userData.email }
                                ]
                            },
                                (err, result) => {
                                    if (result) {
                                        if (
                                            userData.username === result.username &&
                                            userData.email === result.email
                                        ) res.send({ el: "both" });
                                        else if (userData.username === result.username) res.send({ el: "username" });
                                        else if (userData.email === result.email) res.send({ el: "email" });
                                    } else {
                                        user.username = userData.username;
                                        user.email = userData.email;

                                        user.save(res.send({ msg: "updated" }));
                                    }
                                }
                            );

                    } else res.send({ el: "password" });
                });
            else res.send({ el: false })
        else res.send({ el: "token" });
    });
});


// is Auth
router.post("/isAuth", (req, res) => {
    const token = req.body.token;

    User.findOne({ token }, (err, user) => {
        if (user) {
            const isAuth = +user.login + 31536000000 > new Date().getTime();
            res.send({ isAuth });
        } else res.send({ isAuth: false });
    });
});


// Update password
router.post("/updatePassword", (req, res) => {
    const userData = req.body.user;

    User.findOne({ token: userData.token }, (err, user) => {
        if (user)
            if (+user.login + 31536000000 > new Date().getTime())
                bcrypt.compare(userData.currentPassword, user.password, (err, result) => {
                    if (result)
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(userData.newPassword, salt, (err, hash) => {
                                user.password = hash;
                                user.save(res.send({ msg: "updated" }));
                            });
                        });
                    else res.send({ el: "currentPassword" });
                });
            else res.send({ el: false })
        else res.send({ el: "token" });
    });
});


// Forgot password
router.post("/forgotPassword", (req, res) => {
    const uniqueData = req.body.uniqueData;

    User.findOne({
        $or: [{ username: uniqueData }, { email: uniqueData }]
    },
        (err, user) => {
            if (user) {
                const newPassword = (
                    Math.floor(Math.random() * 90000000) + 10000000
                ).toString();

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPassword, salt, (err, hash) => {
                        user.password = hash;
                        user.save(() => {
                            sendMail({
                                to: user.email,
                                subject: "Forgot password of my MusicHub account",
                                text: newPassword
                            });

                            res.send({ msg: "updated" });
                        });
                    });
                });
            } else res.send({ el: "uniqueData" });
        }
    );
});


// Get user
router.get("/user", (req, res) => {
    const uniqueData = req.query.uniqueData;

    User.findOne({ $or: [{ uuid: uniqueData }, { token: uniqueData }] },
        (err, user) => {
            if (user)
                res.send({
                    uuid: user.uuid,
                    photo: user.photo,
                    fullName: user.fullName,
                    username: user.username,
                    email: user.email,
                });
            else res.send({ el: "uniqueData" });
        }
    );
});


module.exports = router;