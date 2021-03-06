require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const port = process.argv[2];

const app = express();
// const blockchain = require("./routes/api/blockchain");
const networkNode = require("./routes/api/networkNode");

mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Root path of the backend"));

const db = process.env.mongoURI;

mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected Succesfully"))
    .catch(err => console.log(err));

app.use(passport.initialize());
require("./config/passport")(passport);

// app.use("/api/blockchain", blockchain);
app.use("/api/networknode", networkNode);

app.use((req, res, next) => {
    const error = new Error("Route not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


app.listen(port, () => console.log("server is running on port: " + port));