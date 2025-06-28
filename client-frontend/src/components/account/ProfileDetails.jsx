import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import * as clientService from '../../services/clientService';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';

const ProfileDetails = () => {
  const { user, clientProfile, refreshProfile } = useAuth();
  
  // Utilisation de useForm. isDirty nous dira si l'utilisateur a modifié le formulaire.
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, isDirty }, 
    reset,
    watch,
    control
  } = useForm();
  
  const [serverError, setServerError] = useState(null);

  // Étape clé : Pré-remplir le formulaire dès que les données du profil sont disponibles.
  // Ce `useEffect` s'exécute lorsque `user` ou `clientProfile` changent.
  useEffect(() => {
    // On s'assure que les deux objets de données sont bien chargés
    if (user && clientProfile) {
      // On combine les données de l'utilisateur (table `utilisateur`) et du profil client (table `client`)
      const combinedProfileData = {
        // Champs de 'user'
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        adresse1: user.adresse1,
        adresse2: user.adresse2 || '',
        ville: user.ville,
        province: user.province,
        codepostal: user.codepostal,
        pays: user.pays,
        numerotelephone: user.numerotelephone || '',
        numeromobile: user.numeromobile,
        
        // Champs de 'clientProfile'
        numeropc: clientProfile.numeropc,
        paysdelivrance: clientProfile.paysdelivrance,
        autoritedelivrance: clientProfile.autoritedelivrance,
        
        // Les dates doivent être formatées en YYYY-MM-DD pour les inputs type="date"
        datenaissance: clientProfile.datenaissance 
          ? new Date(clientProfile.datenaissance).toISOString().split('T')[0] 
          : '',
        dateexpiration: clientProfile.dateexpiration 
          ? new Date(clientProfile.dateexpiration).toISOString().split('T')[0] 
          : '',
      };
      // `reset` de react-hook-form met à jour toutes les valeurs du formulaire
      reset(combinedProfileData);
    }
  }, [user, clientProfile, reset]);

  const selectedCountry = watch('pays');

  /**
   * Gère la soumission du formulaire de mise à jour.
   * Appelle la version simplifiée du service qui envoie toutes les données au backend.
   */
  const onSubmit = async (formData) => {
    // Si l'utilisateur n'a rien changé, on ne fait rien.
    if (!isDirty) {
      toast.info("Aucune modification n'a été détectée.");
      return;
    }

    try {
      setServerError(null);
      
      // Appel unique au service. Le backend s'occupe de la communication inter-services.
      await clientService.updateMyProfile(formData);

      // On rafraîchit les données dans toute l'application pour refléter les changements.
      await refreshProfile();
      
      toast.success('Votre profil a été mis à jour avec succès !');

    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue lors de la mise à jour.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Affichage pendant le chargement initial des données depuis le contexte
  if (!user) {
    return (
      <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
        Chargement de votre profil...
      </div>
    );
  }

  // Si l'utilisateur n'a pas encore de profil client, afficher un message et un lien vers la complétion
  if (!clientProfile) {
    return (
      <div className="p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
          Profil incomplet
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Votre profil client n'a pas encore été créé. Pour pouvoir effectuer des réservations, 
          vous devez compléter votre profil avec vos informations personnelles.
        </p>
        <Link 
          to="/completer-profil" 
          className="btn-primary inline-block"
        >
          Compléter mon profil
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Mes Informations</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {serverError && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-md">{serverError}</p>}
        
        <section>
          <h2 className="section-title">Informations Personnelles et Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <label className="label-style">Prénom</label>
                <input {...register('prenom', { required: 'Le prénom est requis.' })} className="input-style" />
                {errors.prenom && <p className="error-style">{errors.prenom.message}</p>}
            </div>
            <div>
                <label className="label-style">Nom</label>
                <input {...register('nom', { required: 'Le nom est requis.' })} className="input-style" />
                {errors.nom && <p className="error-style">{errors.nom.message}</p>}
            </div>
             <div>
                <label className="label-style">Adresse e-mail</label>
                <input type="email" {...register('email')} className="input-style bg-slate-100 dark:bg-slate-700 cursor-not-allowed" disabled />
                <p className="text-xs text-slate-400 mt-1">L'e-mail ne peut pas être modifié.</p>
            </div>
            <div>
                <label className="label-style">Mobile</label>
                <input type="tel" {...register('numeromobile', { required: 'Le mobile est requis.' })} className="input-style" />
                {errors.numeromobile && <p className="error-style">{errors.numeromobile.message}</p>}
            </div>
            <div>
                <label className="label-style">Téléphone (Optionnel)</label>
                <input type="tel" {...register('numerotelephone')} className="input-style" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">Adresse Postale</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <label className="label-style">Adresse 1</label>
                <input {...register('adresse1', { required: 'L\'adresse est requise.' })} className="input-style" />
                {errors.adresse1 && <p className="error-style">{errors.adresse1.message}</p>}
            </div>
            <div>
                <label className="label-style">Adresse 2 (Optionnel)</label>
                <input {...register('adresse2')} className="input-style" />
            </div>
            <div>
                <label className="label-style">Ville</label>
                <input {...register('ville', { required: 'La ville est requise.' })} className="input-style" />
                {errors.ville && <p className="error-style">{errors.ville.message}</p>}
            </div>
            <div>
                <label className="label-style">Province / État</label>
                <Controller
                  name="province"
                  control={control}
                  rules={{ required: 'La province est requise.' }}
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
                <label className="label-style">Code Postal</label>
                <input {...register('codepostal', { required: 'Le code postal est requis.' })} className="input-style" />
                {errors.codepostal && <p className="error-style">{errors.codepostal.message}</p>}
            </div>
            <div>
                <label className="label-style">Pays</label>
                <Controller
                  name="pays"
                  control={control}
                  rules={{ required: 'Le pays est requis.' }}
                  render={({ field }) => (
                    <CountryDropdown
                      {...field}
                      classes="input-style w-full"
                    />
                  )}
                />
                {errors.pays && <p className="error-style">{errors.pays.message}</p>}
            </div>
           </div>
        </section>

        <section>
            <h2 className="section-title">Informations du Permis de Conduire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                    <label className="label-style">Numéro de permis</label>
                    <input {...register('numeropc', { required: 'Le numéro de permis est requis.' })} className="input-style" />
                    {errors.numeropc && <p className="error-style">{errors.numeropc.message}</p>}
                </div>
                <div>
                    <label className="label-style">Date de naissance</label>
                    <input type="date" {...register('datenaissance', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.datenaissance && <p className="error-style">{errors.datenaissance.message}</p>}
                </div>
                <div>
                    <label className="label-style">Pays de délivrance</label>
                    <input {...register('paysdelivrance', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.paysdelivrance && <p className="error-style">{errors.paysdelivrance.message}</p>}
                </div>
                <div>
                    <label className="label-style">Autorité de délivrance (ex: SAAQ)</label>
                    <input {...register('autoritedelivrance', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.autoritedelivrance && <p className="error-style">{errors.autoritedelivrance.message}</p>}
                </div>
                <div>
                    <label className="label-style">Date d'expiration du permis</label>
                    <input type="date" {...register('dateexpiration', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.dateexpiration && <p className="error-style">{errors.dateexpiration.message}</p>}
                </div>
            </div>
        </section>

         <div className="flex justify-end pt-4 border-t dark:border-slate-700">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? 'Mise à jour en cours...' : 'Enregistrer les modifications'}
            </button>
         </div>
      </form>
    </div>
  );
};

export default ProfileDetails;
