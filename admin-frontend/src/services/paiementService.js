import axios from "axios";

const API_URL = import.meta.env.VITE_API_PAIEMENTS_URL;

// Paiement d'un contrat (enregistrement côté backend)
export const payerContrat = async (paiement, token) => {
  const response = await axios.post(`${API_URL}/paiement-contrat`, paiement, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
