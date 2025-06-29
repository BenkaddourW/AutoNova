const RESERVATIONS_API_URL = import.meta.env.VITE_API_RESERVATIONS_URL;

export const getReservations = async (user, filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Filtres principaux
    if (filters.numeroreservation)
      params.append("numeroreservation", filters.numeroreservation);
    if (filters.nom) params.append("nom", filters.nom);
    if (filters.prenom) params.append("prenom", filters.prenom);
    if (filters.succursale) params.append("succursale", filters.succursale);
    if (filters.date_livraison)
      params.append("date_rdv", filters.date_livraison);
    if (filters.date_retour) params.append("date_retour", filters.date_retour);
    if (filters.date_creation)
      params.append("date_creation", filters.date_creation);

    // Si employé, forcer la succursale par défaut si non précisé dans les filtres
    if (user?.role === "employe" && user.idsuccursale && !filters.succursale) {
      params.append("succursale", user.idsuccursale);
    }

    const response = await fetch(
      `${RESERVATIONS_API_URL}?${params.toString()}`
    );
    if (!response.ok)
      throw new Error("Erreur de récupération des réservations.");
    return await response.json();
  } catch (error) {
    console.error("Erreur dans getReservations:", error);
    return [];
  }
};

// Récupérer une réservation par ID
export const getReservationById = async (id) => {
  try {
    const response = await fetch(`${RESERVATIONS_API_URL}/${id}`);
    if (!response.ok)
      throw new Error("Erreur de récupération de la réservation.");
    return await response.json();
  } catch (error) {
    console.error("Erreur dans getReservationById:", error);
    return null;
  }
};

// Mettre à jour une réservation
export const updateReservation = async (id, data) => {
  try {
    const response = await fetch(`${RESERVATIONS_API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok)
      throw new Error("Erreur lors de la mise à jour de la réservation.");
    return await response.json();
  } catch (error) {
    console.error("Erreur dans updateReservation:", error);
    throw error;
  }
};

export async function getReservationFullDetails(id, token) {
  const response = await fetch(
    `${import.meta.env.VITE_API_RESERVATIONS_URL}/${id}/full-details`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des détails");
  console.log("Response:", response);
  return await response.json();
}
