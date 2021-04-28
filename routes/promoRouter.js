const express = require('express')
const Promotions = require('../models/promotions')
const authenticate = require('../authenticate')

const promoRouter = express.Router()

promoRouter
  .route('/')
  .get((req, res, next) => {
    Promotions.find({})
      .then(
        (promos) => {
          res.status = 200
          res.header('Content-Type', 'application/json')
          res.json(promos)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.insertMany(req.body)
      .then(
        (promos) => {
          res.status = 200
          res.header('Content-Type', 'application/json')
          res.json(promos)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403)
    res.send('Put operation not supported on promotions')
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.deleteMany({})
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

promoRouter
  .route('/:promoId')
  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200
          res.header('Content-Type', 'application/json')
          res.json(promo)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403)
    res.send('POST operation not supported on /promos/' + req.params.promoId)
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(
      req.params.promoId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (promo) => {
          res.status = 200
          res.header('Content-Type', 'application/json')
          res.json(promo)
        },
        (err) => next(new Error('Error ' + err))
      )
      .catch((err) => next(new Error('Error ' + err)))
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndDelete(req.params.promoId)
        .then(
          (resp) => res.json(resp),
          (err) => next(new Error('Error ' + err))
        )
        .catch((err) => next(new Error('Error ' + err)))
    }
  )

module.exports = promoRouter
