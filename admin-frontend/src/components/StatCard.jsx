const StatCard = ({ title, value, icon: Icon }) => {
  return (
    // Ajout des classes dark:
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg flex items-center space-x-4">
      <div className="bg-sky-100 dark:bg-sky-500/20 p-3 rounded-full">
        <Icon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
};
export default StatCard;