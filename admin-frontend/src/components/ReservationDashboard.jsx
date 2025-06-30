const StatBox = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
      {value}
    </p>
  </div>
);

const ReservationDashboard = ({ stats }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    <StatBox label="Total du jour" value={stats?.total || 0} />
    <StatBox label="Livraisons prévues" value={stats?.livraisons || 0} />
    <StatBox label="En attente" value={stats?.en_attente || 0} />
    <StatBox label="Annulées" value={stats?.annulees || 0} />
  </div>
);

export default ReservationDashboard;
