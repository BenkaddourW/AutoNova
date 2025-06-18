import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import ComboboxInput from './ComboboxInput';
import ImageUploader from './ImageUploader';

const VehiculeForm = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, control, setError, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || { images: [] }
  });

  useEffect(() => {
    const dataToSet = initialData ? { ...initialData } : {};
    if (initialData && initialData.VehiculeImages) {
      dataToSet.images = initialData.VehiculeImages.map(img => img.urlimage);
        } else {
      dataToSet.images = [];
    }
    reset(dataToSet);
  }, [initialData, reset]);

  const isEditing = !!initialData;
  const [categories] = useState(['Compacte', 'Berline', 'SUV', 'Camionnette']);
  const [transmissions, setTransmissions] = useState(['Automatique', 'Manuelle']);
  const [energies, setEnergies] = useState(['Essence', 'Diesel', 'Électrique', 'Hybride']);
  const [entrainements, setEntrainements] = useState(['Traction', 'Propulsion', '4x4 Intégrale']);
  const statuts = ['disponible', 'en_location', 'en_maintenance', 'hors_service'];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit(async (data) => {
          const result = await onSubmit(data);
          if (result?.errors) { result.errors.forEach(err => setError(err.field, { type: 'server', message: err.message })); }
        })} className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            {isEditing ? `Modifier le véhicule #${initialData?.idvehicule}` : 'Ajouter un nouveau véhicule'}
          </h2>

          <div className="mb-6 border-b border-slate-200 dark:border-slate-700 pb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {/* Colonnes de formulaire (inchangées)... */}
            <div className="space-y-4">
              <div><label className="label-style">Marque</label><input {...register('marque', { required: 'La marque est requise' })} className="input-style" />{errors.marque && <p className="error-style">{errors.marque.message}</p>}</div>
              <div><label className="label-style">Modèle</label><input {...register('modele', { required: 'Le modèle est requis' })} className="input-style" />{errors.modele && <p className="error-style">{errors.modele.message}</p>}</div>
              <div><label className="label-style">Immatriculation</label><input {...register('immatriculation', { required: 'L\'immatriculation est requise' })} className="input-style" />{errors.immatriculation && <p className="error-style">{errors.immatriculation.message}</p>}</div>
              <div><label className="label-style">Couleur</label><input {...register('couleur', { required: 'La couleur est requise' })} className="input-style" />{errors.couleur && <p className="error-style">{errors.couleur.message}</p>}</div>
            </div>
            <div className="space-y-4">
              <div><label className="label-style">Catégorie</label><Controller control={control} name="categorie" rules={{ required: "La catégorie est requise" }} render={({ field }) => (<ComboboxInput label="Catégorie" options={categories} value={field.value} onChange={field.onChange} />)} />{errors.categorie && <p className="error-style">{errors.categorie.message}</p>}</div>
              <div><label className="label-style">Transmission</label><Controller control={control} name="transmission" render={({ field }) => (<ComboboxInput label="Transmission" options={transmissions} value={field.value} onChange={(val) => { if (val && !transmissions.includes(val)) setTransmissions(p => [...p, val]); field.onChange(val); }} />)} /></div>
              <div><label className="label-style">Type d'entraînement</label><Controller control={control} name="typeentrainement" render={({ field }) => (<ComboboxInput label="Type d'entraînement" options={entrainements} value={field.value} onChange={(val) => { if (val && !entrainements.includes(val)) setEntrainements(p => [...p, val]); field.onChange(val); }} />)} /></div>
              <div><label className="label-style">Énergie</label><Controller control={control} name="energie" render={({ field }) => (<ComboboxInput label="Énergie" options={energies} value={field.value} onChange={(val) => { if (val && !energies.includes(val)) setEnergies(p => [...p, val]); field.onChange(val); }} />)} /></div>
            </div>
            <div className="space-y-4">
              <div><label className="label-style">Statut</label><select {...register('statut')} className="input-style">{statuts.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}</select></div>
              <div><label className="label-style">Kilométrage</label><input type="number" {...register('kilometrage', { required: 'Kilométrage requis', valueAsNumber: true, min: 0 })} className="input-style" />{errors.kilometrage && <p className="error-style">{errors.kilometrage.message}</p>}</div>
              <div><label className="label-style">Nombre de sièges</label><input type="number" {...register('sieges', { required: 'Nombre de sièges requis', valueAsNumber: true, min: 1 })} className="input-style" />{errors.sieges && <p className="error-style">{errors.sieges.message}</p>}</div>
              <div><label className="label-style">ID Succursale</label><input type="number" {...register('succursaleidsuccursale', { required: 'ID Succursale requis', valueAsNumber: true, min: 1 })} className="input-style" />{errors.succursaleidsuccursale && <p className="error-style">{errors.succursaleidsuccursale.message}</p>}</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="label-style">Tarif Journalier (€)</label><input type="number" step="0.01" {...register('tarifjournalier', { required: 'Tarif requis', valueAsNumber: true, min: 0 })} className="input-style" />{errors.tarifjournalier && <p className="error-style">{errors.tarifjournalier.message}</p>}</div>
             <div><label className="label-style">Montant de la caution (€)</label><input type="number" step="0.01" {...register('montantcaution', { required: 'Caution requise', valueAsNumber: true, min: 0 })} className="input-style" />{errors.montantcaution && <p className="error-style">{errors.montantcaution.message}</p>}</div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Sauvegarder' : 'Créer le véhicule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehiculeForm;
