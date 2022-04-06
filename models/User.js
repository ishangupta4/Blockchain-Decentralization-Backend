const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    blockchainCopy: {
        type: Schema.Types.ObjectId,
        ref: 'blockchain'
    }
});

module.exports = User = mongoose.model("users", UserSchema);