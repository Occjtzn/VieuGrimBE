const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/books');

router.get('/', bookCtrl.getAllBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', multer, auth, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.ratingBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/bestrating', bookCtrl.bestRatingBook);
// router.put('/books/:id', auth, bookCtrl.modifyBook);



module.exports = router;