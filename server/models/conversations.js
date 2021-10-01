const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')
const User = require('./user')
const Schema = mongoose.Schema;

const conversationSchema = new mongoose.Schema({
  groupName: {
    type: String,
    default: ''
  },
  isGroup: Boolean,
  recipients:[{
      type: Schema.Types.ObjectId,
      ref: 'User'
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status:[{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
},{timestamps: true});
conversationSchema.plugin(findOrCreate)

const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = Conversation;