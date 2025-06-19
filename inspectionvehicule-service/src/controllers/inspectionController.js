const asyncHandler = require("express-async-handler");
// --- CORRECTION : Importer depuis le nouveau fichier central ---
const { Inspection, InspectionImage, sequelize } = require("../models/index"); 

exports.getInspections = asyncHandler(async (req, res) => {
  const inspections = await Inspection.findAll();
  res.json(inspections);
});

exports.getInspectionById = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findByPk(req.params.id);
  if (!inspection) {
    res.status(404);
    throw new Error("Inspection non trouvée");
  }
  res.json(inspection);
});

// Fichier : src/controllers/inspectionController.js

// ... (gardez les imports et les autres fonctions inchangés)

exports.createInspection = asyncHandler(async (req, res) => {
  console.log("-----------------------------------------");
  console.log("Début de la création d'une inspection");
  console.log("Données brutes reçues (req.body):", req.body);
  console.log("-----------------------------------------");

  // On récupère les données de la requête
  const { images, ...inspectionData } = req.body;

  // --- CONVERSION DES DONNÉES AVANT VALIDATION PAR SEQUELIZE ---

  // 1. Conversion du champ 'proprete' (chaîne de caractères -> booléen)
  if (typeof inspectionData.proprete === 'string') {
    inspectionData.proprete = (inspectionData.proprete === 'true');
  }

  // 2. Conversion du champ 'dateinspection' (chaîne ISO -> objet Date)
  if (inspectionData.dateinspection) {
    inspectionData.dateinspection = new Date(inspectionData.dateinspection);
  }
  
  // ------------------------------------------------------------------

  const transaction = await sequelize.transaction();
  try {
    // On crée l'inspection avec les données maintenant propres et correctement typées
    const newInspection = await Inspection.create(inspectionData, { transaction });

    // On gère les images si elles sont présentes
    if (images && images.length > 0) {
      const imageRecords = images.map((urlImage) => ({
        urlimage: urlImage,
        idinspection: newInspection.idinspection,
      }));
      await InspectionImage.bulkCreate(imageRecords, { transaction });
    }

    // Si tout s'est bien passé, on valide la transaction
    await transaction.commit();

    // On récupère l'inspection complète avec ses images pour la renvoyer au client
    const result = await Inspection.findByPk(newInspection.idinspection, {
      include: [{ model: InspectionImage, as: 'InspectionImages' }],
    });
    
    res.status(201).json(result);

  } catch (error) {
    // En cas d'erreur, on annule tout
    await transaction.rollback();
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("ERREUR CATCHÉE - La transaction a été annulée (rollback).");
    console.error("Détails de l'erreur Sequelize/BDD :");
    console.error(error); // Affiche l'objet erreur complet avec tous les détails
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    // Log de l'erreur côté serveur pour un débogage facile
    console.error("ERREUR DÉTAILLÉE (createInspection):", error); 
    
    // On prépare une réponse d'erreur claire pour le frontend
    const errors = error.errors ? error.errors.map((e) => ({ field: e.path, message: e.message })) : [];
    res.status(400).json({ message: error.message, errors });
  }
});
// ... (gardez les autres fonctions : updateInspection, deleteInspection, etc.) ...
exports.updateInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findByPk(req.params.id);
  if (!inspection) {
    res.status(404);
    throw new Error("Inspection non trouvée");
  }
  await inspection.update(req.body);
  res.json(inspection);
});

exports.deleteInspection = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findByPk(req.params.id);
  if (!inspection) {
    res.status(404);
    throw new Error("Inspection non trouvée");
  }
  await inspection.destroy();
  res.status(204).end();
});

exports.getInspectionsByContratId = asyncHandler(async (req, res) => {
  const { idcontrat } = req.params;
  const inspections = await Inspection.findAll({
    where: { idcontrat: idcontrat },
    include: [{ model: InspectionImage, as: 'InspectionImages' }], // Ceci fonctionnera maintenant
    order: [['dateinspection', 'ASC']]
  });
  res.json(inspections);
});