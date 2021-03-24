const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: '0',
    dislikes: '0'
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.addLike = (req, res, next) => {

  //On supprime L'utilisateur dans les tableaux usersLiked et usersDisliked
  Sauce.updateOne({ _id: req.params.id },
    { $pull: { usersLiked: req.body.userId, usersDisliked: req.body.userId }},
    { multi: true })
  .then(() => {

    //Si 1
    if (req.body.like > 0) {
      console.log('Utilisateur aime')

      //On ajoute l'utilisateur dans usersLiked
      Sauce.updateOne({ _id: req.params.id },
        { $push: { usersLiked: req.body.userId }})
      .then(() => {

        //Récupération des données
        Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          console.log(sauce.usersLiked.length)
          console.log(sauce.usersDisliked.length)

          //Initialisation des Likes/dislikes
          Sauce.updateOne({ _id: req.params.id },
            { likes: sauce.usersLiked.length, dislikes : sauce.usersDisliked.length})
          .then(() => res.status(200).json({ message: "L'utilisateur aime/aimes pas"}))
          .catch(error => res.status(400).json({ error }));
        })
        .catch((error) => {res.status(404).json({error: error})});
      })
      .catch(error => res.status(400).json({ error }));

    //Si -1
    } else if (req.body.like < 0) {
      console.log('Utilisateur n\'aime pas')

      //On ajoute l'utilisateur dans usersLiked
      Sauce.updateOne({ _id: req.params.id },
        { $push: { usersDisliked: req.body.userId }})
      .then(() => {

        //Récupération des données
        Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          console.log(sauce.usersLiked.length)
          console.log(sauce.usersDisliked.length)

          //Initialisation des Likes/dislikes
          Sauce.updateOne({ _id: req.params.id },
            { likes: sauce.usersLiked.length, dislikes : sauce.usersDisliked.length})
          .then(() => res.status(200).json({ message: "L'utilisateur aime/aimes pas"}))
          .catch(error => res.status(400).json({ error }));
        })
        .catch((error) => {res.status(404).json({error: error})});
      })
      .catch(error => res.status(400).json({ error }));
    }else{
      //Récupération des données
      Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        console.log(sauce.usersLiked.length)
        console.log(sauce.usersDisliked.length)

        //Initialisation des Likes/dislikes
        Sauce.updateOne({ _id: req.params.id },
          { likes: sauce.usersLiked.length, dislikes : sauce.usersDisliked.length})
        .then(() => res.status(200).json({ message: "L'utilisateur aime/aimes pas"}))
        .catch(error => res.status(400).json({ error }));
      })
      .catch((error) => {res.status(404).json({error: error})});
    };
  })
  .catch(error => res.status(400).json({ error }));
};