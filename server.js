const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const port = process.env.PORT || 3000;

// cloud db url: mongodb://levent:Levent.1234@ds159546.mlab.com:59546/musichub

mongoose.connect("mongodb://localhost/musichub", { useNewUrlParser: true, useCreateIndex: true });

mongoose.connection.on("open", () => console.log("Connected to mongodb"));
mongoose.connection.on("error", err => console.log(`Mongodb connection error: ${err}`));


app.use(bodyParser.json({ limit: "200mb" }));
app.use(cors());


app.use("/user", require("./src/routes/user"));
app.use("/playlist", require("./src/routes/playlist"));
app.use("/music", require("./src/routes/music"));
app.use("/public", require("./src/routes/public"));


app.get("*", (req, res) => res.send({ error_code: 404 }))
app.post("*", (req, res) => res.send({ error_code: 404 }))
app.delete("*", (req, res) => res.send({ error_code: 404 }))


app.listen(port, () => console.log(`Server started on port: ${port}`));