// src/components/TaxesTable.jsx (Version Finale Simplifiée)

import { Edit, Trash2 } from 'lucide-react';

const TaxesTable = ({ taxes, onEdit, onDelete }) => (
  <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
      <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
        <tr>
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Dénomination</th>
          <th className="px-6 py-3">Abrégé</th>
          <th className="px-6 py-3">Taux (%)</th>
          <th className="px-6 py-3">Pays</th>
          <th className="px-6 py-3">Province</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {taxes.map((t) => (
          <tr key={t.idtaxe} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
            <td className="px-6 py-4 font-mono text-xs">{t.idtaxe}</td>
            <td className="px-6 py-4">{t.denomination}</td>
            <td className="px-6 py-4">{t.abrege}</td>
            <td className="px-6 py-4">{Number(t.taux).toFixed(2)}</td>
            {/* ✅ On lit maintenant directement les propriétés de premier niveau */}
            <td className="px-6 py-4">{t.pays}</td>
            <td className="px-6 py-4">{t.province}</td>
            <td className="px-6 py-4 text-center flex justify-center gap-2">
              <button onClick={() => onEdit(t)} className="p-1 text-sky-600 hover:text-sky-800"><Edit size={16} /></button>
              <button onClick={() => onDelete(t.idtaxe)} className="p-1 text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TaxesTable;
