const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/users')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')

const config = require('./config')

// We are using additional methods in User model, provided by passport-local-mongoose plugin
// There's no much about it, in passport's documentations
exports.local = passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 })
}

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secretKey,
}

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log(jwt_payload)
    User.findOne({ _id: jwt_payload._id }, (err, res) => {
      if (err) done(err, false)
      else if (res) done(null, res)
      else done(null, false)
    })
  })
)

exports.verifyUser = passport.authenticate('jwt', { session: false })
