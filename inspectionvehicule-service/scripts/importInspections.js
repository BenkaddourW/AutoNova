// Fichier : inspectionVehicule-service/scripts/importInspections.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sequelize = require('../src/config/database');
const InspectionImage = require('../src/models/inspection_image'); // On importe le bon modèle

async function importInspectionImages() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Utilisez la clé de service pour les scripts
  const bucketName = process.env.SUPABASE_INSPECTION_BUCKET_NAME;

  if (!supabaseUrl || !supabaseKey || !bucketName) {
    throw new Error('Les informations Supabase (URL, KEY, BUCKET_NAME) sont manquantes dans le .env');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Lecture des fichiers depuis le bucket : ${bucketName}...`);
  const { data: files, error } = await supabase.storage.from(bucketName).list('', { limit: 1000 });
  if (error) throw error;

  for (const file of files) {
    if (!file.name || file.name.startsWith('.')) continue; // Ignore les fichiers cachés

    // Nouvelle expression régulière pour matcher "inspection_[ID]_[...]"
    const match = file.name.match(/^inspection_(\d+)_.*$/);
    if (!match) {
      console.warn(`Fichier ignoré car le nom ne respecte pas le format 'inspection_[ID]_...' : ${file.name}`);
      continue;
    }

    const idinspection = parseInt(match[1], 10);
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(file.name);

    // Votre modèle `InspectionImage` n'a pas de colonne `estprincipale`, donc on ne la gère pas.
    await InspectionImage.create({
      urlimage: publicUrlData.publicUrl,
      idinspection: idinspection, // On lie à l'ID de l'inspection
    });
    console.log(`Image insérée : ${file.name} pour l'inspection ID ${idinspection}`);
  }
}

// On s'assure que la base de données est prête avant de lancer le script
sequelize.sync().then(() => {
  console.log('Connexion à la base de données réussie.');
  importInspectionImages()
    .then(() => {
      console.log('Importation des images d\'inspection terminée avec succès !');
      sequelize.close();
    })
    .catch((err) => {
      console.error('Erreur durant l\'importation :', err);
      sequelize.close();
    });
});
