const { body } = require("express-validator");

const allowedFields = ["denomination", "abrege", "taux", "localites"];

const baseRules = [
  body("denomination")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Dénomination requise")
    .isLength({ max: 100 })
    .withMessage("100 caractères max"),
  body("abrege")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Abrégé requis")
    .isLength({ max: 50 })
    .withMessage("50 caractères max"),
  body("taux").isFloat({ min: 0, max: 100 }).withMessage("Taux invalide"),
  body("localites")
    .isArray({ min: 1 })
    .withMessage("Au moins une localité est requise"),
  body("localites.*.pays")
    .notEmpty()
    .withMessage("Le pays est requis pour chaque localité"),
  // province peut être null, donc pas de validation stricte ici
  body().custom((value) => {
    const invalid = Object.keys(value).filter(
      (k) => !allowedFields.includes(k)
    );
    if (invalid.length) {
      throw new Error(`Champs non autorisés: ${invalid.join(", ")}`);
    }
    return true;
  }),
];

const createTaxeRules = baseRules;
const updateTaxeRules = baseRules.map((rule) =>
  rule.optional({ nullable: true })
);

module.exports = { createTaxeRules, updateTaxeRules };
