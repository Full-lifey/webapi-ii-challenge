const express = require('express'); // imports express dependencies

const Posts = require('../data/db.js'); // imports all of the posts CRUD functions from db.js

const router = express.Router(); // imports router from express

router.use(express.json()); // gives the file the ability to parse URLs beginning with /api/posts so the server.use router functionality inside index.js works properly.

router.get('/', (req, res) => {
  Posts.find()
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err =>
      res
        .status(500)
        .json({ error: 'The posts information could not be retrieved.' })
    );
});

router.get('/:id', async (req, res) => {
  console.log(`hit /:id with ${req.params.id}`);
  try {
    const post = await Posts.findById(req.params.id);

    if (post.length) {
      res.status(200).json(post);
    } else {
      res
        .status(404)
        .json({ message: 'The post with the specified ID does not exist.' });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: 'The post information could not be retrieved.' });
  }
});

router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const postComments = await Posts.findPostComments(id);
    if (postComments && postComments.length) {
      res.status(200).json(postComments);
    } else {
      res
        .status(404)
        .json({ message: 'The post with the specified ID does not exist.' });
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: 'The comments information could not be retrieved.' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!isValidPost(req.body)) {
      res.status(400).json({
        errorMessage: 'Please provide title and contents for the post.'
      });
    } else {
      const post = await Posts.insert(req.body);
      res.status(201).json({ id: post.id, ...req.body });
    }
  } catch (err) {
    res.status(500).json({
      error: 'There was an error while saving the post to the database'
    });
  }
});

router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.body.text) {
      res
        .status(400)
        .json({ errorMessage: 'Please provide text for the comment.' });
    } else {
      const comment = await Posts.insertComment({ post_id: id, ...req.body });
      res.status(201).json({ post_id: comment.id, ...req.body });
    }
  } catch (err) {
    res.status(500).json({
      error: 'There was an error while saving the comment to the database'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const post = await Posts.remove(req.params.id);
    if (post > 0) {
      res.status(204).end();
    } else {
      res
        .status(404)
        .json({ message: 'The post with the specified ID does not exist.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'The post could not be removed' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!isValidPost(req.body)) {
      res.status(400).json({
        errorMessage: 'Please provide title and contents for the post.'
      });
    } else {
      const post = await Posts.update(req.params.id, req.body);
      if (post) {
        res.status(200).json(await Posts.findById(req.params.id));
      } else {
        res
          .status(404)
          .json({ message: 'The post with the specified ID does not exist.' });
      }
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: 'The post information could not be modified.' });
  }
});
function isValidPost(post) {
  const { title, contents } = post;
  return title && contents;
}

module.exports = router; // Exports router to add to index.js
