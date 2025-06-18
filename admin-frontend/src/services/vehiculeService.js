const API_URL = import.meta.env.VITE_API_VEHICULES_URL;
if (!API_URL) { throw new Error("ERREUR: VITE_API_VEHICULES_URL n'est pas définie !"); }

// Fonction utilitaire pour gérer les réponses HTTP
const handleResponse = async (response) => {
  if (response.ok) {
    // Pour les DELETE (204), il n'y a pas de corps JSON.
    return response.status === 204 ? null : response.json();
  }
  // S'il y a une erreur, on lance l'objet réponse entier.
  // Cela permet au 'catch' de lire le statut et le corps de l'erreur.
  throw response;
};

// --- Fonctions exportées ---
export const getVehicules = (params = new URLSearchParams()) => {
  return fetch(`${API_URL}?${params.toString()}`).then(handleResponse);
};
export const getVehiculeById = (id) => {
  return fetch(`${API_URL}/${id}`).then(handleResponse);
};
// export const createVehicule = (data) => {
//   return fetch(API_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data),
//   }).then(handleResponse);
// };
// export const updateVehicule = (id, data) => {
//   return fetch(`${API_URL}/${id}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data),
//   }).then(handleResponse);
// };
export const createVehicule = async (vehiculeData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehiculeData),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || 'Erreur lors de la création du véhicule.');
    err.errors = result.errors;
    throw err;
  }
  return result;
};

export const updateVehicule = async (id, vehiculeData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehiculeData),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || 'Erreur lors de la mise à jour du véhicule.');
    err.errors = result.errors;
    throw err;
  }
  return result;
};
export const deleteVehicule = (id) => {
  return fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(handleResponse);
};
export const getVehiculeGeneralStats = () => {
  return fetch(`${API_URL}/stats/general`).then(handleResponse);
};
export const getVehiculeFilterOptions = () => {
  return fetch(`${API_URL}/filter-options`).then(handleResponse);
};
export const getVehiculeStatsByMarque = () => {
  return fetch(`${API_URL}/stats/by-marque`).then(handleResponse);
};
