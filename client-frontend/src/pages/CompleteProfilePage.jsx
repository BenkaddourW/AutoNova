import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import * as clientService from '../services/clientService';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CompleteProfilePage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { user, token, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  // Ce handler sera appelé uniquement si la validation côté client est réussie
  const onSubmit = async (data) => {
    // Le backend attend `idutilisateur` dans le corps de la requête
    const profileData = { ...data, idutilisateur: user.idutilisateur };
    
    try {
      setServerError(null);
      // On appelle le service pour créer le profil client
      await clientService.createProfile(profileData, token);
      
      // On demande au contexte de re-fetcher les informations du profil
      await refreshProfile(); 
      
      // On redirige vers la page de compte qui affichera maintenant le profil complet
      navigate('/compte'); 
    } catch (err) {
      setServerError(err.message || 'Une erreur est survenue lors de la création du profil.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="section-title">Finalisez votre inscription</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Pour des raisons de sécurité et d'assurance, veuillez compléter votre profil pour pouvoir effectuer des réservations.
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
        {serverError && <p className="text-red-500 text-center bg-red-500/10 p-3 rounded-md">{serverError}</p>}
        
        {/* --- SECTION INFORMATIONS PERSONNELLES --- */}
        <section>
          <h2 className="section-title">Informations de Contact et Adresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="label-style">Province</label>
                <input {...register('province', { required: 'La province est requise.' })} className="input-style" />
                {errors.province && <p className="error-style">{errors.province.message}</p>}
            </div>
             <div>
                <label className="label-style">Code Postal</label>
                <input {...register('codepostal', { required: 'Le code postal est requis.' })} className="input-style" />
                {errors.codepostal && <p className="error-style">{errors.codepostal.message}</p>}
            </div>
             <div>
                <label className="label-style">Pays</label>
                <input {...register('pays', { required: 'Le pays est requis.' })} className="input-style" />
                {errors.pays && <p className="error-style">{errors.pays.message}</p>}
            </div>
             <div>
                <label className="label-style">Téléphone</label>
                <input type="tel" {...register('numerotelephone')} className="input-style" />
            </div>
             <div>
                <label className="label-style">Mobile</label>
                <input type="tel" {...register('numeromobile', { required: 'Le mobile est requis.' })} className="input-style" />
                {errors.numeromobile && <p className="error-style">{errors.numeromobile.message}</p>}
            </div>
          </div>
        </section>

        {/* --- SECTION PERMIS DE CONDUIRE --- */}
        <section>
            <h2 className="section-title">Informations du Permis de Conduire</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="label-style">Numéro de permis</label>
                    <input {...register('numeropc', { required: 'Le numéro de permis est requis.' })} className="input-style" />
                    {errors.numeropc && <p className="error-style">{errors.numeropc.message}</p>}
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
                <div>
                    <label className="label-style">Date de naissance</label>
                    <input type="date" {...register('datenaissance', { required: 'Ce champ est requis.' })} className="input-style" />
                    {errors.datenaissance && <p className="error-style">{errors.datenaissance.message}</p>}
                </div>
            </div>
        </section>

         <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary text-lg px-8 py-3">
                Enregistrer et continuer
            </button>
         </div>
      </form>
    </div>
  );
};

export default CompleteProfilePage;
