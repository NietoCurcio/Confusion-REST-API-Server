const express = require('express')

const promoRouter = express.Router()

promoRouter
  .route('/')
  .all()
  .all((req, res, next) => {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.send('Will send all the promos to you!')
  })
  .post((req, res) => {
    res.send(
      'Will add the promo: ' +
        req.body.name +
        ' with details: ' +
        req.body.description
    )
  })
  .put((req, res) => {
    res.status(403)
    res.send('Put operation not supported on promo')
  })
  .delete((req, res) => {
    res.send('Deleting all the promos')
  })

promoRouter
  .route('/:promoId')
  .all((req, res, next) => {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.send('Will send details of promo  ' + req.params.promoId)
  })
  .post((req, res) => {
    res.status(403)
    res.send('Put operation not supported on /promos/' + req.params.promoId)
  })
  .put((req, res) => {
    res.write('Updating the promo ' + req.params.promoId + '\n')
    res.end(
      'Will update the promo: ' +
        req.body.name +
        ' with details ' +
        req.body.description
    )
  })
  .delete((req, res) => {
    res.send('Deleting the promo ' + req.params.promoId)
  })

module.exports = promoRouter
