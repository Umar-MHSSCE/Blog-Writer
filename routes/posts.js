const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { isLoggedIn } = require('../middleware');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// GET All Posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author').sort({ createdAt: -1 });
        res.render('posts/index', { title: 'All Blogs', posts, user: req.session.userId });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// GET New Post Form
router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new', { title: 'New Blog Post', user: req.session.userId });
});

// POST Create Post
router.post('/', isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            image: req.file ? '/uploads/' + req.file.filename : '',
            author: req.session.userId
        });
        await newPost.save();
        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        res.redirect('/posts/new');
    }
});

// GET Single Post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author');
        res.render('posts/show', { title: post.title, post, user: req.session.userId });
    } catch (err) {
        console.error(err);
        res.redirect('/posts');
    }
});

// GET Edit Form
router.get('/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.author.toString() !== req.session.userId) {
            return res.redirect('/posts');
        }
        res.render('posts/edit', { title: 'Edit Post', post, user: req.session.userId });
    } catch (err) {
        console.error(err);
        res.redirect('/posts');
    }
});

// PUT Update Post
router.put('/:id', isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (post.author.toString() !== req.session.userId) {
            return res.redirect('/posts');
        }

        post.title = req.body.title;
        post.content = req.body.content;
        if (req.file) {
            post.image = '/uploads/' + req.file.filename;
        }

        await post.save();
        res.redirect(`/posts/${post._id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/posts');
    }
});

// DELETE Post
router.delete('/:id', isLoggedIn, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.author.toString() !== req.session.userId) {
            return res.redirect('/posts');
        }
        await Post.findByIdAndDelete(req.params.id);
        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        res.redirect('/posts');
    }
});

module.exports = router;
