import { Award } from 'lucide-react';

const TopListCard = ({ title, items, nameKey, valueKey, icon: Icon = Award }) => {
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg h-full">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 text-amber-500 mr-3" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="text-lg mr-3">{medals[index] || '•'}</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{item[nameKey]}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">{item[valueKey]}</span>
          </li>
        ))}
        {items.length === 0 && (
            <p className="text-slate-500 text-sm">Pas de données disponibles.</p>
        )}
      </ul>
    </div>
  );
};

export default TopListCard;
