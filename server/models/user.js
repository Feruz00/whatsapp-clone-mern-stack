const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        unique: true,
        default: ''
    },
    email: String,
    password: String,
    googleId: String,
    githubId: String,
    status:{
        type:Boolean,
        default: false
    },
    logo:{
        type:String,
        default: ''
    },
    firstName: {
        type:String,
        default: ''
    },
    lastName: {
        type:String,
        default: ''
    },
    followers: [],
    following: [],
    online: {
        type: Boolean,
        default: false
    },
    token: String
},{timestamps: true});

userSchema.plugin(passportLocalMongoose,{ usernameField: 'email'});
userSchema.plugin(findOrCreate);

const User = mongoose.model('User',userSchema);

module.exports = User;
