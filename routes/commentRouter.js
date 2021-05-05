const express = require('express')
const Comments = require('../models/comments')
const Dishes = require('../models/dishes')
const authenticate = require('../authenticate')
const cors = require('./cors')

const commentRouter = express.Router()

commentRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Comments.find(req.query)
      .populate('author')
      .then(
        (comments) => {
          res.json(comments)
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if (req.body) {
      req.body.author = req.user._id
      Comments.create(req.body)
        .then(
          (comment) => {
            Comments.findById(comment._id)
              .populate('author')
              .then((comment) => res.json(comment))
          },
          (err) => next(err)
        )
        .catch((err) => console.log(err))
    } else {
      const err = new Error('Comment not found in request body')
      err.status(404)
      next(err)
    }
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403)
    res.send('Put operation not supported on /comments')
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      console.log('DELETING ALL COMMENTS /COMMENTS DELETE')
      // doing /dishes/dishId GET with .populate, only will be shown valid documents (that exists)
      // but without populate we can see that there are ObjectIDs in the array that does not exist anymore
      // so I'll update dish.comments to avoid useless information in the object
      Comments.remove({})
        .then(
          (resp) => {
            Dishes.updateMany(
              {},
              { $set: { comments: [] } },
              { new: true }
            ).then((dishes) => {
              console.log(dishes[0])
              console.log(dishes[2])
              console.log(typeof dishes)
              console.log(typeof dishes)
              dishes.save((err, response) => res.json(resp))
            })
          },
          (err) => {
            throw new Error('Error ' + err)
          }
        )
        .catch((err) => console.log(err))
    }
  )

commentRouter
  .route('/:commentId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .populate('author')
      .then(
        (comment) => {
          res.json(comment)
        },
        (err) => {
          throw new Error('Error ' + err)
        }
      )
      .catch((err) => console.log(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403)
    res.send(
      'POST operation not supported on /comments/' + req.params.commentId
    )
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (comment) => {
          if (comment) {
            if (!comment.author.equals(req.user._id)) {
              const err = new Error(
                'You are not authorized to update this comment'
              )
              err.status = 403
              return next(err)
            }
            req.body.author = req.user._id
            Comments.findByIdAndUpdate(
              req.params.commentId,
              {
                $set: req.body,
              },
              { new: true }
              //   returns the updated comment
            ).then((comment) => {
              Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                  res.json(comment)
                })
            })
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
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
      .then(
        (comment) => {
          if (comment) {
            if (!comment.author.equals(req.user._id)) {
              const err = new Error(
                'You are not authorized to delete this comment'
              )
              err.status = 403
              return next(err)
            }
            // same here about updating dishes, since there are comments ObjectIDs stored in dishes.comments
            // that could not exist anymore (.populate does not shows only valid documents)
            // but without .populate the ObjectId, that no longer exist, appears in response
            // Dishes.findOne({ _id: resp.dish })
            // .popuplate('comments')
            //         .then((dish) => {
            //           console.log(dish)
            //           res.json(resp)
            //         })
            // I tested it a lot of times with and without .populate
            Comments.findByIdAndDelete(req.params.commentId)
              .then(
                (resp) => {
                  Dishes.findById(resp.dish).then((response) => {
                    console.log(response)
                    response.update({
                      comments: response.comments.splice(
                        response.comments.indexOf(resp._id),
                        1
                      ),
                    })
                    response.save((err, response) => res.json(response))
                  })
                },
                (err) => next(err)
              )
              .catch((err) => next(err))
          } else {
            const err = new Error(
              'Comment ' + req.params.commentId + ' not found'
            )
            err.status = 404
            return next(err)
          }
        },
        (err) => {
          return next(err)
        }
      )
      .catch((err) => next(err))
  })

module.exports = commentRouter
