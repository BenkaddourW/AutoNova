const getStatusBadge = (status) => {
  switch (status) {
    case 'Confirmée':
      // Ajout des classes dark:
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'En attente':
      // Ajout des classes dark:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case 'Terminée':
    default:
      // Ajout des classes dark:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  }
};

const RecentReservations = ({ reservations }) => {
  return (
    // Ajout des classes dark:
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full">
      <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4">Réservations Récentes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          {/* Ajout des classes dark: */}
          <thead className="text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-2 font-medium">ID</th>
              <th className="py-2 font-medium">Client</th>
              <th className="py-2 font-medium">Véhicule</th>
              <th className="py-2 font-medium text-center">Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              // Ajout des classes dark:
              <tr key={res.id} className="border-b border-slate-200 dark:border-slate-700">
                <td className="py-3 font-mono text-sm">{res.id}</td>
                <td className="py-3">{res.client}</td>
                <td className="py-3">{res.vehicule}</td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(res.statut)}`}>
                    {res.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RecentReservations;