import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  // --- AMÉLIORATION APPLIQUÉE ICI ---
  // La valeur de "rememberMe" est maintenant passée à la fonction de connexion
  const onSubmit = async (data) => {
    try {
      setServerError(null);
      // On passe les identifiants et l'option "rememberMe" à la fonction login du contexte
      await login(data.email, data.motdepasse, data.rememberMe);
      
      navigate('/compte');
    } catch (err) {
      setServerError(err.message || 'Identifiants incorrects ou erreur serveur.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Ou{' '}
            <Link to="/inscription" className="font-medium text-sky-600 hover:text-sky-500">
              créez un nouveau compte
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-center">
              <p className="text-sm text-red-500">{serverError}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="label-style sr-only">Adresse e-mail</label>
              <input 
                id="email" 
                type="email" 
                placeholder="Adresse e-mail"
                className="input-style"
                autoComplete="email"
                {...register('email', { 
                  required: 'L\'adresse e-mail est obligatoire.',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Le format de l'e-mail est invalide."
                  }
                })} 
              />
              {errors.email && <p className="error-style mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label-style sr-only">Mot de passe</label>
              <input 
                id="password" 
                type="password" 
                placeholder="Mot de passe"
                className="input-style"
                autoComplete="current-password"
                {...register('motdepasse', { 
                  required: 'Le mot de passe est obligatoire.' 
                })} 
              />
              {errors.motdepasse && <p className="error-style mt-1">{errors.motdepasse.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              {/* Le champ "rememberMe" est correctement enregistré */}
              <input {...register('rememberMe')} id="remember-me" type="checkbox" className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-slate-900 dark:text-slate-300">Se souvenir de moi</label>
            </div>
            <div>
              <Link to="/mot-de-passe-oublie" className="font-medium text-sky-600 hover:text-sky-500">Mot de passe oublié ?</Link>
            </div>
          </div>

          <div>
            <button 
              type="submit" 
              className="btn-primary w-full h-11 flex justify-center items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
