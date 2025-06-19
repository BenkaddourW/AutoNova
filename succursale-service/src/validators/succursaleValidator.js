const { body } = require('express-validator');
const { PhoneNumberUtil, PhoneNumberFormat } = require('google-libphonenumber');
const phoneUtil = PhoneNumberUtil.getInstance();

// Liste des champs autorisés pour la création
const allowedFields = [
  'codeagence',
  'nomsuccursale',
  'adresse1',
  'adresse2',
  'ville',
  'codepostal',
  'province',
  'pays',
  'telephone'
];

// Fonction réutilisable pour la validation du téléphone
const validatePhoneNumber = (value, { req }) => {
  try {
    // Le code pays par défaut est crucial pour analyser les numéros locaux.
    // 'CA' pour Canada, 'FR' pour France, etc.
    const defaultCountry = 'CA'; 
    const numberProto = phoneUtil.parse(value, defaultCountry);

    if (!phoneUtil.isValidNumber(numberProto)) {
      throw new Error('Le format du numéro de téléphone est invalide.');
    }

    // Normaliser le numéro au format international E.164 (ex: +15141234567)
    // Cela garantit un format de données propre dans la base de données.
    const normalizedPhone = phoneUtil.format(numberProto, PhoneNumberFormat.E_164);
    
    // Remplacer la valeur dans req.body pour que le contrôleur la reçoive normalisée
    req.body.telephone = normalizedPhone;
    
    return true; // La validation est réussie
  } catch (e) {
    // phoneUtil.parse peut échouer si le format est complètement incorrect.
    throw new Error('Le format du numéro de téléphone est invalide.');
  }
};

// ====================================================================
// RÈGLES STRICTES POUR LA CRÉATION D'UNE SUCCURSALE (POST)
// ====================================================================
const createSuccursaleRules = [
  body('codeagence').notEmpty().withMessage('Le code agence est requis.').isString().trim().isLength({ max: 20 }).withMessage('20 caractères max'),
  body('nomsuccursale').notEmpty().withMessage('Le nom est requis.').isString().trim().isLength({ max: 50 }).withMessage('50 caractères max'),
  body('adresse1').notEmpty().withMessage('Adresse 1 requise.').isString().trim().isLength({ max: 100 }).withMessage('100 caractères max'),
  // body('adresse2').optional({ nullable: true }).isString().trim().isLength({ max: 100 }).withMessage('100 caractères max'),
  body('adresse2').optional().isString().trim().isLength({ max: 100 }).customSanitizer(value => value === '' ? null : value),
  body('ville').notEmpty().withMessage('La ville est requise.').isString().trim().isLength({ max: 50 }).withMessage('50 caractères max'),
  body('codepostal').notEmpty().withMessage('Le code postal est requis.').isString().trim().isLength({ max: 10 }).withMessage('10 caractères max'),
  body('province').notEmpty().withMessage('La province est requise.').isString().trim().isLength({ max: 50 }).withMessage('50 caractères max'),
  body('pays').notEmpty().withMessage('Le pays est requis.').isString().trim().isLength({ max: 50 }).withMessage('50 caractères max'),
  body('telephone').notEmpty().withMessage('Le téléphone est requis.').trim().custom(validatePhoneNumber),

  // Vérifie qu'aucun champ non autorisé n'est envoyé lors de la création
  body().custom(value => {
    const invalidKeys = Object.keys(value).filter(key => !allowedFields.includes(key));
    if (invalidKeys.length > 0) {
      throw new Error(`Champs non autorisés détectés : ${invalidKeys.join(', ')}`);
    }
    return true;
  })
];

// ====================================================================
// RÈGLES FLEXIBLES POUR LA MISE À JOUR D'UNE SUCCURSALE (PUT)
// ====================================================================
const updateSuccursaleRules = [
  // On utilise .optional() pour chaque champ. La validation ne s'appliquera que si le champ est fourni.
  // body('codeagence').optional().isString().trim().notEmpty().withMessage('Le code agence ne peut pas être vide.').isLength({ max: 20 }),
  body('nomsuccursale').optional().isString().trim().notEmpty().withMessage('Le nom ne peut pas être vide.').isLength({ max: 50 }),
  body('adresse1').optional().isString().trim().notEmpty().withMessage('Adresse 1 ne peut pas être vide.').isLength({ max: 100 }),
  // body('adresse2').optional({ nullable: true }).isString().trim().isLength({ max: 100 }), // Déjà optionnel, mais on le garde pour la clarté
  body('adresse2').optional({ nullable: true }).isString().trim().isLength({ max: 100 }).customSanitizer(value => value === '' ? null : value),
  body('ville').optional().isString().trim().notEmpty().withMessage('La ville ne peut pas être vide.').isLength({ max: 50 }),
  body('codepostal').optional().isString().trim().notEmpty().withMessage('Le code postal ne peut pas être vide.').isLength({ max: 10 }),
  body('province').optional().isString().trim().notEmpty().withMessage('La province ne peut pas être vide.').isLength({ max: 50 }),
  body('pays').optional().isString().trim().notEmpty().withMessage('Le pays ne peut pas être vide.').isLength({ max: 50 }),
  body('telephone').optional().trim().notEmpty().withMessage('Le téléphone ne peut pas être vide.').custom(validatePhoneNumber),

  // IMPORTANT : On retire le validateur custom qui vérifie les champs non autorisés,
  // car pour une mise à jour, il est normal et attendu de n'envoyer qu'un sous-ensemble des champs.
];

module.exports = { 
  createSuccursaleRules, 
  updateSuccursaleRules 
};
