/**
 * Ce service gère TOUTES les opérations CRUD pour les SUCCURSALES.
 * Il parle directement au microservice des succursales.
 */

const API_URL = import.meta.env.VITE_API_SUCCURSALES_URL;

if (!API_URL) {
  throw new Error("ERREUR: VITE_API_SUCCURSALES_URL n'est pas définie dans le fichier .env !");
}

export const getSuccursales = async (params = new URLSearchParams()) => {
  const url = `${API_URL}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur de récupération des succursales.');
  return response.json();
};

export const getSuccursaleById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) throw new Error('Succursale non trouvée.');
  return response.json();
};

export const getNextCode = async () => {
  const response = await fetch(`${API_URL}/next-code`);
  if (!response.ok) throw new Error('Erreur de génération du code agence.');
  const data = await response.json();
  return data.codeagence;
};

export const createSuccursale = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || 'Erreur de création de la succursale.');
    err.errors = result.errors;
    throw err;
  }
  return result;
};

export const updateSuccursale = async (id, data) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || 'Erreur de mise à jour de la succursale.');
    err.errors = result.errors;
    throw err;
  }
  return result;
};

// Récupère la liste des succursales pour les sélecteurs
export const getSuccursalesList = async () => {
  try {
    const response = await fetch(API_URL); // Utilise la même URL que getSuccursales
    if (!response.ok) throw new Error('Erreur de récupération de la liste des succursales.');
    return response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des succursales", error);
    throw error;
  }
};