const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/users')

// We are using additional methods in User model, provided by passport-local-mongoose
// There's no much about it, in passport's documentations
exports.local = passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
