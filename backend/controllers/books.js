//La logique metier de book
//Cela va nous permettre de créez des nom sémantique, donc des noms qui expliqueront ce que les routes feront.

const Book = require('../models/Book');
const mongoose = require('mongoose');
const fs = require('fs');

exports.getAllBook = (req, res, next) => {
    Book.find()  // Utilisez Book.find() pour récupérer tous les livres
        .then(books => res.status(200).json(books))
        .catch(error => res.status(404).json(error));
};

exports.getBestRatingBook = (req, res, next) => {
    // Logique pour obtenir les livres avec la meilleure note
    Book.find()
    .sort({ averageRating: -1 }) // Trier par note moyenne décroissante
    .limit(3) // Limiter le résultat aux 3 meilleurs livres
    .then(books => res.status(200).json(books))
    .catch(error => res.status(404).json(error));
  }

  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  // Sauvegardez le livre dans la base de données
  book.save()
    .then(() => {
      res.status(201).json({ message: 'Livre créé avec succès' });
    })
    .catch(error => {
      res.status(400).json(error);
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
    .then(book => {
      if (book.userId !== req.auth.userId) {
        res.status(403).json({message: 'Forbidden'});
      } else {
          const filename= book.imageUrl.split('/images')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({_id: req.params.id})
                .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                .catch(error => res.status(403).json({ error }));
          });
      }
    })
    .catch(error => { res.status(500).json({error});
  });
};

exports.rateBook = async (req, res, next) => {
  const userId = req.auth.userId;
  const grade = parseFloat(req.body.rating);

  // Valider la note
  if (grade < 1 || grade > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' });
  }

  try {
    // Trouver le livre par ID
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà noté le livre
    const existingRating = book.ratings.find(r => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId, grade });

    // Sauvegarder le livre avec la nouvelle note
    await book.save();

    // Calculer la nouvelle moyenne des notes avec agrégation
    const [result] = await Book.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $unwind: '$ratings' },
      { $group: {
        _id: '$_id',
        averageRating: { $avg: '$ratings.grade' }
      }}
    ]);

    // Arrondir la moyenne à une décimale
    const roundedAverageRating = Math.round((result.averageRating + Number.EPSILON) * 10) / 10;

    // Mettre à jour la moyenne des notes dans le document
    book.averageRating = roundedAverageRating;
    const updatedBook = await book.save();

    res.status(200).json({
      message: 'Note ajoutée avec succès',
      bookId: updatedBook._id,
      newRating: { userId, grade },
      averageRating: roundedAverageRating,
      ...updatedBook.toObject()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.getOneBook = (req, res, next) => {
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
  };