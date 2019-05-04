const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const PORT = 3000 || process.env.PORT;

mongoose.connect("mongodb://localhost/musichub", {
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.on("open", () => console.log("Connected to mongodb"));
mongoose.connection.on("error", err =>
  console.log(`Mongodb connection error: ${err}`)
);

app.use(bodyParser.json({ limit: "200mb" }));
app.use(cors());

app.use("/user", require("./routes/user"));
app.use("/playlist", require("./routes/playlist"));
app.use("/music", require("./routes/music"));

app.listen(PORT, () =>
  console.log(`Server started on: http://127.0.0.1:${PORT}`)
);
