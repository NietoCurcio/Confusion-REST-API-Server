var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

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
app.use(cookieParser())

function auth(req, res, next) {
  // console.log(req.headers)
  let authHeader = req.headers.authorization
  // console.log(authHeader)
  // console.log(typeof authHeader)
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
      next()
      // continue to the next middleware
      // it's like a middleware chain
    } else {
      let err = new Error('You are not authenticated')
      res.header('WWW-Authenticate', 'Basic')
      res.status(401)
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
