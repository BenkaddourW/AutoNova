const { body } = require('express-validator');

const allowedFields = [
  'numeroreservation',
  'datereservation',
  'daterdv',
  'dateretour',
  'montanttotal',
  'taxes',
  'montantttc',
  'statut',
  'idclient',
  'idsuccursalelivraison',
  'idsuccursaleretour',
  'idvehicule',
  'idpaiement'
];

const statutValues = ['Confirmée', 'Terminée', 'Active', 'Annulée'];

const baseRules = [
  body('numeroreservation')
    .isString().trim().notEmpty().withMessage('Numéro requis')
    .isLength({ max: 30 }).withMessage('30 caractères max'),
  body('datereservation').isISO8601().withMessage('Date réservation invalide'),
  body('daterdv').isISO8601().withMessage('Date RDV invalide'),
  body('dateretour').isISO8601().withMessage('Date retour invalide'),
  body('montanttotal').isFloat({ min: 0 }).withMessage('Montant total négatif'),
  body('taxes').isFloat({ min: 0 }).withMessage('Taxes négatives'),
  body('montantttc').isFloat({ min: 0 }).withMessage('Montant TTC négatif'),
  body('statut').isString().isIn(statutValues).withMessage('Statut invalide'),
  body('idclient').isInt({ min: 1 }).withMessage('Client invalide'),
  body('idsuccursalelivraison').isInt({ min: 1 }).withMessage('Succursale livraison invalide'),
  body('idsuccursaleretour').isInt({ min: 1 }).withMessage('Succursale retour invalide'),
  body('idvehicule').isInt({ min: 1 }).withMessage('Véhicule invalide'),
  body('idpaiement').isInt({ min: 1 }).withMessage('Paiement invalide'),
  body().custom(value => {
    const invalid = Object.keys(value).filter(k => !allowedFields.includes(k));
    if (invalid.length) {
      throw new Error(`Champs non autorisés: ${invalid.join(', ')}`);
    }
    return true;
  })
];

const createReservationRules = baseRules;
const updateReservationRules = baseRules.map(rule => rule.optional({ nullable: true }));


module.exports = {
  createReservationRules,
  updateReservationRules        
};