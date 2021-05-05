const express = require('express')
const Favorites = require('../models/favorite')
const cors = require('./cors')
const authenticate = require('../authenticate')
const Dishes = require('../models/dishes')

const favoriteRouter = express.Router()

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .populate({
        path: 'dishes',
        populate: { path: 'comments', populate: { path: 'author' } },
      })
      .then((favorite) => {
        res.send(favorite)
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then((favorite) => {
      // mark as favorite only dishes that is not already there
      // another approach would be just return forbidden, but I will make a filter
      if (!favorite) {
        const insertFavorite = new Favorites({
          user: req.user._id,
          dishes: req.body.map((dish) => dish._id),
        })
        insertFavorite.save((err, response) => {
          if (err) return next(err)
          Favorites.findById(response._id)
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
              res.json(favorites)
            })
        })
      } else {
        const toFavorite = req.body.filter(
          (dish) => favorite.dishes.indexOf(dish._id) == -1
        )
        if (toFavorite.length == 0) {
          // in case there is no dish in the body that is not already in favorites
          res.status(403)
          return res.end('/favorites dish already in favorites')
        }
        favorite.dishes.push(...toFavorite)
        favorite.save((err, response) => {
          if (err) return next(err)
          Favorites.findById(response._id)
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
              res.json(favorites)
            })
        })
      }
    })
  })
  .put((req, res) => {
    res.status(403)
    res.end('PUT operation not allowed in /favorites endpoint')
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          res.status(403)
          res.send("You don't have a favorite to be deleted")
        }
        res.json(favorite)
      })
      .catch((err) => next(err))
  })

favoriteRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          res.status(404)
          return res.json({ exists: false, favorites: favorite })
        }
        if (favorite.dishes.includes(req.params.dishId)) {
          // Dishes.findById(req.params.dishId)
          //   .then((dish) => {
          //     res.json(dish)
          //   })
          //   .catch((err) => next(err))
          res.json({ exists: true, favorites: favorite })
        } else {
          res.status(404).json({ exists: false, favorites: favorite })
        }
      })
      .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (!dish) {
          res.status(404)
          return res.send('This dish does not exist')
        } else {
          Favorites.findOne({ user: req.user._id }).then((favorite) => {
            if (!favorite) {
              const dishe = [req.params.dishId]
              const insert = new Favorites({
                user: req.user._id,
                dishes: dishe,
              })
              insert.save((err, response) => {
                if (err) return next(err)
                Favorites.findById(response._id)
                  .populate('user')
                  .populate('dishes')
                  .then((favorites) => {
                    res.json(favorites)
                  })
              })
            } else {
              if (favorite.dishes.indexOf(req.params.dishId) > -1) {
                res.status(403)
                return res.send('This dish is already in your favorites')
              }
              favorite.dishes.push(req.params.dishId)
              favorite.save((err, response) => {
                if (err) return next(err)
                Favorites.findById(response._id)
                  .populate('user')
                  .populate('dishes')
                  .then((favorites) => {
                    res.json(favorites)
                  })
              })
            }
          })
        }
      })
      .catch((err) => next(err))
  })
  .put((req, res) => {
    res.status(403)
    res.end('PUT operation not allowed in /favorites/dishId endpoint')
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite) {
          res.status(404)
          return res.send('This dish does not exist')
        }
        favorite.dishes = favorite.dishes.filter(
          (dish) => dish._id != req.params.dishId
        )
        favorite.save((err, response) => {
          if (err) return next(err)
          Favorites.findById(response._id)
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
              res.json(favorites)
            })
        })
      })
      .catch((err) => next(err))
  })

module.exports = favoriteRouter
