import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import * as succursaleService from '../services/succursaleService';

const SuccursalesForm = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, setError, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  const isEditing = !!initialData;

  useEffect(() => {
    reset(initialData || {});
    // Génère le code seulement pour une nouvelle succursale
    if (!isEditing) {
      succursaleService.getNextCode().then(code => setValue('codeagence', code));
    }
  }, [initialData, reset, setValue, isEditing]);

  const handleLocalSubmit = async (data) => {
    // --- CORRECTION ---
    // Si on est en mode édition, on retire `codeagence` des données envoyées
    // pour éviter de tenter de modifier une clé unique ou générée.
    if (isEditing) {
      delete data.codeagence;
    }
    
    const result = await onSubmit(data);

    if (result?.errors) {
      result.errors.forEach(err => setError(err.field, { type: 'server', message: err.message }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-xl overflow-y-auto">
        <form onSubmit={handleSubmit(handleLocalSubmit)} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            {isEditing ? `Modifier la succursale #${initialData?.idsuccursale}` : 'Ajouter une succursale'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-style">Code Agence</label>
              <input
                {...register('codeagence')}
                className="input-style bg-gray-100 cursor-not-allowed" // Toujours en lecture seule
                readOnly
              />
              {errors.codeagence && <p className="error-style">{errors.codeagence.message}</p>}
            </div>
            <div>
              <label className="label-style">Nom</label>
              <input {...register('nomsuccursale', { required: 'Nom requis' })} className="input-style" />
              {errors.nomsuccursale && <p className="error-style">{errors.nomsuccursale.message}</p>}
            </div>
            <div>
              <label className="label-style">Adresse 1</label>
              <input {...register('adresse1', { required: 'Adresse requise' })} className="input-style" />
              {errors.adresse1 && <p className="error-style">{errors.adresse1.message}</p>}
            </div>
            <div>
              <label className="label-style">Adresse 2 (Optionnel)</label>
              <input {...register('adresse2')} className="input-style" />
              {errors.adresse2 && <p className="error-style">{errors.adresse2.message}</p>}
            </div>
            <div>
              <label className="label-style">Ville</label>
              <input {...register('ville', { required: 'Ville requise' })} className="input-style" />
              {errors.ville && <p className="error-style">{errors.ville.message}</p>}
            </div>
            <div>
              <label className="label-style">Code Postal</label>
              <input {...register('codepostal', { required: 'Code postal requis' })} className="input-style" />
              {errors.codepostal && <p className="error-style">{errors.codepostal.message}</p>}
            </div>
            <div>
              <label className="label-style">Province</label>
              <input {...register('province', { required: 'Province requise' })} className="input-style" />
              {errors.province && <p className="error-style">{errors.province.message}</p>}
            </div>
            <div>
              <label className="label-style">Pays</label>
              <input {...register('pays', { required: 'Pays requis' })} className="input-style" />
              {errors.pays && <p className="error-style">{errors.pays.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="label-style">Téléphone</label>
              <input {...register('telephone', { required: 'Téléphone requis' })} className="input-style" />
              {errors.telephone && <p className="error-style">{errors.telephone.message}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Sauvegarder' : 'Créer la succursale'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuccursalesForm;
