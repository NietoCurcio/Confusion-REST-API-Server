var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
let dishRouter = require('./routes/dishRouter')
let promoRouter = require('./routes/promoRouter')
let leaderRouter = require('./routes/leaderRouter')

const mongoose = require('mongoose')
const Dishes = require('./models/dishes')

const url = 'mongodb://localhost:27017/conFusion'
const connect = mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

connect.then(
  (db) => {
    console.log('Connected to the MongoDB Server')
  },
  (err) => console.log(err)
)

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// handle signed cookies
// Cookies comes in the requests
// app.use(cookieParser('1234567890'))
// https://stackoverflow.com/questions/6068113/do-sessions-really-violate-restfulness
// remember to be a RESTFUL API has to be stateless,
// since an API connect to many client and client to many microservices
// to maintain scalability concepts
app.use(
  session({
    name: 'session-id',
    secret: '1234567890',
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
)

function auth(req, res, next) {
  // console.log(req.signedCookies)
  // console.log(req.cookies)
  console.log('AUTH Function (middleware authorization handler)')
  console.log(req.session)
  // if (!req.signedCookies.user) {
  if (!req.session.user) {
    // console.log(authHeader)
    // console.log(typeof authHeader)
    let authHeader = req.headers.authorization
    if (!authHeader) {
      let err = new Error('You are not authenticated')
      res.header('WWW-Authenticate', 'Basic')
      err.status = 401
      next(err)
    } else {
      // console.log(typeof new Buffer.from(authHeader.split(' ')[1], 'base64'))
      let auth = new Buffer.from(authHeader.split(' ')[1], 'base64')
        .toString()
        .split(':')
      // Buffer represents a sequence of bytes, in this case Base64 enconding, could be 'utf8' as well
      // convert the auth (that comes as 'Basic auth', the auth in base64) to a buffer object
      // console.log(auth)
      if (auth[0] === 'admin' && auth[1] === 'password') {
        // res.cookie('user', 'admin', { signed: true })
        // res.cookie('test', 'test')
        req.session.user = 'admin'
        next()
        // continue to the next middleware
        // it's like a middleware chain
      } else {
        let err = new Error('You are not authenticated')
        res.header('WWW-Authenticate', 'Basic')
        // res.status(401) that is being handled by error handling middleware,
        // that takes an err as first argument
        err.status = 401
        next(err)
      }
    }
  } else {
    // all subsequent requests (that has req.signedCookies.user)
    // cookies are used to "remember" who the user is, to the server
    // so once our client has the cookie, we could make requests even without Authorization headers
    // but carefull, it seems to be danger, like manipulating cookies to pretend to be someone
    // if (req.signedCookies.user === 'admin') next()
    if (req.session.user === 'admin') next()
    else {
      let err = new Error('You are not authenticated')
      err.status = 401
      next(err)
    }
  }
}

app.use(auth)
// notice that the middlewares below (static and routes) will be
// accessed only after passing through the Authorization middleware
// Express is structured in middlewares
// (code that is in the middle of req res cycle) top to bottom

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/dishes', dishRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
