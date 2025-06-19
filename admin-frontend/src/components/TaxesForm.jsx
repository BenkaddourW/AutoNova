import { useForm } from 'react-hook-form';

const TaxesForm = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  const isEditing = !!initialData;

  const handleLocalSubmit = async (data) => {
    const result = await onSubmit(data);
    if (result?.errors) {
      result.errors.forEach(err => setError(err.field, { type: 'server', message: err.message }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit(handleLocalSubmit)} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            {isEditing ? `Modifier la taxe #${initialData?.idtaxe}` : 'Ajouter une taxe'}
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Dénomination</label>
            <input type="text" {...register('denomination', { required: 'Requis' })} className="w-full border px-3 py-2 rounded" />
            {errors.denomination && <p className="text-red-500 text-sm">{errors.denomination.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Abrégé</label>
            <input type="text" {...register('abrege', { required: 'Requis' })} className="w-full border px-3 py-2 rounded" />
            {errors.abrege && <p className="text-red-500 text-sm">{errors.abrege.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Taux (%)</label>
            <input type="number" step="0.01" {...register('taux', { required: 'Requis' })} className="w-full border px-3 py-2 rounded" />
            {errors.taux && <p className="text-red-500 text-sm">{errors.taux.message}</p>}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded">{isEditing ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxesForm;