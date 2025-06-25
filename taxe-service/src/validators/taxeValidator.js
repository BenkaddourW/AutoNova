// src/validators/taxeValidator.js (Version Finale Simplifiée et Corrigée)

const { body } = require('express-validator');

// Règles pour la création d'une taxe. Tous les champs sont requis.
exports.createTaxeRules = [
  body('denomination')
    .trim()
    .notEmpty().withMessage('La dénomination est requise.')
    .isString().withMessage('La dénomination doit être une chaîne de caractères.')
    .isLength({ max: 100 }).withMessage('La dénomination ne doit pas dépasser 100 caractères.'),
  
  body('abrege')
    .trim()
    .notEmpty().withMessage("L'abrégé est requis.")
    .isString().withMessage("L'abrégé doit être une chaîne de caractères.")
    .isLength({ max: 50 }).withMessage("L'abrégé ne doit pas dépasser 50 caractères."),

  body('taux')
    .notEmpty().withMessage('Le taux est requis.')
    .isFloat({ min: 0, max: 100 }).withMessage('Le taux doit être un nombre entre 0 et 100.'),

  // On s'assure que le tableau localites est bien un tableau s'il est fourni
  body('localites')
    .optional({ checkFalsy: true }) // Permet à 'localites' d'être absent, null ou un tableau vide
    .isArray().withMessage('Les localités doivent être un tableau.'),
  
  // On valide chaque élément à l'intérieur du tableau 'localites'
  body('localites.*.pays')
    .trim()
    .notEmpty().withMessage('Le pays est requis pour chaque localité.')
    .isString().withMessage('Le pays doit être une chaîne de caractères.'),
  
  body('localites.*.province')
    .trim()
    .notEmpty().withMessage('La province est requise pour chaque localité.')
    .isString().withMessage('La province doit être une chaîne de caractères.'),
];

// Les règles pour la mise à jour sont les mêmes, mais tous les champs sont optionnels.
exports.updateTaxeRules = [
    body('denomination')
      .optional()
      .trim()
      .notEmpty().withMessage('La dénomination est requise.')
      .isString().withMessage('La dénomination doit être une chaîne de caractères.')
      .isLength({ max: 100 }).withMessage('La dénomination ne doit pas dépasser 100 caractères.'),
    
    body('abrege')
      .optional()
      .trim()
      .notEmpty().withMessage("L'abrégé est requis.")
      .isString().withMessage("L'abrégé doit être une chaîne de caractères.")
      .isLength({ max: 50 }).withMessage("L'abrégé ne doit pas dépasser 50 caractères."),
  
    body('taux')
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Le taux doit être un nombre entre 0 et 100.'),
  
    body('localites')
      .optional()
      .isArray().withMessage('Les localités doivent être un tableau.'),
    
    body('localites.*.pays')
      .optional()
      .trim()
      .notEmpty().withMessage('Le pays est requis pour chaque localité.')
      .isString().withMessage('Le pays doit être une chaîne de caractères.'),
    
    body('localites.*.province')
      .optional()
      .trim()
      .notEmpty().withMessage('La province est requise pour chaque localité.')
      .isString().withMessage('La province doit être une chaîne de caractères.'),
];
