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

//Fonction pour creer une inspectionexport async function createInspection(data, token) {
export async function createInspection(data, token) {
  const CONTRATS_API_URL = import.meta.env.VITE_API_CONTRATS_URL;
  const response = await fetch(`${CONTRATS_API_URL}/inspections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      dateinspection: data.dateinspection, // format ISO string
      kilometrage: Number(data.kilometrage),
      niveaucarburant: data.niveaucarburant,
      proprete: Boolean(data.proprete),
      typeinspection: data.typeinspection,
      idvehicule: Number(data.idvehicule),
      idcontrat: Number(data.idcontrat),
      note: data.note || "",
    }),
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la création de l'inspection");
  }
  return await response.json();
}
