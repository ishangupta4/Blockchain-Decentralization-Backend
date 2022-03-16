require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

mongoose.Promise = global.Promise;

app.get("/", (req, res) => res.send("Root path of the backend"));

const db = process.env.mongoURI;
console.log(db);
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected Succesfully"))
    .catch(err => console.log(err));


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

const port = process.env.PORT || 5200;

app.listen(port, () => console.log("server is running on port: " + port));