var express = require('express')
var router = express.Router()
const User = require('../models/users')
const passport = require('passport')
const authenticate = require('../authenticate')
const cors = require('./cors')
/* GET users listing. */
router.get(
  '/',
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
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

router.post(
  '/login',
  cors.corsWithOptions,
  passport.authenticate('local'),
  (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id })
    res.status(200)
    res.header('Content-Type', 'application/json')
    res.json({ success: true, status: 'You are successfully logged in', token })
  }
)

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

module.exports = router
