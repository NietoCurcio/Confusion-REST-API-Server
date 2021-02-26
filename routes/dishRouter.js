const express = require('express')

const dishRouter = express.Router()

dishRouter
  .route('/')
  .all()
  .all((req, res, next) => {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.send('Will send all the dishes to you!')
  })
  .post((req, res) => {
    res.send(
      'Will add the dish: ' +
        req.body.name +
        ' with details: ' +
        req.body.description
    )
  })
  .put((req, res) => {
    res.status(403)
    res.send('Put operation not supported on dishes')
  })
  .delete((req, res) => {
    res.send('Deleting all the dishes')
  })

dishRouter
  .route('/:dishId')
  .all((req, res, next) => {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.send('Will send details of dish  ' + req.params.dishId)
  })
  .post((req, res) => {
    res.status(403)
    res.send('Put operation not supported on /dishes/' + req.params.dishId)
  })
  .put((req, res) => {
    res.write('Updating the dish ' + req.params.dishId + '\n')
    res.end(
      'Will update the dish: ' +
        req.body.name +
        ' with details ' +
        req.body.description
    )
  })
  .delete((req, res) => {
    res.send('Deleting the dishe ' + req.params.dishId)
  })

module.exports = dishRouter
