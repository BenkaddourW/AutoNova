import { useState } from 'react';
import Stepper from '../components/ui/Stepper';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext'; // Pour pré-remplir les infos

// Données de simulation pour le véhicule et la réservation
const reservationDetails = {
    vehicle: { marque: 'Tesla', modele: 'Model Y' },
    dateDebut: '22 juin 2025',
    dateFin: '25 juin 2025',
    nombreJours: 3,
    tarif: 95,
};

const steps = [
  { id: '1', name: 'Conducteur' },
  { id: '2', name: 'Options' },
  { id: '3', name: 'Paiement' },
  { id: '4', name: 'Confirmation' },
];

const ReservationPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { register, handleSubmit, getValues } = useForm();
  const { user } = useAuth();

  const goToNextStep = () => setCurrentStep(prev => prev + 1);
  const goToPrevStep = () => setCurrentStep(prev => prev - 1);

  const processStep1 = (data) => {
    console.log("Étape 1 Données:", data);
    goToNextStep();
  };
  
  const processStep2 = () => {
    console.log("Options sélectionnées...");
    goToNextStep();
  };

  const processStep3 = (data) => {
    console.log("Données de paiement:", data);
    // Ici, on appellerait l'API de réservation
    goToNextStep(); // Simuler un paiement réussi
  };


  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Indicateur d'étapes */}
        <div className="mb-12">
            <Stepper currentStep={currentStep} steps={steps} />
        </div>

        {/* Contenu de l'étape actuelle */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
            
            {/* Étape 1: Informations du conducteur */}
            {currentStep === 0 && (
                <form onSubmit={handleSubmit(processStep1)} className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Informations sur le conducteur principal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input {...register('prenom')} defaultValue={user?.prenom} className="input-style" placeholder="Prénom" />
                        <input {...register('nom')} defaultValue={user?.nom} className="input-style" placeholder="Nom" />
                        <input {...register('email')} defaultValue={user?.email} type="email" className="input-style" placeholder="E-mail" />
                        <input {...register('telephone')} className="input-style" placeholder="Téléphone" />
                    </div>
                    <div className="text-right">
                        <button type="submit" className="btn-primary">Passer aux options</button>
                    </div>
                </form>
            )}

            {/* Étape 2: Options */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Options supplémentaires</h2>
                    <div className="space-y-4">
                        <label className="flex items-center p-4 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <input type="checkbox" className="h-5 w-5 rounded text-sky-600" />
                            <span className="ml-4">Siège bébé (9€ / jour)</span>
                        </label>
                         <label className="flex items-center p-4 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <input type="checkbox" className="h-5 w-5 rounded text-sky-600" />
                            <span className="ml-4">Assurance complète "Zéro Risque" (25€ / jour)</span>
                        </label>
                    </div>
                    <div className="flex justify-between">
                        <button onClick={goToPrevStep} className="btn-secondary">Retour</button>
                        <button onClick={processStep2} className="btn-primary">Passer au paiement</button>
                    </div>
                </div>
            )}

            {/* Étape 3: Paiement */}
            {currentStep === 2 && (
                 <form onSubmit={handleSubmit(processStep3)} className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Paiement sécurisé</h2>
                    {/* Intégration Stripe ou autre ici */}
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <p className="font-semibold">Placeholder pour le formulaire de paiement</p>
                    </div>
                    <div className="flex justify-between">
                        <button type="button" onClick={goToPrevStep} className="btn-secondary">Retour</button>
                        <button type="submit" className="btn-primary">Payer et Réserver</button>
                    </div>
                </form>
            )}

            {/* Étape 4: Confirmation */}
            {currentStep === 3 && (
                <div className="text-center space-y-4 py-8">
                     <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Réservation Confirmée !</h2>
                    <p className="text-slate-500">Un e-mail de confirmation a été envoyé à {getValues('email')}.</p>
                    <p>Votre numéro de réservation est le <span className="font-bold font-mono">#RES123456</span>.</p>
                     <div className="pt-6">
                         <Link to="/compte/mes-reservations" className="btn-primary">Voir mes réservations</Link>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Icône de confirmation (à mettre dans le même fichier ou importer de lucide-react)
const CheckCircle = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export default ReservationPage;
