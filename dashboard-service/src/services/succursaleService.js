const axios = require('axios');
// L'URL du microservice cible
const baseURL = process.env.SUCCURSALE_SERVICE_URL; 

async function getSuccursaleCount() {
  try {
    // Il appelle le endpoint /count du microservice
    const { data } = await axios.get(`${baseURL}/succursales/count`);
    return data;
  } catch (error) {
    console.error('Error fetching succursale count:', error.message);
    return { count: 0 }; // Retourner un objet avec "count" pour la cohérence
  }
}

async function getAllSuccursales() {
  try {
    // On appelle la route de base du microservice, sans limite
    const { data } = await axios.get(`${baseURL}/succursales`);
    return data;
  } catch (error) {
    console.error('Error fetching all succursales:', error.message);
    return [];
  }
}

module.exports = { getSuccursaleCount, getAllSuccursales };