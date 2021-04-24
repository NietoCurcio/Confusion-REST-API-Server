const express = require('express')
const mongoose = require('mongoose')
const Dishes = require('../models/dishes')
const Comments = require('../models/comments')

const dishRouter = express.Router()

dishRouter
  .route('/')
  .get((req, res) => {
    // Dishes.find({}, (err, res) => {}) or...
    Dishes.find({})
      .then(
        (dishes) => {
          res.statusCode = 200
          res.header('Content-Type', 'application/json')
          res.json(dishes)
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .post((req, res) => {
    dish = {}
    comments = {}
    for (let i in req.body) {
      i !== 'comments' ? (dish[i] = req.body[i]) : (comments = req.body[i])
    }
    // I've created two models for the sake of learning
    // two models that one reference to the other, but remember that you can use subdocuments,
    // declaring comments: [schemaComments], subdocuments and populate sections in mongoose docs
    Comments.insertMany(comments, (err, response) => {
      dishComments = response.map((comment) => comment._id)
      dish.comments = dishComments
      Dishes.create(dish)
        .then(
          (dish) => {
            console.log('Dishe created ', dish)
            res.statusCode = 200
            res.header('Content-Type', 'application/json')
            res.json(dish)
            // Comments.find({}, (err, result) => {
            //   console.log('RESLT')
            //   console.log(result)
            // })
          },
          (err) => {
            throw new Error('Error ' + err)
          }
        )
        .catch((err) => console.log(err))
    })
  })
  .put((req, res) => {
    res.status(403)
    res.send('Put operation not supported on dishes')
  })
  .delete((req, res) => {
    Dishes.deleteMany({})
      .then(
        (resp) => {
          res.statusCode = 200
          res.header('Content-Type', 'application/json')
          dishesResp = resp
          Comments.deleteMany({}, (err, deleteResult) => {
            commentsResp = deleteResult
            res.json({ ...dishesResp, ...commentsResp })
          })
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })

dishRouter
  .route('/:dishId')
  .get((req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          res.statusCode = 200
          res.header('Content-Type', 'application/json')
          res.json(dish)
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .post((req, res) => {
    res.status(403)
    res.send('Put operation not supported on /dishes/' + req.params.dishId)
  })
  .put((req, res) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (dish) => {
          res.statusCode = 200
          res.header('Content-Type', 'application/json')
          res.json(dish)
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .delete((req, res) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then(
        (resp) => {
          console.log('DELETE ONE')
          console.log(resp)
          // resp.comments it's already in ObjectId('_id')
          Comments.deleteMany(
            { _id: { $in: resp.comments } },
            (err, commentsResult) => {
              res.json(resp)
            }
          )
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })

module.exports = dishRouter
