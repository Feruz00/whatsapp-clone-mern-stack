const mongoose = require('mongoose');
const Conversation = require('./conversations')
const Schema = mongoose.Schema;
const User = require('./user')

const messageSchema = new mongoose.Schema({
    about: {type: Schema.Types.ObjectId,
        ref: 'Conversation'},
    sender:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    text: String,
    watchers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    readers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
},{timestamps: true});

const Messages = mongoose.model('Messages', messageSchema);

module.exports = Messages;