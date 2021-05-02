const express = require('express')
const multer = require('multer')
const authenticate = require('../authenticate')
const uploadRouter = express.Router()
const cors = require('./cors')

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images')
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname)
  },
})

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/))
    return callback(new Error('Upload only image files', false))
  callback(null, true)
}

const upload = multer({ storage, fileFilter: imageFileFilter })

uploadRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(
    cors.cors,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.status(403)
      res.send('Get operation not supported on /imageUpload')
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.status(403)
      res.send('Put operation not supported on /imageUpload')
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.status(403)
      res.send('Put operation not supported on /imageUpload')
    }
  )
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    upload.single('imageFile'),
    (req, res) => {
      res.status(200)
      res.header('Content-Type', 'application/json')
      res.json(req.file)
    }
  )

module.exports = uploadRouter
