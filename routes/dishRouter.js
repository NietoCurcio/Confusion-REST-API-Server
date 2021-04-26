const express = require('express')
const mongoose = require('mongoose')
const Dishes = require('../models/dishes')
const Comments = require('../models/comments')
const authenticate = require('../authenticate')

const dishRouter = express.Router()

dishRouter
  .route('/')
  .get((req, res) => {
    // Dishes.find({}, (err, res) => {}) or...
    // document database, mongodb, expect documents to be self-contained,
    // everything it needs is stored within the document
    // but we can store references to other documents using the ObjectId
    // uses .populate only when is needed since it takes time for the server
    // dishes => each dish => comments => each comment => get comment's User document
    // USE OF POPULATE CAN OVERHEAD THE SERVER SIDE
    Dishes.find({})
      .populate({ path: 'comments', populate: { path: 'author' } })
      // populate multiple levels
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
  // same concepts of middleware chain
  // before handle to post something, handle the authentication
  .post(authenticate.verifyUser, (req, res) => {
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
  .put(authenticate.verifyUser, (req, res) => {
    res.status(403)
    res.send('Put operation not supported on dishes')
  })
  .delete(authenticate.verifyUser, (req, res) => {
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
      .populate({ path: 'comments', populate: { path: 'author' } })
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
  .post(authenticate.verifyUser, (req, res) => {
    res.status(403)
    res.send('POST operation not supported on /dishes/' + req.params.dishId)
  })
  .put(authenticate.verifyUser, (req, res) => {
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
  .delete(authenticate.verifyUser, (req, res) => {
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
            let queryComments = Comments.find({ _id: { $in: dish.comments } })
            queryComments.populate('author')
            queryComments.exec((err, response) => {
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
  .post(authenticate.verifyUser, (req, res) => {
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
            req.body.author = req.user._id
            // passport.authenticate() loaded user information in req.user
            // the information about the user comes in its Authorization: Bearer token header
            Comments.insertMany(req.body, (err, response) => {
              dish.comments.push(response.map((comment) => comment._id))
              dish.save().then((dish) => {
                Dishes.findById(dish._id)
                  .populate('comments')
                  .then((dish) => {
                    res.statusCode = 200
                    res.header('Content-Type', 'application/json')
                    res.json(dish)
                  })
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
  .put(authenticate.verifyUser, (req, res) => {
    res.status(403)
    res.send(
      'Put operation not supported on /dishes' + req.params.dishId + '/comments'
    )
  })
  .delete(authenticate.verifyUser, (req, res) => {
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
            queryComment = Comments.findById(req.params.commentId)
            queryComment.populate('author')
            queryComment.exec((err, response) => {
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
  .post(authenticate.verifyUser, (req, res) => {
    res.status(403)
    res.send(
      'POST operation not supported on /dishes/' +
        req.params.dishId +
        '/comments/' +
        req.params.commentId
    )
  })
  .put(authenticate.verifyUser, (req, res) => {
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
                  Dishes.findById(dish._id)
                    .populate({
                      path: 'comments',
                      populate: { path: 'author' },
                    })
                    .then((dish) => res.json(dish))
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
  .delete(authenticate.verifyUser, (req, res) => {
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
                  { new: true }
                )
                  .populate({ path: 'comments', populate: { path: 'author' } })
                  .then((dish) => res.json(dish))
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
