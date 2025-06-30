
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

const TaxesForm = ({ initialData, onSubmit, onCancel }) => {
  // On pré-remplit le formulaire avec les données de la taxe et de sa première localité
  const defaultFormValues = initialData 
    ? { 
        ...initialData, 
        pays: initialData.localites?.[0]?.pays || '', 
        province: initialData.localites?.[0]?.province || '' 
      } 
    : {};

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    defaultValues: defaultFormValues
  });

  // Met à jour le formulaire si on clique sur un autre bouton "modifier"
  useEffect(() => {
    reset(defaultFormValues);
  }, [initialData, reset]);

  const isEditing = !!initialData;

  // ✅ C'EST ICI LA CORRECTION PRINCIPALE
  const handleLocalSubmit = async (formData) => {
    // 1. On récupère les données "plates" du formulaire
    const { pays, province, ...taxeData } = formData;

    // 2. On construit l'objet final avec la structure attendue par le backend
    const finalData = {
      ...taxeData,
      // On crée le tableau `localites` que le backend attend.
      // Pour l'instant, on ne gère qu'une seule localité par taxe.
      localites: [
        { pays, province }
      ]
    };
    
    // 3. On appelle la fonction `onSubmit` (qui est `handleSubmit` dans la page parente)
    // avec les données correctement formatées.
    try {
      await onSubmit(finalData);
    } catch (err) {
      if (err?.errors) {
        err.errors.forEach(e => setError(e.field, { type: 'server', message: e.message }));
      }
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
            <label className="label-style">Dénomination</label>
            <input type="text" {...register('denomination', { required: 'Ce champ est requis' })} className="input-style w-full" />
            {errors.denomination && <p className="error-style">{errors.denomination.message}</p>}
          </div>
          <div>
            <label className="label-style">Abrégé</label>
            <input type="text" {...register('abrege', { required: 'Ce champ est requis' })} className="input-style w-full" />
            {errors.abrege && <p className="error-style">{errors.abrege.message}</p>}
          </div>
          <div>
            <label className="label-style">Taux (%)</label>
            <input type="number" step="0.001" {...register('taux', { required: 'Ce champ est requis', valueAsNumber: true })} className="input-style w-full" />
            {errors.taux && <p className="error-style">{errors.taux.message}</p>}
          </div>
          
          {/* Les champs pour la localité restent les mêmes visuellement */}
          <div>
            <label className="label-style">Pays</label>
            <input type="text" {...register('pays', { required: 'Ce champ est requis' })} className="input-style w-full" />
            {errors.pays && <p className="error-style">{errors.pays.message}</p>}
          </div>
          <div>
            <label className="label-style">Province</label>
            <input type="text" {...register('province', { required: 'Ce champ est requis' })} className="input-style w-full" />
            {errors.province && <p className="error-style">{errors.province.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onCancel} className="btn">Annuler</button>
            <button type="submit" className="btn btn-primary">{isEditing ? 'Mettre à jour' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxesForm;