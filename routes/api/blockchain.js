const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoURI = process.env.mongoURI;
const passport = require('passport');
const sha256 = require("sha256");
const uuid = require("uuid");
const currentNodeUrl = process.argv[3];






module.exports = router;