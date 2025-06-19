require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sequelize = require('../config/database');
const VehiculeImage = require('../models/vehicule_image');

async function importImages() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const bucket = 'vehicules';

  const { data: files, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
  if (error) throw error;

  for (const file of files) {
    if (!file.name) continue;
    const match = file.name.match(/^(\d+)_.*$/);
    if (!match) {
      console.warn(`Filename ${file.name} skipped: no id found.`);
      continue;
    }
    const id = parseInt(match[1], 10);
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
    const isFront = file.name.toLowerCase().includes('front');

    await VehiculeImage.create({
      urlimage: publicUrlData.publicUrl,
      estprincipale: isFront,
      vehicule_idvehicule: id,
    });
    console.log(`Inserted image ${file.name} for vehicule ${id}`);
  }
}

sequelize.sync().then(() => {
  importImages()
    .then(() => {
      console.log('Import completed');
      sequelize.close();
    })
    .catch((err) => {
      console.error('Error during import:', err);
      sequelize.close();
    });
});
