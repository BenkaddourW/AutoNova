import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext'; // On importe notre hook d'authentification

const RegisterPage = () => {
  // --- HOOKS ---
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { register: registerUser } = useAuth(); // On renomme la fonction pour éviter un conflit de nom
  const navigate = useNavigate(); // Hook pour la redirection
  const [serverError, setServerError] = useState(null); // État pour les erreurs venant du serveur

  // --- HANDLER DE SOUMISSION ---
  const onSubmit = async (data) => {
    try {
      setServerError(null); // Réinitialiser les erreurs précédentes
      
      // La fonction 'registerUser' vient de notre AuthContext
      await registerUser({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        motdepasse: data.motdepasse,
        role: 'client' // Pour l'inscription publique, le rôle est toujours 'client'
      });
      
      // Si l'inscription réussit, rediriger l'utilisateur vers son espace personnel
      navigate('/compte'); 
    } catch (err) {
      // Si la fonction registerUser() lance une erreur, on l'attrape et on l'affiche
      setServerError(err.message || "Une erreur est survenue lors de l'inscription.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Créer un nouveau compte
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="font-medium text-sky-600 hover:text-sky-500">
              Connectez-vous ici
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-center">
              <p className="text-sm text-red-500">{serverError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input 
                type="text" 
                placeholder="Prénom"
                className="input-style"
                {...register('prenom', { required: 'Le prénom est obligatoire.' })} 
              />
              {errors.prenom && <p className="error-style mt-1">{errors.prenom.message}</p>}
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Nom"
                className="input-style"
                {...register('nom', { required: 'Le nom est obligatoire.' })} 
              />
              {errors.nom && <p className="error-style mt-1">{errors.nom.message}</p>}
            </div>
          </div>
          
          <div>
            <input 
              type="email" 
              placeholder="Adresse e-mail"
              className="input-style"
              {...register('email', { 
                required: 'L\'adresse e-mail est obligatoire.',
                pattern: { value: /^\S+@\S+$/i, message: "Le format de l'e-mail est invalide." }
              })} 
            />
            {errors.email && <p className="error-style mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input 
              type="password" 
              placeholder="Mot de passe"
              className="input-style"
              {...register('motdepasse', { 
                required: 'Le mot de passe est obligatoire.',
                minLength: { value: 6, message: 'Le mot de passe doit faire au moins 6 caractères.' }
              })} 
            />
            {errors.motdepasse && <p className="error-style mt-1">{errors.motdepasse.message}</p>}
          </div>

          <div>
            <input 
              type="password" 
              placeholder="Confirmer le mot de passe"
              className="input-style"
              {...register('confirmMotdepasse', { 
                required: 'Veuillez confirmer le mot de passe.',
                validate: value => value === watch('motdepasse') || "Les mots de passe ne correspondent pas."
              })} 
            />
            {errors.confirmMotdepasse && <p className="error-style mt-1">{errors.confirmMotdepasse.message}</p>}
          </div>
          
          <div>
            <button 
              type="submit" 
              className="btn-primary w-full h-11 mt-4 flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création en cours...' : "S'inscrire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
