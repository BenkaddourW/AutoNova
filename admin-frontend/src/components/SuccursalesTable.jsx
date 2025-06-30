import { Edit, Trash2 } from 'lucide-react';

const SuccursalesTable = ({ succursales, onEdit, onDelete, currentPage = 1, pageSize = 10 }) => {
  // Calcul du numéro de départ pour la pagination
  const startNumber = (currentPage - 1) * pageSize + 1;

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <th className="px-3 py-3 text-center">N°</th>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Code Agence</th>
            <th className="px-6 py-3">Nom</th>
            <th className="px-6 py-3">Ville</th>
            <th className="px-6 py-3">Téléphone</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {succursales.length === 0 ? (
            <tr><td colSpan="7" className="text-center py-8 text-slate-500 italic">Aucune succursale trouvée.</td></tr>
          ) : (
            succursales.map((s, index) => {
              const rowNumber = startNumber + index;
              
              return (
                <tr key={s.idsuccursale} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="px-3 py-4 text-center font-mono text-sm text-slate-600 dark:text-slate-400">
                    {rowNumber}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{s.idsuccursale}</td>
                  <td className="px-6 py-4 font-mono">{s.codeagence}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.nomsuccursale}</td>
                  <td className="px-6 py-4">{s.ville}</td>
                  <td className="px-6 py-4">{s.telephone}</td>
                  <td className="px-6 py-4 text-center flex justify-center gap-2">
                    <button onClick={() => onEdit(s)} className="p-1 text-sky-600 hover:text-sky-800"><Edit size={16} /></button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SuccursalesTable;
