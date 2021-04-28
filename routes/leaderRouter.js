const express = require('express')
const Leaders = require('../models/leaders')
const authenticate = require('../authenticate')

const leaderRouter = express.Router()

leaderRouter
  .route('/')
  .get((req, res, next) => {
    Leaders.find({})
      .then(
        (leaders) => {
          res.status = 200
          res.header('Content-Type', 'application/json')
          res.json(leaders)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.insertMany(req.body)
      .then(
        (leaders) => {
          res.status = 200
          res.header('Content-Type', 'application/json')
          res.json(leaders)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403)
    res.send('PUT operation not supported on /leaders')
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.deleteMany({})
        .then(
          (resp) => {
            res.statusCode = 200
            res.header('Content-Type', 'application/json')
            res.json(resp)
          },
          (err) => next(new Error('Error ' + err))
        )
        .catch((err) => next(new Error('Error ' + err)))
    }
  )

leaderRouter
  .route('/:leaderId')
  .get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.statusCode = 200
          res.header('Content-Type', 'application/json')
          res.json(leader)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403)
    res.send('POST operation not supported on /leaders/' + req.params.leaderId)
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (leader) => {
          res.status = 200
          res.header('Content-Type', 'application/json')
          res.json(leader)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findByIdAndDelete(req.params.leaderId)
        .then(
          (resp) => res.json(resp),
          (err) => next(new Error('Error ' + err))
        )
        .catch((err) => next(new Error('Error ' + err)))
    }
  )

module.exports = leaderRouter
