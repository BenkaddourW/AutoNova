import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import * as succursaleService from '../services/succursaleService';

import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
// --- MODIFICATION 1 : NOUVEL IMPORT ---
import { IMaskInput } from 'react-imask'; 
import { BsQuestionCircleFill } from 'react-icons/bs';
import { Tooltip } from 'react-tooltip';

const SuccursalesForm = ({ initialData, onSubmit, onCancel }) => {
  const { register, handleSubmit, reset, setError, setValue, control, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {}
  });

  const isEditing = !!initialData;
  const selectedCountry = watch('pays');
  const canadianPostalCodeRegex = /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i;

  useEffect(() => {
    reset(initialData || { pays: 'Canada' });
    if (!isEditing) {
      succursaleService.getNextCode().then(code => setValue('codeagence', code));
    }
  }, [initialData, reset, setValue, isEditing]);

  const handleLocalSubmit = async (data) => {
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
        <form onSubmit={handleSubmit(handleLocalSubmit)} className="p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            {isEditing ? `Modifier la succursale #${initialData?.idsuccursale}` : 'Ajouter une succursale'}
          </h2>
          {/* Section 1 */}
          <div className="mb-6 p-4 border rounded bg-slate-50 dark:bg-slate-700">
            <h3 className="font-semibold mb-4">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="label-style mb-2">Code Agence</label>
                <input {...register('codeagence')} className="input-style bg-gray-100 cursor-not-allowed" readOnly />
                {errors.codeagence && <p className="error-style">{errors.codeagence.message}</p>}
              </div>
              <div className="mb-4">
                <label className="label-style mb-2">Nom</label>
                <input {...register('nomsuccursale', { required: 'Nom requis' })} className="input-style" />
                {errors.nomsuccursale && <p className="error-style">{errors.nomsuccursale.message}</p>}
              </div>
              <div className="mb-4">
                <label className="label-style mb-2">Adresse 1</label>
                <input {...register('adresse1', { required: 'Adresse requise' })} className="input-style" />
                {errors.adresse1 && <p className="error-style">{errors.adresse1.message}</p>}
              </div>
              <div className="mb-4">
                <label className="label-style mb-2">Adresse 2 (Optionnel)</label>
                <input {...register('adresse2')} className="input-style" />
              </div>
            </div>
          </div>
          {/* Section 2 */}
          <div className="mb-6 p-4 border rounded bg-slate-50 dark:bg-slate-700">
            <h3 className="font-semibold mb-4">Localisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="label-style mb-2">Pays</label>
                <Controller
                  name="pays"
                  control={control}
                  rules={{ required: 'Le pays est requis' }}
                  render={({ field }) => (
                    <CountryDropdown
                      {...field}
                      classes="input-style w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                    />
                  )}
                />
                {errors.pays && <p className="error-style">{errors.pays.message}</p>}
              </div>
              <div className="mb-4">
                <label className="label-style mb-2">Province</label>
                <Controller
                  name="province"
                  control={control}
                  rules={{ required: 'La province est requise' }}
                  render={({ field }) => (
                    <RegionDropdown
                      {...field}
                      country={selectedCountry}
                      classes="input-style w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                      blankOptionLabel="Sélectionner une province"
                      defaultOptionLabel="Sélectionner une province"
                    />
                  )}
                />
                {errors.province && <p className="error-style">{errors.province.message}</p>}
              </div>
              <div className="mb-4">
                <label className="label-style mb-2">Ville</label>
                <input {...register('ville', { required: 'Ville requise' })} className="input-style" />
                {errors.ville && <p className="error-style">{errors.ville.message}</p>}
              </div>
              <div className="mb-4">
                <label className="label-style mb-2">Code Postal</label>
                <div className="relative">
                  <input {...register('codepostal', { required: 'Code postal requis', pattern: { value: canadianPostalCodeRegex, message: 'Le format doit être A1A 1A1' } })} className="input-style w-full pr-10" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" data-tooltip-id="postal-tooltip" data-tooltip-content="Format attendu : A1A 1A1">
                    <BsQuestionCircleFill className="text-gray-400" />
                  </div>
                </div>
                {errors.codepostal && <p className="error-style">{errors.codepostal.message}</p>}
              </div>
            </div>
          </div>
          {/* Section 3 */}
          <div className="mb-6 p-4 border rounded bg-slate-50 dark:bg-slate-700">
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Champ téléphone */}
              <div className="md:col-span-2 mb-4">
                <label className="label-style mb-2">Téléphone</label>
                <Controller
                  name="telephone"
                  control={control}
                  rules={{
                    required: 'Téléphone requis',
                    validate: value => (value || '').length === 10 || 'Le numéro doit contenir 10 chiffres'
                  }}
                  render={({ field }) => (
                    <IMaskInput
                      value={field.value}
                      onAccept={(value) => field.onChange(value)}
                      mask="(000) 000-0000"
                      unmask={true}
                      placeholder="(555) 123-4567"
                      className="input-style w-full"
                    />
                  )}
                />
                {errors.telephone && <p className="error-style">{errors.telephone.message}</p>}
              </div>
            </div>
          </div>
          {/* Boutons */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary">{isEditing ? 'Sauvegarder' : 'Créer la succursale'}</button>
          </div>
        </form>
        <Tooltip id="postal-tooltip" style={{ backgroundColor: "#334155", color: "#fff", zIndex: 9999 }} />
      </div>
    </div>
  );
};

export default SuccursalesForm;
