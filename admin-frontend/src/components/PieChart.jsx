import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { useTheme } from '../context/ThemeProvider';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = ({ chartData, title }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const titleColor = isDark ? '#f1f5f9' : '#1e293b';

  // --- CORRECTION DÉFINITIVE ---
  // On construit un objet `data` valide, en s'assurant que `datasets` est TOUJOURS un tableau.
  const data = {
    labels: chartData?.labels || [],
    datasets: (chartData?.datasets && Array.isArray(chartData.datasets)) ? chartData.datasets : [{ data: [] }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 20,
        },
      },
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
  };

  // On peut ajouter une condition pour ne rien afficher si les données sont vides
  const hasData = data.datasets.some(dataset => dataset.data && dataset.data.length > 0 && dataset.data.some(d => d > 0));

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg h-96 w-full flex items-center justify-center">
      {hasData ? (
        <Pie data={data} options={options} />
      ) : (
        <span className="text-slate-400">Aucune donnée à afficher pour ce graphique.</span>
      )}
    </div>
  );
};

export default PieChart;
