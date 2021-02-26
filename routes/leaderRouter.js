const express = require('express')

const leaderRouter = express.Router()

leaderRouter
  .route('/')
  .all((req, res, next) => {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.send('Will send all the leaders to you!')
  })
  .post((req, res) => {
    res.send(
      'Will add the leader: ' +
        req.body.name +
        ' with details: ' +
        req.body.description
    )
  })
  .put((req, res) => {
    res.status(403)
    res.send('Put operation not supported on /leaders')
  })
  .delete((req, res) => {
    res.send('Deleting all the leaders')
  })

leaderRouter
  .route('/:leaderId')
  .all((req, res, next) => {
    res.status(200)
    res.header('Content-Type', 'text/plain')
    next()
  })
  .get((req, res) => {
    res.send('Will send details of leader  ' + req.params.leaderId)
  })
  .post((req, res) => {
    res.status(403)
    res.send('Put operation not supported on /leaders/' + req.params.leaderId)
  })
  .put((req, res) => {
    res.write('Updating the leader ' + req.params.leaderId + '\n')
    res.end(
      'Will update the leader: ' +
        req.body.name +
        ' with details ' +
        req.body.description
    )
  })
  .delete((req, res) => {
    res.send('Deleting the leader ' + req.params.leaderId)
  })

module.exports = leaderRouter
