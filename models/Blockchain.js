const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlockchainSchema = new Schema({
    Block: [{
        nonce: {
            type: Number,
            required: true
        },
        previousHash: {
            type: String,
            required: true,
            default: "0"
        },
        hash: {
            type: String,
            required: true,
            default: "0"
        },
        blockData: {
            type: String,
            required: true,
            default: " "
        }
    }]
});

module.exports = Blockchain = mongoose.model("blockchain", BlockchainSchema);