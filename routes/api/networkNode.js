const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoURI = process.env.mongoURI;
const passport = require('passport');
const Blockchain = require('../../models/Blockchain');
const User = require('../../models/User');
const rp = require("request-promise");
const blockchainMethods = require('./blockchain');


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

router.post("/init-user", passport.authenticate('jwt', { session: false }), (req, res) => {
    const firstBlock = {
        nonce: 100,
        previousHash: "0000",
        hash: "0000",
        blockData: "First block in the blockchain"
    };
    const newBlockchain = new Blockchain({
        pendingTransactions: [],
        currentNodeUrl: currentNodeUrl,
        networkNodes: [{ node: currentNodeUrl, user: req.user.id }],
        block: [firstBlock]
    });
    newBlockchain.save();
    User.findById(req.user.id).then(user => {
        user.blockchainCopy = newBlockchain.id;
        user.save()
            .then(user => { return res.status(200).json(user) })
            .catch(err => console.log(err));
    }).catch(err => { return res.json(err) });
});

router.post("/register-node", passport.authenticate('jwt', { session: false }), function(req, res) {
    const newNodeUrl = req.body.newNodeUrl;
    const userid = req.body.userid;
    Blockchain.findById(req.user.blockchainCopy).then(blockchain => {
        if (
            blockchain.networkNodes.indexOf({ newNodeUrl, userid }) == -1 &&
            blockchain.currentNodeUrl !== newNodeUrl
        )
            blockchain.networkNodes.push({ node: newNodeUrl, user: userid });
        blockchain.save();
        res.json({ note: "new node registered successfully." });
    }).catch(err => {
        console.log(err);
        return res.status(404).json(err);
    })
});

router.get("/mine", passport.authenticate('jwt', { session: false }), function(req, res) {
    User.findById(req.user.id).then(user => {
        Blockchain.findById(user.blockchainCopy).then(blockchain => {
            // console.log(blockchain);
            const lastBlock = blockchainMethods.getLastBlock(blockchain.block);
            const previousBlockHash = lastBlock["hash"];
            const currentBlockData = req.body.blockData;
            const nonce = blockchainMethods.proofOfWork(previousBlockHash, currentBlockData);
            const blockHash = blockchainMethods.hashBlock(
                previousBlockHash,
                currentBlockData,
                nonce
            );

            const newBlock = {
                nonce: nonce,
                previousHash: previousBlockHash,
                hash: blockHash,
                blockData: currentBlockData
            };

            blockchain.block.push(newBlock);
            blockchain.save();
            return res.status(200).json(blockchain);

            // const requestPromises = [];

            // blockchain.networkNodes.forEach((node) => {
            //   const requestOptions = {
            //     uri: node + "/api/recieve-new-block",
            //     method: "POST",
            //     body: { newBlock: newBlock },
            //     json: true,
            //   };

            //   requestPromises.push(rp(requestOptions));
            // });

            // Promise.all(requestPromises)
            //   .then((data) => {
            //     const requestOptions = {
            //       uri: bitcoin.currentNodeUrl + "/transaction/broadcast",
            //       method: "POST",
            //       body: {
            //         amount: 12.5,
            //         sender: "00",
            //         recipient: nodeAddress,
            //       },
            //       json: true,
            //     };
            //     return rp(requestOptions);
            //   })
            //   .then((data) => {
            //     res.json({ block: newBlock });
            //   });
        });
    });
});

router.post("/recieve-new-block", function(req, res) {
    const newBlock = req.body.newBlock;
    const lastBlock = blockchainMethods.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;

    if (correctHash) {
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions = [];
        res.json({
            note: "New block recieved and accepted",
            newBlock: newBlock,
        });
    } else {
        res.json({
            note: "new block rejected",
            newBlock: newBlock,
        });
    }
});

module.exports = router;