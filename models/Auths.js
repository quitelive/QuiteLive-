// Schema for recording all api endpoint requests

const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const AuthSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // api token expires at an hour
        required: true
    }
});


Mongoose.model('AuthSchema', AuthSchema);