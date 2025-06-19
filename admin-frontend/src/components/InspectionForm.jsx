import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import ImageUploader from './ImageUploader';

const InspectionForm = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, control, setError, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || { images: [] }
  });

  useEffect(() => {
    const dataToSet = initialData ? { ...initialData } : {};
    if (initialData && initialData.InspectionImages) {
      dataToSet.images = initialData.InspectionImages.map(img => img.urlimage);
    } else {
      dataToSet.images = [];
    }
    reset(dataToSet);
  }, [initialData, reset]);

  const isEditing = !!initialData;

  const handleLocalSubmit = async (data) => {
    const result = await onSubmit(data);
    if (result?.errors) {
      result.errors.forEach(err => setError(err.field, { type: 'server', message: err.message }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit(handleLocalSubmit)} className="p-6 space-y-4">
          <h2 className="text-2xl font-bold mb-4">
            {isEditing ? `Modifier l'inspection #${initialData?.idinspection}` : 'Ajouter une inspection'}
          </h2>
          <div className="mb-4">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  initialImages={field.value || []}
                  onUploadComplete={(urls) => setValue('images', urls, { shouldValidate: true, shouldDirty: true })}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-style">Date</label>
              <input type="date" {...register('dateinspection', { required: 'Date requise' })} className="input-style" />
              {errors.dateinspection && <p className="error-style">{errors.dateinspection.message}</p>}
            </div>
            <div>
              <label className="label-style">Kilométrage</label>
              <input type="number" {...register('kilometrage', { required: 'Kilométrage requis' })} className="input-style" />
              {errors.kilometrage && <p className="error-style">{errors.kilometrage.message}</p>}
            </div>
            <div>
              <label className="label-style">Niveau Carburant</label>
              <input {...register('niveaucarburant', { required: 'Niveau requis' })} className="input-style" />
              {errors.niveaucarburant && <p className="error-style">{errors.niveaucarburant.message}</p>}
            </div>
            <div>
              <label className="label-style">Propreté</label>
              <select {...register('proprete', { required: true })} className="input-style">
                <option value={true}>Oui</option>
                <option value={false}>Non</option>
              </select>
            </div>
            <div>
              <label className="label-style">Note</label>
              <input {...register('note')} className="input-style" />
            </div>
            <div>
              <label className="label-style">Type</label>
              <input {...register('typeinspection', { required: 'Type requis' })} className="input-style" />
              {errors.typeinspection && <p className="error-style">{errors.typeinspection.message}</p>}
            </div>
            <div>
              <label className="label-style">ID Véhicule</label>
              <input type="number" {...register('idvehicule', { required: 'ID véhicule requis' })} className="input-style" />
              {errors.idvehicule && <p className="error-style">{errors.idvehicule.message}</p>}
            </div>
            <div>
              <label className="label-style">ID Contrat</label>
              <input type="number" {...register('idcontrat', { required: 'ID contrat requis' })} className="input-style" />
              {errors.idcontrat && <p className="error-style">{errors.idcontrat.message}</p>}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Sauvegarder' : 'Créer l\'inspection'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InspectionForm;
