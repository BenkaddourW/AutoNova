import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeProvider'; // 1. Importer useTheme

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MonthlyChart = ({ chartData }) => {
  const { theme } = useTheme(); // 2. Obtenir le thème actuel

  // 3. Définir les couleurs en fonction du thème
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const titleColor = isDark ? '#f1f5f9' : '#1e293b'; // slate-100 / slate-800

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Nombre de réservations',
        data: chartData.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: textColor } },
      title: { display: true, text: 'Évolution Mensuelle des Réservations', color: titleColor },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    }
  };

  return (
    // Ajout des classes dark:
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-96">
      <Line options={options} data={data} />
    </div>
  );
};

export default MonthlyChart;