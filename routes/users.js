var express = require('express')
var router = express.Router()
const User = require('../models/users')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.post('/signup', (req, res, next) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        let err = new Error('User ' + req.body.username + ' already exists')
        err.status = 403
        next(err)
      } else {
        return User.create({
          username: req.body.username,
          password: req.body.password,
          // the password should be hashed
        })
      }
    })
    .then(
      (user) => {
        res.status(200)
        res.header('Content-Type', 'application/json')
        res.json({ status: 'Registration successful', user })
      },
      (err) => next(err)
    )
    .catch((err) => next(err))
})

router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    let authHeader = req.headers.authorization
    if (!authHeader) {
      let err = new Error('You are not authenticated')
      res.header('WWW-Authenticate', 'Basic')
      err.status = 401
      next(err)
    } else {
      let auth = new Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':')
      let username = auth[0]
      let password = auth[1]
      User.findOne({ username })
        .then((user) => {
          if (!user) {
            let err = new Error('User ' + username + ' does not exist')
            err.status = 403
            next(err)
          } else if (user.password !== password) {
            let err = new Error('Password Incorrect')
            err.status = 403
            next(err)
          } else {
            req.session.user = 'authenticated'
            res.status(200)
            res.header('Content-Type', 'text/plain')
            res.end('You are authenticated')
          }
        })
        .catch((err) => next(err))
    }
  } else {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    res.end('You are already authenticated')
  }
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
