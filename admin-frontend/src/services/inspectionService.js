const API_URL = import.meta.env.VITE_API_INSPECTIONS_URL;
if (!API_URL) {
  throw new Error("ERREUR: VITE_API_INSPECTIONS_URL n'est pas definie !");
}

const handleResponse = async (response) => {
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }
  throw response;
};

export const getInspections = () => {
  return fetch(`${API_URL}`).then(handleResponse);
};

export const getInspectionById = (id) => {
  return fetch(`${API_URL}/${id}`).then(handleResponse);
};

export const createInspection = (data) => {
  return fetch(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse);
};

export const updateInspection = (id, data) => {
  return fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse);
};

export const deleteInspection = (id) => {
  return fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(handleResponse);
};

export const getInspectionsByContratId = (idcontrat) => {
  if (!idcontrat) throw new Error("L'ID du contrat est manquant.");
  // On appelle la nouvelle route du backend
  return fetch(`${API_URL}/contrat/${idcontrat}`).then(handleResponse);
};