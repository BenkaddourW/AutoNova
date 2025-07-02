const API_URL = import.meta.env.VITE_API_UTILISATEURS_URL; // http://localhost:3000/auth

export const getUtilisateurs = async (filters = {}, token) => {
  // Nettoie les filtres vides pour ne pas envoyer de paramètres inutiles
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, v]) => v !== "" && v !== undefined && v !== null
    )
  );
  const params = new URLSearchParams(cleanFilters).toString();
  const response = await fetch(`${API_URL}/utilisateurs?${params}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok)
    throw new Error("Erreur lors de la récupération des utilisateurs");
  const data = await response.json();
  console.log("Réponse brute utilisateurs :", data);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.utilisateurs)) return data.utilisateurs;
  if (data && typeof data === "object") return [data];
  return [];
};


export const createUserByAdmin = async (data, token) => {
  // Correction : mappe succursale -> idsuccursale si présent
  const dataToSend = {
    ...data,
    idsuccursale: data.succursale,
  };
  delete dataToSend.succursale;

  const response = await fetch(`${API_URL}/admin/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(dataToSend),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Erreur lors de la création de l'utilisateur"
    );
  }
  return response.json();
};

export const updateUtilisateur = async (id, data, token) => {
  const response = await fetch(`${API_URL}/utilisateurs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || "Erreur lors de la modification de l'utilisateur"
    );
  }
  return response.json();
};
