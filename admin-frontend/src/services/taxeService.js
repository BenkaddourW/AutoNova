const API_URL = import.meta.env.VITE_API_TAXES_URL;
if (!API_URL) {
  throw new Error("ERREUR: VITE_API_TAXES_URL n'est pas définie dans le fichier .env !");
}

const handleResponse = async (response) => {
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }
  throw response;
};

export const getTaxes = (params = new URLSearchParams()) => {
  return fetch(`${API_URL}?${params.toString()}`).then(handleResponse);
};
export const getTaxeById = (id) => {
  return fetch(`${API_URL}/${id}`).then(handleResponse);
};
export const createTaxe = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || 'Erreur de création de la taxe.');
    err.errors = result.errors;
    throw err;
  }
  return result;
};
export const updateTaxe = async (id, data) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(result.message || 'Erreur de mise à jour de la taxe.');
    err.errors = result.errors;
    throw err;
  }
  return result;
};
export const deleteTaxe = (id) => {
  return fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(handleResponse);
};
