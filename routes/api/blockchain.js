const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoURI = process.env.mongoURI;
const passport = require('passport');


module.exports = router;