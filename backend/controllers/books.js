const { error } = require('console');
const Book = require('../models/books');
const fs = require('fs');

exports.createBook = (req, res, next) => {
    const thingObject = JSON.parse(req.body.book);
    delete thingObject._id;
    delete thingObject._userId;

    const { rating } = thingObject;

    const book = new Book({
        userId: req.auth.userId,
        title: thingObject.title,
        author: thingObject.author,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        year: thingObject.year,
        genre: thingObject.genre,
        ratings: thingObject.ratings.map(rating => ({
            userId: req.auth.userId,
            grade: rating.grade,
        })),
        averageRating: thingObject.averageRating,
    });
    book.save()
        .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

exports.getAllBook = (req, res, next) => {

    Book.find().then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneBook = (req, res, next) => {

    Book.findOne({
        _id: req.params.id
    }).then(
        (books) => {
            res.status(200).json(books);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.ratingBook = (req, res, next) => {
    const rating = req.body.rating;
    const userId = req.auth.userId;

    if (rating < 0 || rating > 5) {
        return res.status(400).json({ error: "La note doit être entre 0 et 5." });
    }

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (!book) return Promise.reject({ status: 404, message: "Livre non trouvé." });

            const existingRating = book.ratings.find(r => r.userId === userId);
            if (existingRating) {
                return Promise.reject({ status: 400, message: "Vous avez déjà noté ce livre." });
            }

            book.ratings.push({ userId, grade: rating });
            book.averageRating = book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length;
            return book.save();
        })
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(error.status || 500).json({ error: error.message || error }));
};



exports.bestRatingBook = (req, res, next) => {

    Book.find()

        .sort({ averageRating: -1 })
        .limit(3)
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error: error }));

};

exports.deleteBook = (req, res, next) => {

    Book.findOne({ _id: req.params.id })
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};