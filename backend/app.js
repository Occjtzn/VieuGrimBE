const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const userRoutes = require('./routes/user');
const booksRoutes = require('./routes/books')

mongoose.connect('mongodb+srv://thibaultcourrieu:8CYlFpayG1KsS5So@firstproject.44k1o.mongodb.net/?retryWrites=true&w=majority&appName=firstProject',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());
app.use('/images', express.static('images'));
app.use('/api/auth', userRoutes);
app.use('/api/books', booksRoutes);

module.exports = app;