var express = require('express')
var router = express.Router()
const User = require('../models/users')
const passport = require('passport')
const { verifyUser, verifyAdmin, getToken } = require('../authenticate')
const cors = require('./cors')
/* GET users listing. */
router.options('*', cors.corsWithOptions, (req, res) => res.sendStatus(200))
router.get(
  '/',
  cors.corsWithOptions,
  verifyUser,
  verifyAdmin,
  (req, res, next) => {
    User.find({}).then((users) => res.json(users))
  }
)

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.status(500)
        res.json({ err })
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname
        if (req.body.lastname) user.lastname = req.body.lastname
        user.save((err, user) => {
          if (err) {
            res.status(500)
            res.json({ err })
            return
          }
          passport.authenticate('local')(req, res, () => {
            res.status(200)
            res.header('Content-Type', 'application/json')
            res.json({ success: true, status: 'Registration successful' })
          })
        })
      }
    }
  )
})

router.post('/login', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      const token = getToken({ _id: req.user._id })
      res.statusCode = 401
      res.header('Content-Type', 'application/json')
      return res.json({
        success: false,
        status: 'Login unsuccessful',
        err: info,
      })
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(401).json({
          success: false,
          status: 'Login unsuccessful',
          err: 'Could not log in user',
        })
      }
    })
    const token = getToken({ _id: req.user._id })
    res.json({ sucess: true, status: 'Login Sucessful', token })
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/')
  } else {
    let err = new Error('You are not logged in')
    err.status = 403
    next(err)
  }
})

// more secure, the url returned contains a code param that can be used only once
router.get('/auth/facebook', passport.authenticate('facebook'))

router.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook'),
  (req, res) => {
    if (req.user) {
      const token = getToken({ _id: req.user._id })
      res.status(200)
      res.header('Content-Type', 'application/json')
      res.json({
        success: true,
        status: 'You are successfully logged in',
        token,
      })
    }
  }
)

// passport-facebook-token
router.get(
  '/auth/facebook/token',
  passport.authenticate('facebook-token'),
  (req, res) => {
    if (req.user) {
      const token = getToken({ _id: req.user._id })
      res.status(200)
      res.header('Content-Type', 'application/json')
      res.json({
        success: true,
        status: 'You are successfully logged in',
        token,
      })
    }
  }
)

router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      res.statusCode = 401
      res.header('Content-Type', 'application/json')
      return res.json({ status: 'JWT Invalid', success: false, err: info })
    }
    return res.json({ status: 'JWT Valid', success: true, user })
  })(req, res, next)
})

module.exports = router
