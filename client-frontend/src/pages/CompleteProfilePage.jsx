// src/pages/CompleteProfilePage.jsx (VERSION CORRIGÉE - UTILISE CLIENT SERVICE)

import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import * as clientService from '../services/clientService'; // ON UTILISE CLIENT SERVICE
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector'; // Ajout de la librairie

const CompleteProfilePage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, control, watch } = useForm();
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  // On observe la valeur du champ 'pays' pour la passer à RegionDropdown
  const selectedCountry = watch('pays');
  const selectedProvince = watch('province');

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      // ON APPELLE la fonction du service client qui gère la création du profil client
      // ET la mise à jour de l'utilisateur via le service auth
      await clientService.createProfile(data);
      
      // Après la soumission réussie, on rafraîchit le contexte pour qu'il sache que le profil est complet
      await refreshProfile(); 
      
      toast.success("Profil complété avec succès !");
      navigate('/compte'); 
    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue lors de la création du profil.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Finalisez votre inscription</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Pour des raisons de sécurité, veuillez compléter votre profil pour pouvoir effectuer des réservations.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
        {serverError && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-md">{serverError}</p>}
        
        {/* LE FORMULAIRE EST COMPLET car votre backend attend tous ces champs */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Informations de Contact et Adresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Adresse 1</label>
                <input {...register('adresse1', { required: 'L\'adresse est requise.' })} className="input-style" />
                {errors.adresse1 && <p className="error-style">{errors.adresse1.message}</p>}
            </div>
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Adresse 2 (Optionnel)</label>
                <input {...register('adresse2')} className="input-style" />
            </div>
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Pays</label>
                <Controller
                  name="pays"
                  control={control}
                  rules={{ required: 'Le pays est requis' }}
                  render={({ field }) => (
                    <CountryDropdown
                      {...field}
                      classes="input-style w-full"
                    />
                  )}
                />
                {errors.pays && <p className="error-style">{errors.pays.message}</p>}
            </div>
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Province / État</label>
                <Controller
                  name="province"
                  control={control}
                  rules={{ required: 'La province est requise' }}
                  render={({ field }) => (
                    <RegionDropdown
                      country={selectedCountry}
                      {...field}
                      classes="input-style w-full"
                      blankOptionLabel="Sélectionnez une région"
                      defaultOptionLabel="Sélectionnez une région"
                    />
                  )}
                />
                {errors.province && <p className="error-style">{errors.province.message}</p>}
            </div>
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Ville</label>
                <input {...register('ville', { required: 'La ville est requise.' })} className="input-style" />
                {errors.ville && <p className="error-style">{errors.ville.message}</p>}
            </div>
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Code Postal</label>
                <input {...register('codepostal', { required: 'Le code postal est requis.' })} className="input-style" />
                {errors.codepostal && <p className="error-style">{errors.codepostal.message}</p>}
            </div>
            <div>
                <label className="label-style text-slate-700 dark:text-slate-200">Mobile</label>
                <input type="tel" {...register('numeromobile', { required: 'Le mobile est requis.' })} className="input-style" />
                {errors.numeromobile && <p className="error-style">{errors.numeromobile.message}</p>}
            </div>
          </div>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">Informations du Permis de Conduire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="label-style text-slate-700 dark:text-slate-200">Numéro de permis</label>
                    <input {...register('numeropc', { required: 'Le numéro de permis est requis.' })} className="input-style" />
                    {errors.numeropc && <p className="error-style">{errors.numeropc.message}</p>}
                </div>
                <div>
                    <label className="label-style text-slate-700 dark:text-slate-200">Date de naissance</label>
                    <input type="date" {...register('datenaissance', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.datenaissance && <p className="error-style">{errors.datenaissance.message}</p>}
                </div>
                <div>
                    <label className="label-style text-slate-700 dark:text-slate-200">Pays de délivrance</label>
                    <Controller
                      name="paysdelivrance"
                      control={control}
                      rules={{ required: 'Ce champ est requis.' }}
                      render={({ field }) => (
                        <CountryDropdown
                          {...field}
                          classes="input-style w-full"
                        />
                      )}
                    />
                    {errors.paysdelivrance && <p className="error-style">{errors.paysdelivrance.message}</p>}
                </div>
                <div>
                    <label className="label-style text-slate-700 dark:text-slate-200">Autorité de délivrance (ex: SAAQ)</label>
                    <input {...register('autoritedelivrance', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.autoritedelivrance && <p className="error-style">{errors.autoritedelivrance.message}</p>}
                </div>
                <div>
                    <label className="label-style text-slate-700 dark:text-slate-200">Date d'expiration du permis</label>
                    <input type="date" {...register('dateexpiration', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.dateexpiration && <p className="error-style">{errors.dateexpiration.message}</p>}
                </div>
            </div>
        </section>

         <div className="flex justify-end pt-4 border-t dark:border-slate-600">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer et continuer'}
            </button>
         </div>
      </form>
    </div>
  );
};

export default CompleteProfilePage;

