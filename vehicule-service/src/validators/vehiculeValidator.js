const { body } = require('express-validator');

// ====================================================================
//            VALIDATEURS POUR LE MODÈLE VÉHICULE
//      Généré à partir des contraintes du modèle Sequelize
// ====================================================================

// --- Définitions basées sur le modèle Sequelize ---
const allowedFields = [
  'immatriculation', 'marque', 'modele', 'categorie', 'transmission',
  'energie', 'couleur', 'statut', 'kilometrage', 'sieges',
  'typeentrainement', 'tarifjournalier', 'montantcaution', 'succursaleidsuccursale'
];

// Valeurs exactes provenant de la contrainte `isIn` de votre modèle
const categorieValues = ['Compacte', 'Berline', 'SUV', 'Camionnette']; 
const statutValues = ['disponible', 'en_location', 'en_maintenance', 'hors_service'];

// ====================================================================
// RÈGLES STRICTES POUR LA CRÉATION (POST)
// ====================================================================
const createVehiculeRules = [
  // Champs STRING
  body('immatriculation').notEmpty().withMessage("L'immatriculation est requise.").isString().trim().isLength({ max: 20 }).withMessage("L'immatriculation ne doit pas dépasser 20 caractères."),
  body('marque').notEmpty().withMessage("La marque est requise.").isString().trim().isLength({ max: 50 }).withMessage("La marque ne doit pas dépasser 50 caractères."),
  body('modele').notEmpty().withMessage("Le modèle est requis.").isString().trim().isLength({ max: 50 }).withMessage("Le modèle ne doit pas dépasser 50 caractères."),
  body('transmission').notEmpty().withMessage("La transmission est requise.").isString().trim(),
  body('energie').notEmpty().withMessage("Le type d'énergie est requis.").isString().trim(),
  body('couleur').notEmpty().withMessage("La couleur est requise.").isString().trim(),
  body('typeentrainement').notEmpty().withMessage("Le type d'entraînement est requis.").isString().trim(),

  // Champs avec valeurs prédéfinies (Enum)
  body('categorie').notEmpty().withMessage("La catégorie est requise.").isString().isIn(categorieValues).withMessage(`La catégorie doit être l'une des suivantes : ${categorieValues.join(', ')}`),
  body('statut').notEmpty().withMessage("Le statut est requis.").isString().isIn(statutValues).withMessage(`Le statut doit être l'un des suivants : ${statutValues.join(', ')}`),

  // Champs INTEGER
  body('kilometrage').notEmpty().withMessage("Le kilométrage est requis.").isInt({ min: 0 }).withMessage("Le kilométrage doit être un nombre entier positif."),
  body('sieges').notEmpty().withMessage("Le nombre de sièges est requis.").isInt({ min: 1, max: 9 }).withMessage("Le nombre de sièges doit être entre 1 et 9."),
  body('succursaleidsuccursale').notEmpty().withMessage("L'ID de la succursale est requis.").isInt({ min: 1 }).withMessage("L'ID de la succursale doit être un entier valide."),

  // Champs DECIMAL/FLOAT
  body('tarifjournalier').notEmpty().withMessage("Le tarif journalier est requis.").isFloat({ min: 0 }).withMessage("Le tarif journalier doit être un nombre positif."),
  body('montantcaution').notEmpty().withMessage("Le montant de la caution est requis.").isFloat({ min: 0, max: 99999 }).withMessage("Le montant de la caution doit être entre 0 et 99999."),

  // Validateur pour s'assurer qu'aucun champ étranger n'est envoyé
  body().custom(value => {
    const invalidKeys = Object.keys(value).filter(key => !allowedFields.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Champs non autorisés détectés : ${invalidKeys.join(', ')}`);
    }
    return true;
  })
];

// ====================================================================
// RÈGLES FLEXIBLES POUR LA MISE À JOUR (PUT)
// ====================================================================
const updateVehiculeRules = [
  // On utilise .optional() pour ne valider un champ que s'il est fourni.
  body('immatriculation').optional().isString().trim().isLength({ max: 20 }).withMessage("L'immatriculation ne doit pas dépasser 20 caractères."),
  body('marque').optional().isString().trim().isLength({ max: 50 }).withMessage("La marque ne doit pas dépasser 50 caractères."),
  body('modele').optional().isString().trim().isLength({ max: 50 }).withMessage("Le modèle ne doit pas dépasser 50 caractères."),
  body('transmission').optional().isString().trim(),
  body('energie').optional().isString().trim(),
  body('couleur').optional().isString().trim(),
  body('typeentrainement').optional().isString().trim(),

  // Champs avec valeurs prédéfinies (Enum)
  body('categorie').optional().isString().isIn(categorieValues).withMessage(`La catégorie doit être l'une des suivantes : ${categorieValues.join(', ')}`),
  body('statut').optional().isString().isIn(statutValues).withMessage(`Le statut doit être l'un des suivants : ${statutValues.join(', ')}`),

  // Champs INTEGER
  body('kilometrage').optional().isInt({ min: 0 }).withMessage("Le kilométrage doit être un nombre entier positif."),
  body('sieges').optional().isInt({ min: 1, max: 9 }).withMessage("Le nombre de sièges doit être entre 1 et 9."),
  body('succursaleidsuccursale').optional().isInt({ min: 1 }).withMessage("L'ID de la succursale doit être un entier valide."),

  // Champs DECIMAL/FLOAT
  body('tarifjournalier').optional().isFloat({ min: 0 }).withMessage("Le tarif journalier doit être un nombre positif."),
  body('montantcaution').optional().isFloat({ min: 0, max: 99999 }).withMessage("Le montant de la caution doit être entre 0 et 99999."),
];

module.exports = { 
  createVehiculeRules, 
  updateVehiculeRules 
};
