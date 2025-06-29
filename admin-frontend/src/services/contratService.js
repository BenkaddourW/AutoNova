const CONTRATS_API_URL = import.meta.env.VITE_API_CONTRATS_URL;

export const getContratById = async (id, token) => {
  try {
    const response = await fetch(`${CONTRATS_API_URL}/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) throw new Error("Erreur de récupération du contrat.");
    return await response.json();
  } catch (error) {
    console.error("Erreur dans getContratById:", error);
    return null;
  }
};

export const updateContrat = async (id, data) => {
  try {
    const response = await fetch(`${CONTRATS_API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new Error("Erreur lors de la mise à jour du contrat.");
    return await response.json();
  } catch (error) {
    console.error("Erreur dans updateContrat:", error);
    throw error;
  }
};

// Fonction pour créer un contrat
// Cette fonction prend une réservation et un token d'authentification
export async function creerContrat(reservation, token) {
  const response = await fetch(CONTRATS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reservation),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error("Erreur lors de la création du contrat");
  }
  return data;
}
