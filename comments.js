// create web server
// get comments from database
// send back to client

const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');

// get comments from database
router.get('/', (req, res) => {
    Comment.find()
        .then(comments => res.json(comments))
        .catch(err => res.status(400).json('Error: ' + err));
});

// add comments to database
router.post('/', (req, res) => {
    const newComment = new Comment({
        name: req.body.name,
        comment: req.body.comment
    });

    newComment.save()
        .then(() => res.json('Comment added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
