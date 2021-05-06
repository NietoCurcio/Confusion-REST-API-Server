const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'dish',
    },
    // later, the author of the course has added a dish field
    // that is a reference to dish ObjectID
    // But I prefer to leave as I have developed since the beginning
    // Dishes has a property comments that is an array of ObjectID comments
    // To accompany jogesh, I have setted up the new field and the new router (commentsRouter)
    // but leaving the dishes with its 'comments' property (array of comments ObjectID)
    // I know that does not make sense stores the dishId in comments model, since
    // comments will be already attached dishes, but just for sake of learning
    // (like a lot of populate in MongoDB can overhead the server,
    // no-sql expects self-contained documents) relational databases
    // that actually makes relationships
  },
  {
    timestamps: true,
  }
)

const comments = mongoose.model('comment', commentSchema)
module.exports = comments
