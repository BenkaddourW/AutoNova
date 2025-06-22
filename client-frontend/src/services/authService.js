
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

// On construit l'URL de base pour le service d'authentification via la Gateway
const AUTH_API_URL = `${GATEWAY_URL}/auth`;

const handleResponse = async (response) => {
  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }
  const errorBody = await response.json();
  throw new Error(errorBody.message || 'Une erreur est survenue.');
};

export const register = (userData) => {
  return fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).then(handleResponse);
};

export const login = (credentials) => {
  return fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(handleResponse);
};

export const logout = (refreshToken) => {
  return fetch(`${AUTH_API_URL}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(handleResponse);
};

// Mise à jour d'un utilisateur existant
// export const updateUser = (idutilisateur, userData) => {
//   const token = localStorage.getItem('accessToken');
//   return fetch(`${AUTH_API_URL}/utilisateurs/${idutilisateur}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(userData),
//   }).then(handleResponse);
// };