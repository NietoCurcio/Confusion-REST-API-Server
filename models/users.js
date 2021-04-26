const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
  admin: {
    type: Boolean,
    default: false,
  },
})

UserSchema.plugin(passportLocalMongoose)
// username and password is setted up by passportLocalMongoose plugin
// add support username and hash password
// the salt is a way of encrypting the password and store the hashed pasword, using th esalt key

const User = mongoose.model('user', UserSchema)
module.exports = User
