import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: GATEWAY_URL,
});

// ... votre gestionnaire d'erreur ...

export const login = async (email, motdepasse) => {
  try {
    // CORRECTION : L'URL correcte via la gateway est /auth/login, comme défini dans authRoutes.js
    const response = await apiClient.post('/auth/login', { email, motdepasse });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};