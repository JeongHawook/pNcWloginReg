const express = require("express");
const Post = require("../schemas/post");
const Comment = require("../schemas/comment");
const User = require("../schemas/user");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth-middleware");

/////////////////
//post comments//
/////////////////
router.post("/", authMiddleware, async (req, res) => {
  const { comment } = req.body;
  const { _postId } = req.params;
  const nickname = res.locals.nickname;

  if (_postId.length !== 24) {
    //길이 통제
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다" });
  }

  if (typeof comment !== "string" || !comment) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    const checkPost = await Post.findById({ _id: _postId });

    if (!checkPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    const user = await User.findOne({ nickname: nickname });
    if (!user) {
      return res
        .status(400)
        .json({ errorMessage: "댓글 작성에 실패하였습니다." });
    }
    const postComment = await Comment.create({
      postId: checkPost._id,
      userId: user._id,
      nickname: nickname,
      comment: comment,
    });

    return res.status(201).json({ message: "댓글을 작성하였습니다." });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "댓글 작성에 실패하였습니다." });
  }
  //
});
////////////////
//get comments//
////////////////
router.get("/", async (req, res) => {
  const { _postId } = req.params;

  if (_postId.length !== 24) {
    //길이 통제
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  }

  try {
    const getPost = await Post.find({ postId: _postId });

    if (!getPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    const getComments = await Comment.find({ postId: _postId }).sort({
      created_at: -1,
    });

    if (getComments.length < 1) {
      return res.status(400).json({ message: "댓글이 아직 없습니다!" });
    }

    const allComments = getComments.map((getComment) => {
      return {
        commentId: getComment._id,
        userId: getComment.userId,
        nickname: getComment.nickname,
        comment: getComment.comment,
        createdAt: getComment.createdAt,
        updatedAt: getComment.updatedAt,
      };
    });

    return res.json({ comments: allComments });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "댓글 조회에 실패하였습니다." });
  }
});
///////////////////
//update comments//
///////////////////
router.put("/:_commentId", authMiddleware, async (req, res) => {
  const { _postId, _commentId } = req.params;
  const { comment } = req.body;
  const nickname = res.locals.nickname;
  if (_postId.length !== 24 || _commentId.length !== 24) {
    //길이 통제
    return res
      .status(412)
      .json({ message: "데이터 형식이 올바르지 않습니다1" });
  }
  if (!comment) {
    return res.status(412).json({ message: "댓글 내용을 입력해주세요." });
  }

  if (typeof comment !== "string") {
    return res
      .status(412)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }

  try {
    const getPost = Post.findById({ _id: _postId });
    if (!getPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    const getComment = await Comment.findOne({
      _id: _commentId,
      postId: _postId,
    });

    if (!getComment) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }
    if (getComment.nickname !== nickname) {
      return res
        .status(403)
        .json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
    }
    const updateComment = await Comment.updateOne(
      { _id: getComment._id },
      { comment: comment }
    );
    return res.json({ message: "댓글을 수정하셨습니다" });
  } catch (err) {
    if (err.name === "MongoServerError") {
      return res
        .status(400)
        .json({ errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다." });
    }
    return res
      .status(400)
      .json({ errorMessage: "댓글 수정에 실패하였습니다." });
  }
});

///////////////////
//delete comments//
///////////////////
router.delete("/:_commentId", authMiddleware, async (req, res) => {
  const { _postId, _commentId } = req.params;
  const nickname = res.locals.nickname;

  if (_postId.length !== 24 || _commentId.length !== 24) {
    //길이 통제
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다1" });
  }

  try {
    const getPost = await Post.find({ _postId });
    if (!getPost) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    const getComment = await Comment.findById({
      _id: _commentId,
      postId: _postId,
    });
    if (!getComment) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }
    if (getComment.nickname !== nickname) {
      return res
        .status(403)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }
    await Comment.deleteOne({ _id: getComment._id });
    return res.status(200).json({ message: "댓글을 삭제하셨습니다." });
  } catch (err) {
    if (err.name === "MongoServerError") {
      return res
        .status(400)
        .json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
    return res
      .status(400)
      .json({ errorMessage: "댓글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
