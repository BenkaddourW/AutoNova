const Pagination = ({ page, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        Préc.
      </button>
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {page} / {totalPages}
      </span>
      <button
        className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        Suiv.
      </button>
    </div>
  );
};

export default Pagination;