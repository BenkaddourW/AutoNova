// URL du service d'agrégation du Dashboard
const DASHBOARD_API_URL = import.meta.env.VITE_API_DASHBOARD_URL;
// URL du service des Réservations pour les données spécifiques
const RESERVATIONS_API_URL = import.meta.env.VITE_API_RESERVATIONS_URL;

if (!DASHBOARD_API_URL || !RESERVATIONS_API_URL) {
  throw new Error("ERREUR: Les URLs du dashboard ou des réservations manquent dans le .env !");
}

/**
 * Récupère toutes les statistiques agrégées pour le dashboard.
 */
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${DASHBOARD_API_URL}/dashboard-data`);
    if (!response.ok) throw new Error('Erreur de récupération des stats du dashboard.');
    return response.json();
  } catch (error) {
    console.error("Erreur dans getDashboardStats:", error);
    // Retourne un objet par défaut complet pour éviter les erreurs dans le composant
    return { 
      vehicules: { total: 0 }, 
      succursales: { count: 0 }, 
      reservationsActives: 0,
      utilisateurs: { total: 0 } 
    };
  }
};

/**
 * Récupère les réservations récentes pour le widget du dashboard.
 */
export const getRecentReservations = async () => {
  try {
    const response = await fetch(`${RESERVATIONS_API_URL}/recent`);
    if (!response.ok) throw new Error('Erreur de récupération des réservations récentes.');
    const data = await response.json();
    return data.map(res => ({
      id: res.numeroreservation || res.idreservation,
      client: (res.Client && `${res.Client.prenom} ${res.Client.nom}`) || 'Client inconnu',
      vehicule: (res.Vehicule && `${res.Vehicule.marque} ${res.Vehicule.modele}`) || 'Véhicule inconnu',
      statut: res.statut,
    }));
  } catch (error) {
    console.error("Erreur dans getRecentReservations:", error);
    return [];
  }
};

/**
 * Récupère les données d'évolution mensuelle pour le graphique du dashboard.
 */
export const getMonthlyEvolution = async () => {
  try {
    const response = await fetch(`${RESERVATIONS_API_URL}/stats/monthly-evolution`);
    if (!response.ok) throw new Error('Erreur de récupération de l\'évolution mensuelle.');
    return response.json();
  } catch (error) {
    console.error("Erreur dans getMonthlyEvolution:", error);
    return { labels: [], data: [] };
  }
};
