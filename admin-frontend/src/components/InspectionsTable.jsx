import { Edit, Trash2 } from 'lucide-react';

const InspectionsTable = ({ inspections, onEdit, onDelete }) => (
  <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
      <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
        <tr>
          <th className="px-6 py-3">Date</th>
          <th className="px-6 py-3">Kilométrage</th>
          <th className="px-6 py-3">Niveau Carburant</th>
          <th className="px-6 py-3">Propreté</th>
          <th className="px-6 py-3">Note</th>
          <th className="px-6 py-3">Type</th>
          <th className="px-6 py-3">ID Véhicule</th>
          <th className="px-6 py-3">ID Contrat</th>
          <th className="px-6 py-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {inspections.length === 0 ? (
          <tr><td colSpan="9" className="text-center py-8 italic">Aucune inspection.</td></tr>
        ) : (
          inspections.map((insp) => (
            <tr key={insp.idinspection} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
              <td className="px-6 py-4">{new Date(insp.dateinspection).toLocaleDateString()}</td>
              <td className="px-6 py-4">{insp.kilometrage}</td>
              <td className="px-6 py-4">{insp.niveaucarburant}</td>
              <td className="px-6 py-4">{insp.proprete ? 'Oui' : 'Non'}</td>
              <td className="px-6 py-4">{insp.note}</td>
              <td className="px-6 py-4">{insp.typeinspection}</td>
              <td className="px-6 py-4">{insp.idvehicule}</td>
              <td className="px-6 py-4">{insp.idcontrat}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onEdit(insp)} className="p-1 text-sky-600 hover:text-sky-800"><Edit size={16} /></button>
                  <button onClick={() => onDelete(insp.idinspection)} className="p-1 text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default InspectionsTable;
