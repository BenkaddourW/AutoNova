const { body } = require('express-validator');

const allowedFields = [
  'dateinspection',
  'kilometrage',
  'niveaucarburant',
  'proprete',
  'note',
  'typeinspection',
  'idvehicule',
  'idcontrat'
];

const createInspectionRules = [
  body('dateinspection').notEmpty().isISO8601(),
  body('kilometrage').notEmpty().isInt({ min: 0 }),
  body('niveaucarburant').notEmpty().isString(),
  body('proprete').notEmpty().isBoolean(),
  body('note').optional().isString(),
  body('typeinspection').notEmpty().isString(),
  body('idvehicule').notEmpty().isInt({ min: 1 }),
  body('idcontrat').notEmpty().isInt({ min: 1 }),
  body().custom(value => {
    const invalidKeys = Object.keys(value).filter(k => !allowedFields.includes(k));
    if (invalidKeys.length > 0) {
      throw new Error(`Champs non autorisés: ${invalidKeys.join(', ')}`);
    }
    return true;
  })
];

const updateInspectionRules = [
  body('dateinspection').optional().isISO8601(),
  body('kilometrage').optional().isInt({ min: 0 }),
  body('niveaucarburant').optional().isString(),
  // body('proprete').optional().isBoolean(),
  // body('proprete').notEmpty().isIn(['true', 'false', true, false]).withMessage('La valeur pour propreté doit être true ou false'),
  body('proprete')
    .notEmpty()
    .isIn(['true', 'false'])
    .withMessage('La valeur pour propreté doit être true ou false')
    .custom((value) => {
      console.log(`VALIDATEUR - Reçu pour 'proprete': ${value} (type: ${typeof value})`);
      return true; // On retourne toujours true pour ne pas bloquer la validation
    }),

  // body('kilometrage').notEmpty().isInt({ min: 0 }),
  body('note').optional().isString(),
  body('typeinspection').optional().isString(),
  body('idvehicule').optional().isInt({ min: 1 }),
  body('idcontrat').optional().isInt({ min: 1 })
];

module.exports = {
  createInspectionRules,
  updateInspectionRules
};
