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
// cookies in client remember or tell the server who we are, which session we are in the server,
// and the server has its sessions that have its states in the server (.i.e, authenticated or not)
// (REST has to be stateless, so we have JWT tokens)
// Cookie header is sent in the requests, localStorage and localStorage are not,
// since those are states in the browsers, not information in the client to tell to the server which
// session state in the server we are

function auth(req, res, next) {
  // console.log(req.signedCookies)
  // console.log(req.cookies)
  console.log('AUTH Function (middleware authorization handler)')
  console.log(req.session)
  // if (!req.signedCookies.user) {
  if (!req.session.user) {
    let err = new Error('You are not authenticated')
    err.status = 401
    next(err)
  } else {
    // all subsequent requests (that has req.signedCookies.user)
    // cookies are used to "remember" who the user is, to the server
    // so once our client has the cookie, we could make requests even without Authorization headers
    // but carefull, it seems to be danger, like manipulating cookies to pretend to be someone
    // if (req.signedCookies.user === 'admin') next()
    if (req.session.user === 'authenticated') next()
    else {
      let err = new Error('You are not authenticated')
      err.status = 403
      next(err)
    }
  }
}

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use(auth)
// notice that the middlewares below (static and routes) will be
// accessed only after passing through the Authorization middleware
// Express is structured in middlewares
// (code that is in the middle of req res cycle) top to bottom

app.use(express.static(path.join(__dirname, 'public')))

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
