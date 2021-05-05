const mongoose = require('mongoose')
const Schema = mongoose.Schema

const favoriteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dish',
      },
    ],
  },
  { timestamps: true }
)

const Favorites = mongoose.model('favorite', favoriteSchema)
module.exports = Favorites
