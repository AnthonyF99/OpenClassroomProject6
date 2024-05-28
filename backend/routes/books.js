const express = require('express');
const router = express.Router();

const Book = require('../models/Book');


router.get('/', (req, res, next) => {
    Book.find()  // Utilisez Book.find() pour récupérer tous les livres
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json(error));
});

router.get('/bestrating', (req, res, next) => {
    // Logique pour obtenir les livres avec la meilleure note
    Book.find({ averageRating: { $gte: 4 } }) // Par exemple, sélectionnez les livres avec une note moyenne de 4.5 ou plus
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json(error));
  })

router.get('/:id', (req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (Book) => {
        res.status(200).json(Book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  });

  module.exports = router;