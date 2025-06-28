// --- UtilisateursTable.jsx ---
import React from "react";

const UtilisateursTable = ({ utilisateurs, succursales, onEdit }) => {
  console.log("Utilisateurs reçus dans la table :", utilisateurs);
  // Fonction utilitaire pour trouver le nom de la succursale
  const getNomSuccursale = (id) => {
    const s = succursales.find((s) => s.id === id);
    return s ? s.nom : id;
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-900">
          <tr>
            <th className="px-4 py-2 text-left">Nom</th>
            <th className="px-4 py-2 text-left">Prénom</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Rôle(s)</th>
            <th className="px-4 py-2 text-left">Succursale(s)</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800">
          {Array.isArray(utilisateurs) && utilisateurs.length > 0 ? (
            utilisateurs.map((u) => (
              <tr
                key={u.idutilisateur || u.email}
                className="hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <td className="px-4 py-2">{u.nom}</td>
                <td className="px-4 py-2">{u.prenom}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  {u.Roles && u.Roles.length > 0
                    ? u.Roles.map((r) => r.role).join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  {u.Employes && u.Employes.length > 0
                    ? u.Employes.map((e) =>
                        getNomSuccursale(e.idsuccursale)
                      ).join(", ")
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="btn-secondary"
                    onClick={() => onEdit(u)}
                    title="Modifier"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UtilisateursTable;
