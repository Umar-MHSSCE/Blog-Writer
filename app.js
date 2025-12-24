require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session Config
app.use(session({
    secret: 'secret_key_should_be_in_env',
    resave: false,
    saveUninitialized: false,
    // Note: In production, use connect-mongo for store
}));

// Middleware to make user ID available in templates
app.use((req, res, next) => {
    res.locals.user = req.session.userId;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

app.use('/', authRoutes);
app.use('/posts', postRoutes);

app.get('/', (req, res) => {
    res.redirect('/posts');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
