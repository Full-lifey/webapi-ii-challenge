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

module.exports = router; // Exports router to add to index.js
