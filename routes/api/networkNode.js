const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoURI = process.env.mongoURI;
const passport = require('passport');

router.post('/register-login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const secretOrKey = process.env.secretOrKey;
    User.findOne({ email }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password).then(isMatch => {
                if (isMatch) {
                    const payload = { id: user.id, email: user.email };

                    jwt.sign(
                        payload,
                        secretOrKey, { expiresIn: 360000 },
                        (err, token) => {
                            res.json({
                                success: true,
                                userId: user.id,
                                token: 'Bearer ' + token
                            })
                        }
                    )
                } else {
                    errors.password = 'Incorrect password';
                    return res.status(400).json(errors);
                }
            });
        } else {
            const newUser = new User({
                email: req.body.email,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    //if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

module.exports = router;