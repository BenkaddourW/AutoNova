import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Gauge, GitBranch, Droplets, CalendarDays, Wind, CheckCircle } from 'lucide-react';
// import * as vehiculeService from '../services/vehiculeService'; // À décommenter plus tard

// --- Données de Simulation ---
// Dans une vraie app, ces données viendraient de l'API
const simulatedVehicle = {
  id: 1,
  marque: 'Tesla',
  modele: 'Model Y',
  categorie: 'VUS Électrique',
  annee: 2024,
  images: [
    'https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=2070', // Remplacez par vos images
    'https://images.unsplash.com/photo-1621489091388-295b35439129?q=80&w=1974',
    'https://images.unsplash.com/photo-1631129331102-934cb4b4e944?q=80&w=2070',
    'https://images.unsplash.com/photo-1631129331221-893347c69b59?q=80&w=2070',
  ],
  description: "Découvrez une nouvelle ère de la conduite avec la Tesla Model Y. Ce VUS tout-électrique combine performance exaltante, sécurité de pointe et une autonomie impressionnante. Son intérieur minimaliste et son immense toit en verre panoramique offrent une expérience de voyage unique, que ce soit pour vos trajets quotidiens ou vos aventures sur la route.",
  tarif: 95,
  caracteristiques: [
    { icon: Users, label: '5 places' },
    { icon: Gauge, label: 'Automatique' },
    { icon: Droplets, label: 'Électrique' },
    { icon: GitBranch, label: '4x4 Intégrale' },
    { icon: Wind, label: 'Climatisation' },
    { icon: CheckCircle, label: 'GPS Intégré' },
  ],
  caution: 500,
  // Supposons que ces dates viennent de la recherche de l'utilisateur
  dateDebut: '22 juin 2025',
  dateFin: '25 juin 2025',
  nombreJours: 3,
};

const VehicleDetailsPage = () => {
  const { id } = useParams(); // Récupère l'ID depuis l'URL (ex: /vehicules/1)
  
  // --- LOGIQUE DE FETCH (simulée pour l'instant) ---
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Dans une vraie application, vous feriez l'appel API ici
    // setLoading(true);
    // vehiculeService.getVehiculeById(id)
    //   .then(data => setVehicle(data))
    //   .catch(err => console.error(err))
    //   .finally(() => setLoading(false));

    // Simulation :
    setTimeout(() => {
      setVehicle(simulatedVehicle);
      setLoading(false);
    }, 500);
  }, [id]);

  const [mainImage, setMainImage] = useState(simulatedVehicle.images[0]);
  
  useEffect(() => {
    if (vehicle) {
        setMainImage(vehicle.images[0]);
    }
  }, [vehicle]);

  if (loading) {
    return <div className="text-center py-20">Chargement du véhicule...</div>;
  }

  if (!vehicle) {
    return <div className="text-center py-20">Véhicule non trouvé.</div>;
  }

  const tarifTotal = vehicle.tarif * vehicle.nombreJours;
  const taxes = tarifTotal * 0.15;
  const prixFinal = tarifTotal + taxes;

  return (
    <div className="bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* === Colonne de Gauche : Images et Détails Techniques === */}
          <div className="lg:col-span-2">
            {/* Galerie d'images */}
            <div>
              <img src={mainImage} alt="Vue principale du véhicule" className="w-full h-auto rounded-lg shadow-lg object-cover aspect-video mb-4 transition-all duration-300" />
              <div className="grid grid-cols-4 gap-4">
                {vehicle.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Vue ${index + 1}`}
                    className={`w-full h-24 object-cover rounded-md cursor-pointer transition-all duration-300 ${mainImage === img ? 'ring-2 ring-sky-500 shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mt-12">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">{vehicle.marque} {vehicle.modele}</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">{vehicle.categorie} - {vehicle.annee}</p>
              <div className="prose dark:prose-invert mt-6 max-w-none">
                <p>{vehicle.description}</p>
              </div>
            </div>

             {/* Caractéristiques */}
            <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Caractéristiques principales</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {vehicle.caracteristiques.map(carac => (
                    <div key={carac.label} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <carac.icon className="h-6 w-6 text-sky-500 flex-shrink-0" />
                    <span>{carac.label}</span>
                    </div>
                ))}
                </div>
            </div>
          </div>

          {/* === Colonne de Droite : Bloc de Réservation (Sticky) === */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6"> {/* top-28 pour être sous la navbar */}
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg shadow-lg border dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-center mb-4">Votre Réservation</h2>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Début :</span>
                            <span className="font-semibold">{vehicle.dateDebut}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Fin :</span>
                            <span className="font-semibold">{vehicle.dateFin}</span>
                        </div>
                    </div>
                    
                    <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">{vehicle.tarif}€ x {vehicle.nombreJours} jours</span>
                            <span className="font-mono">{tarifTotal.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Taxes et frais</span>
                            <span className="font-mono">{taxes.toFixed(2)}€</span>
                        </div>
                    </div>

                     <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>
                    
                    <div className="flex justify-between items-baseline">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">{prixFinal.toFixed(2)}€</span>
                    </div>

                    <Link to="/reservation">
                        <button className="btn-primary w-full mt-6 text-lg h-12 flex items-center justify-center gap-2">
                            Continuer la réservation
                        </button>
                    </Link>
                </div>
                <div className="text-center text-xs text-slate-500">
                    <p>Une caution de {vehicle.caution}€ sera requise à la prise en charge.</p>
                    <p>Annulation gratuite jusqu'à 48h avant.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
