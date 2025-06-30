import { Edit, Trash2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const StatutBadge = ({ statut }) => {
  const statutColors = {
    Confirmée:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Active: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
    Terminée:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
    Annulée: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };
  const formattedStatut =
    (statut || "").charAt(0).toUpperCase() + (statut || "").slice(1);
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        statutColors[statut] || "bg-slate-200"
      }`}
    >
      {formattedStatut}
    </span>
  );
};

const ReservationTable = ({ reservations, onEdit, onDelete }) => (
  <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
      <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
        <tr>
          <th className="px-6 py-3">Numéro</th>
          <th className="px-6 py-3">Client</th>
          <th className="px-6 py-3">Succursale</th>
          <th className="px-6 py-3">Véhicule</th>
          <th className="px-6 py-3">Date livraison</th>
          <th className="px-6 py-3">Date retour</th>
          <th className="px-6 py-3 text-center">Statut</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {reservations.length === 0 ? (
          <tr>
            <td colSpan="8" className="text-center py-8 text-slate-500 italic">
              Aucune réservation trouvée.
            </td>
          </tr>
        ) : (
          reservations.map((r) => (
            <tr
              key={r.idreservation}
              className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              <td className="px-6 py-4 font-mono">{r.numeroreservation}</td>
              <td className="px-6 py-4">
                {r.Client?.Utilisateur
                  ? `${r.Client.Utilisateur.nom} ${r.Client.Utilisateur.prenom}`
                  : "-"}
              </td>
              <td className="px-6 py-4">
                {r.SuccursaleLivraison?.nomsuccursale ||
                  r.idsuccursalelivraison ||
                  "-"}
              </td>
              <td className="px-6 py-4">
                {r.Vehicule
                  ? `${r.Vehicule.marque} ${r.Vehicule.modele}`
                  : r.idvehicule || "-"}
              </td>
              <td className="px-6 py-4">{r.daterdv || "-"}</td>
              <td className="px-6 py-4">{r.dateretour || "-"}</td>
              <td className="px-6 py-4 text-center">
                <StatutBadge statut={r.statut} />
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <Link
                    to={`/reservations/${r.idreservation}`}
                    className="p-1 text-sky-600 hover:text-sky-800"
                    title="Voir / Modifier / Générer contrat"
                  >
                    <Edit size={16} />
                  </Link>
                  {/* Bouton Générer Contrat, actif uniquement pour les réservations confirmées */}
                  <button
                    onClick={() => {
                      /* action pour générer le contrat */
                    }}
                    className={`p-1 ${
                      r.statut === "Confirmée"
                        ? "text-green-600 hover:text-green-800 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    title="Générer le contrat"
                    disabled={r.statut !== "Confirmée"}
                  >
                    <FileText size={16} />
                  </button>
                  {/* <button onClick={() => onDelete(r.idreservation)} className="p-1 text-red-600 hover:text-red-800" title="Supprimer">
                    <Trash2 size={16} />
                  </button> */}
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default ReservationTable;
