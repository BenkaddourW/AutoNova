import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeProvider';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ chartData, title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
  const titleColor = isDark ? '#f1f5f9' : '#1e293b';

  // --- CORRECTION DÉFINITIVE ---
  // Même logique de robustesse ici.
  const data = {
    labels: chartData?.labels || [],
    datasets: (chartData?.datasets && Array.isArray(chartData.datasets)) ? chartData.datasets : [{ data: [] }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        color: titleColor,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 15 }
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f1f5f9' : '#1e293b',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
      }
    },
    scales: {
      x: { 
        ticks: { color: textColor, precision: 0 }, // precision: 0 pour forcer les entiers
        grid: { color: gridColor } 
      },
      y: { 
        ticks: { color: textColor }, 
        grid: { color: 'transparent' }
      },
    }
  };

  const hasData = data.datasets.some(dataset => dataset.data && dataset.data.length > 0 && dataset.data.some(d => d > 0));

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg h-96 w-full flex items-center justify-center">
      {hasData ? (
        <Bar options={options} data={data} />
      ) : (
        <span className="text-slate-400">Aucune donnée à afficher pour ce graphique.</span>
      )}
    </div>
  );
};

export default BarChart;
