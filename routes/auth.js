const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET Register
router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register', user: req.session.userId });
});

// POST Register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
});

// GET Login
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login', user: req.session.userId });
});

// POST Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.redirect('/login');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/login');
        }
        req.session.userId = user._id; // Set session
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/');
    });
});

module.exports = router;
