const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/users')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const FacebookStrategy = require('passport-facebook').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
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

passport.use(
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

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) next()
  else {
    err = new Error('You are not authorized to perform this operation!')
    err.status = 403
    next(err)
  }
}

// http://www.passportjs.org/packages/passport-facebook/ more secure
passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
      callbackURL: 'https://localhost:3443/users/auth/facebook/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('FACEBOOK STRATEGY Authenticate')
      console.log(accessToken)
      User.findOne({ facebookId: profile.id })
        .then((user) => {
          if (user) {
            done(null, user)
          } else {
            const user = new User({ username: profile.displayName })
            user.facebookId = profile.id
            user.firstname = profile.name.givenName
            user.lastname = profile.name.familyName
            user.save((err, user) => {
              if (err) return done(err, false)
              done(null, user)
            })
          }
        })
        .catch((err) => done(err, false))
    }
  )
)

// passport-facebook-token
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, false)
        }
        if (!err && user !== null) {
          return done(null, user)
        } else {
          user = new User({ username: profile.displayName })
          user.facebookId = profile.id
          user.firstname = profile.name.givenName
          user.lastname = profile.name.familyName
          user.save((err, user) => {
            if (err) return done(err, false)
            else return done(null, user)
          })
        }
      })
    }
  )
)
