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
    res.send('POST operation not supported on /dishes/' + req.params.dishId)
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

dishRouter
  .route('/:dishId/comments')
  .get((req, res, next) => {
    // Dishes.find({}, (err, res) => {}) or...
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish) {
            Comments.find({ _id: { $in: dish.comments } }, (err, response) => {
              res.json(response)
            })
          } else {
            err = new Error('Dish ' + req.params.dishId + ' not found')
            err.status = 404
            // error handled by the error handler middleware in app.js
            return next(err)
          }
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .post((req, res) => {
    // I've created two models for the sake of learning
    // two models that one reference to the other, but remember that you can use subdocuments,
    // declaring comments: [schemaComments], subdocuments and populate sections in mongoose docs
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish) {
            // it's like that because we're creating documents in the Comments Model
            // if comments were a subdocument of Dishes Model, (Schemas created in same file and export 1 model)
            // we would just make a dish.comments.push(req.body), since there's no need to create Comments docs
            // But we are making a reference to comments ObjectId (Dish has comments references)
            Comments.insertMany(req.body, (err, response) => {
              dish.comments.push(response.map((comment) => comment._id))
              dish.save().then((dish) => {
                res.statusCode = 200
                res.header('Content-Type', 'application/json')
                res.json(dish)
              })
            })
          } else {
            err = new Error('Dish ' + req.params.dishId + ' not found')
            err.status = 404
            // error handled by the error handler middleware in app.js
            return next(err)
          }
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .put((req, res) => {
    res.status(403)
    res.send(
      'Put operation not supported on /dishes' + req.params.dishId + '/comments'
    )
  })
  .delete((req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish) {
            // if we were using subdocuments we would access a subdocument like that:
            // dish.comments.id('id we want', dish.comments[i]._id), now it's accessed, and .remove() method
            // to remove this doc
            Comments.deleteMany(
              { _id: { $in: dish.comments } },
              (err, commentsResult) => {
                console.log('REMOVE ALL COMMENTS')
                console.log(commentsResult)
                dish.comments = []
                dish.save().then((dish) => {
                  console.log('REMOVED FROM DISH')
                  console.log(dish)
                  res.json(dish)
                })
              }
            )
          } else {
            err = new Error('Dish ' + req.params.dishId + ' not found')
            err.status = 404
            return next(err)
          }
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })

dishRouter
  .route('/:dishId/comments/:commentId')
  .get((req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish && dish.comments.includes(req.params.commentId)) {
            console.log('GET SPECIFIC COMMENT')
            Comments.findById(req.params.commentId, (err, response) => {
              res.json(response)
            })
          } else if (!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found')
            err.status = 404
            // error handled by the error handler middleware in app.js
            return next(err)
          } else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
          }
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .post((req, res) => {
    res.status(403)
    res.send(
      'POST operation not supported on /dishes/' +
        req.params.dishId +
        '/comments/' +
        req.params.commentId
    )
  })
  .put((req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          console.log('UPDATE SPECIFIC COMMENT')
          if (dish && dish.comments.includes(req.params.commentId)) {
            if (req.body.rating || req.body.comment) {
              Comments.findByIdAndUpdate(
                req.params.commentId,
                { $set: req.body },
                { new: true },
                (err, response) => {
                  res.json(response)
                }
              )
            }
          } else if (!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found')
            err.status = 404
            return next(err)
          } else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
          }
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .delete((req, res) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish && dish.comments.includes(req.params.commentId)) {
            Comments.findByIdAndDelete(
              req.params.commentId,
              (err, response) => {
                Dishes.findByIdAndUpdate(
                  req.params.dishId,
                  {
                    $set: {
                      comments: dish.comments.filter(
                        (comment) => comment._id != req.params.commentId
                      ),
                    },
                  },
                  { new: true },
                  (err, dish) => {
                    res.json(dish)
                  }
                )
              }
            )
          } else if (!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found')
            err.status = 404
            return next(err)
          } else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
          }
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })

module.exports = dishRouter
