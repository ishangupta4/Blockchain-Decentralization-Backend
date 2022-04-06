const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlockchainSchema = new Schema({
    pendingTransactions: [{
        data: {
            type: String
        }
    }],
    currentNodeUrl: {
        type: String
    },
    networkNodes: [{
        node: {
            type: String
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    block: [{
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
        },
        timestamp: {
            type: Date,
            default: Date.now()
        }
    }]
});

module.exports = Blockchain = mongoose.model("blockchain", BlockchainSchema);