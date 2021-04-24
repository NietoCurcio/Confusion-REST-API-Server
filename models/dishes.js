const mongoose = require('mongoose')
const Schema = mongoose.Schema

// const commentSchema = new Schema(
//   {
//     rating: {
//       type: Number,
//       min: 1,
//       max: 5,
//       required: true,
//     },
//     comment: {
//       type: mongoose.Schema.Types.String,
//       required: true,
//     },
//     author: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamp: true,
//   }
// )
const dishSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    image: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    price: {
      type: mongoose.Schema.Types.Number,
      required: true,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // comments: [commentSchema],
    // I think the declaration below is the same functionality as above
    // IS NOT THE SAME FUNCTIONALITY
    // to use like that, we would have to export a 'comment' model within our models folder
    // and create a new document using the Comments model, imported in index.js
    // it's an idea simialr to foreign keys in relational dbs
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }],
  },
  {
    timestamps: true,
  }
)

const dishes = mongoose.model('dish', dishSchema)
module.exports = dishes
