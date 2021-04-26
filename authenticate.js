const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/users')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')

const config = require('./config')

// We are using additional methods in User model, provided by passport-local-mongoose plugin
// passport-local-mongoose docs - https://github.com/saintedlama/passport-local-mongoose
// passport-local-mongoose make things more automatically, more simple to Users Model configurations
// Notice how the passport.use is configured to jwt strategy, takes 'options' and 'verify' callback
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
