const mongoose = require('mongoose')
const Schema = mongoose.Schema

const promotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    //   I've setted up type as Number here
    //   because I wasn't able to install the mongoose-currency node module
    //   probably because it's not been updated a while, I don't know
    price: {
      type: mongoose.Schema.Types.Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamp: true,
  }
)

const Promotions = mongoose.model('promotion', promotionSchema)
module.exports = Promotions
