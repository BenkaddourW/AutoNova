import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatBox = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow text-center">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
);

const VehiculeDashboard = ({ vehicules }) => {
  const total = vehicules.length;
  const disponibles = vehicules.filter(v => v.statut === 'disponible').length;
  const enLocation = vehicules.filter(v => v.statut === 'en_location').length;
  const horsService = vehicules.filter(v => v.statut === 'hors_service').length;

  const data = {
    labels: ['Disponible', 'En location', 'Hors service'],
    datasets: [
      {
        data: [disponibles, enLocation, horsService],
        backgroundColor: ['#4ade80', '#60a5fa', '#f87171'],
      },
    ],
  };
console.log("Tous les statuts:", vehicules.map(v => v.statut));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox label="Total" value={total} />
        <StatBox label="Disponibles" value={disponibles} />
        <StatBox label="En location" value={enLocation} />
        <StatBox label="Hors service" value={horsService} />
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow w-64 h-64 mx-auto">
        <Pie data={data} />
      </div>
    </div>
  );
};

export default VehiculeDashboard;