// La logique routing de book

const express = require('express');
const router = express.Router();

const { upload, optimizeImage } = require('../middleware/multer-config');

const auth = require('../middleware/auth');

const BookCtrl = require('../controllers/books');



// auth à rajouter pour les routes qui auront besoin
router.get('/', BookCtrl.getAllBook);
router.post('/', auth, upload, optimizeImage, BookCtrl.createBook);
router.get('/bestrating', BookCtrl.getBestRatingBook);
router.get('/:id', BookCtrl.getOneBook);
router.put('/:id', auth, upload, optimizeImage, BookCtrl.modifyBook);
router.post('/:id/rating', auth, BookCtrl.rateBook)
router.delete('/:id', auth, BookCtrl.deleteBook);


module.exports = router;