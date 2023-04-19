const mongoose = require("mongoose");
const Post = require("./post");
const User = require("./user");
const commentsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    nickname: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      require: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentsSchema);
//post_id로 이름 바꿔보기
