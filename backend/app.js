const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const booksRoutes = require('./routes/books');
const userRoutes = require('./routes/user');
require('dotenv').config();


mongoose.connect('mongodb+srv://anthonyfontaine454:A3cqI7jhQ7C2mTCW@monvieuxgrimoire.ilcncbr.mongodb.net/?retryWrites=true&w=majority&appName=MonVieuxGrimoire',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((error) => console.error('Connexion à MongoDB échouée :', error));

  const app = express();


app.use(express.json()); // ce middleware intercepte toute les requetes qui contiennent du json et nous met à disposition le corps de la requête dans req.body (body parser fait la même chose)
//app.use on intercepte tout les requêtes.


app.use((req, res, next) => {
    // Tout cela va permettre a l'application d'accèder à l'api sans aucun problème.
    res.setHeader('Access-Control-Allow-Origin', '*'); // L'origine qui a le droit d'accèder à notre api = tout le monde
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // On donne l'autorisation de réaliser certaines requête
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/api/books', booksRoutes)
  app.use('/api/auth', userRoutes);


module.exports = app;

/* 
Les donénes on était intégré grâce à ce script

.then(() => {
      console.log('Connexion à MongoDB réussie !');
  
      // Lecture du fichier JSON contenant les données des livres
      const data = require('../frontend/public/data/data.json');
  
      // Insertion des livres dans la base de données
      Book.insertMany(data)
          .then(() => {
              console.log('Données insérées avec succès dans la base de données.');
              mongoose.connection.close(); // Fermeture de la connexion à la base de données une fois l'insertion terminée
          })
          .catch((error) => {
              console.error('Erreur lors de l\'insertion des données :', error);
              mongoose.connection.close(); // Fermeture de la connexion à la base de données en cas d'erreur
          });
  })
  .catch((error) => {
      console.error('Connexion à MongoDB échouée :', error);
  });*/