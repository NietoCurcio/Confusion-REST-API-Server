var express = require('express')
var router = express.Router()
const User = require('../models/users')
const passport = require('passport')
const authenticate = require('../authenticate')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.post('/signup', (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.status(500)
        res.json({ err })
      } else {
        passport.authenticate('local')(req, res, () => {
          res.status(200)
          res.header('Content-Type', 'application/json')
          res.json({ success: true, status: 'Registration successful' })
        })
      }
    }
  )
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.status(200)
  res.header('Content-Type', 'application/json')
  res.json({ success: true, status: 'You are successfully logged in', token })
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

module.exports = router
