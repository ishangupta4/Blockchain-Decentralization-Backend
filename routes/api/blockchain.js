const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoURI = process.env.mongoURI;
const passport = require('passport');
const sha256 = require("sha256");
const uuid = require("uuid");
const Blockchain = require('../../models/Blockchain');
const User = require('../../models/User');
const currentNodeUrl = process.argv[3];

module.exports = {
    createNewBlock: function(
        nonce,
        previousBlockHash,
        hash
    ) {
        const newBlock = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            nonce: nonce,
            previousBlockHash: previousBlockHash,
            hash: hash,
        };

        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    },

    getLastBlock: function(blockchain) {
        return blockchain[blockchain.length - 1];
    },

    createNewTransaction: function(
        amount,
        sender,
        recipient
    ) {
        const newTransaction = {
            amount: amount,
            sender: sender,
            recipient: recipient,
            transactionId: uuid.v1().split("-").join(""),
        };

        return newTransaction;
    },

    addTransactionToPendingTransactions: function(
        transactionObject
    ) {
        this.pendingTransactions.push(transactionObject);
        return this.getLastBlock()["index"] + 1;
    },

    hashBlock: function(
        previousBlockHash,
        currentBlockData,
        nonce
    ) {
        const dataAsString =
            previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
        const hash = sha256(dataAsString);
        return hash;
    },

    proofOfWork: function(
        previousBlockHash,
        currentBlockData
    ) {
        let nonce = 0;
        let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        while (hash.substring(0, 4) !== "0000") {
            nonce++;
            hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
            //console.log(hash);
        }
        return nonce;
    },

    chainIsValid: function(blockchain) {
        let validchain = true;
        for (var i = 1; i < blockchain.length; i++) {
            const currentBlock = blockchain[i];
            const prevBlock = blockchain[i - 1];
            const blockHash = this.hashBlock(
                prevBlock["hash"], {
                    transactions: currentBlock["transactions"],
                    index: currentBlock["index"],
                },
                currentBlock["nonce"]
            );
            if (blockHash.substring(0, 4) !== "0000") validchain = false;
            if (currentBlock["previousBlockHash"] !== prevBlock["hash"])
                validchain = false;
        }

        const genesisBlock = blockchain[0];
        const correctNonce = genesisBlock["nonce"] === 100;
        const correctPreviousBlockHash = genesisBlock["previousBlockHash"] === "0";
        const correctHash = genesisBlock["hash"] === "0";
        const correctTransactions = genesisBlock["transactions"].length === 0;

        if (!correctNonce ||
            !correctHash ||
            !correctPreviousBlockHash ||
            !correctTransactions
        )
            validchain = false;

        return validchain;
    },

    getBlock: function(blockHash) {
        let correctBlock = null;
        this.chain.forEach((block) => {
            if (block.hash === blockHash) correctBlock = block;
        });
        return correctBlock;
    },

    getTransaction: function(transactionId) {
        let correctTransaction = null;
        let correctBlock = null;

        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                if (transaction.transactionId === transactionId) {
                    correctTransaction = transaction;
                    correctBlock = block;
                }
            });
        });

        return {
            transaction: correctTransaction,
            block: correctBlock,
        };
    },

    getAddressData: function(address) {
        const addressTransaction = [];
        this.chain.forEach((block) => {
            block.transactions.forEach((transaction) => {
                if (transaction.sender === address || transaction.recipient === address)
                    addressTransaction.push(transaction);
            });
        });

        let balance = 0;
        addressTransaction.forEach((transaction) => {
            if (transaction.recipient === address) {
                balance += transaction.amount;
            } else if (transaction.sender === address) {
                balance -= transaction.amount;
            }
        });

        return {
            addressTransactions: addressTransaction,
            addressBalance: balance,
        };
    }
};