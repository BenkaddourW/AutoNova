const CONTRATS_API_URL = import.meta.env.VITE_API_CONTRATS_URL;

export const getContratById = async (id) => {
  try {
    const response = await fetch(`${CONTRATS_API_URL}/${id}`);
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
