// src/pages/LoginPage.jsx

import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { LogIn, ShieldAlert } from 'lucide-react'; // On importe une icône pour l'erreur

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  // --- MODIFICATION : On récupère aussi la fonction 'logout' ---
  const { login, logout } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Connexion en cours...');

    try {
      // La fonction login renvoie les données de la session, y compris l'utilisateur
      const sessionData = await login(data.email, data.motdepasse);
      
      toast.dismiss(loadingToast);

      // --- CORRECTION MAJEURE ICI ---
      // On vérifie le rôle de l'utilisateur juste après la connexion
      const userRole = sessionData?.utilisateur?.role;

      if (userRole === 'admin' || userRole === 'employe') {
        // Si c'est un admin ou un employé, tout va bien
        toast.success('Connexion réussie !');
        navigate(from, { replace: true });
      } else {
        // Si c'est un client ou un autre rôle non autorisé
        toast.error(
          (t) => (
            <div className="flex items-center">
              <ShieldAlert className="h-5 w-5 text-red-500 mr-3" />
              <span>Accès réservé aux administrateurs.</span>
            </div>
          ),
          { duration: 4000 }
        );
        // On le déconnecte immédiatement pour nettoyer la session invalide
        logout(); 
        setIsLoading(false); // On réactive le bouton
      }
      // =============================

    } catch (error) {
      setIsLoading(false);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Échec de la connexion.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-slate-800">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AutoNova</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Accès au tableau de bord</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="label-style sr-only">Email</label>
            <input id="email" type="email" placeholder="Adresse e-mail" className="input-style w-full" {...register('email', { required: 'L\'adresse e-mail est requise' })} />
            {errors.email && <p className="error-style mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="motdepasse" className="label-style sr-only">Mot de passe</label>
            <input id="motdepasse" type="password" placeholder="Mot de passe" className="input-style w-full" {...register('motdepasse', { required: 'Le mot de passe est requis' })} />
            {errors.motdepasse && <p className="error-style mt-1">{errors.motdepasse.message}</p>}
          </div>

          <div>
            <button type="submit" disabled={isLoading} className="w-full btn btn-primary flex justify-center items-center">
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : <LogIn size={18} />}
              <span className="ml-2">Se connecter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
