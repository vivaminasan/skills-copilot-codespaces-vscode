// create web server
// create a new comment
// delete a comment
// update a comment
// get all comments
// get a single comment
// get all comments related to a post

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { Comment } = require('../models/comment');
const { Post } = require('../models/post');
const { User } = require('../models/user');
const auth = require('../middleware/auth');

// create a new comment
router.post(
  '/',
  [
    auth,
    [
      check('post', 'Post is required').not().isEmpty(),
      check('comment', 'Comment is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // check if there are errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return errors
      return res.status(400).json({ errors: errors.array() });
    }

    // get user
    const user = await User.findById(req.user.id).select('-password');

    // get post
    const post = await Post.findById(req.body.post);

    // create new comment
    const comment = new Comment({
      post: req.body.post,
      comment: req.body.comment,
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
    });

    // save comment
    await comment.save();

    // add comment to post
    post.comments.unshift(comment);

    // save post
    await post.save();

    // return comment
    res.json(comment);
  }
);

// delete a comment
router.delete('/:id', auth, async (req, res) => {
  // get comment
  const comment = await Comment.findById(req.params.id);

  // check if comment exists
  if (!comment) {
    // return error
    return res.status(404).json({ msg: 'Comment not found' });
  }

  // check if comment belongs to user
  if (comment.user.toString() !== req.user.id) {
    // return error
    return res.status(401).json({ msg: 'User not authorized' });
  }

  // get post
  const post = await Post.findById(comment.post);

  // remove comment from post
  post.comments = post.comments.filter(
    (comment) => comment._id.toString() !== req.params.id
  );