// src/pages/VehicleDetailsPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Users, Gauge, GitBranch, Droplets, Wind, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';

// On importe le service pour communiquer avec l'API
import * as vehicleService from '../services/vehicleService';

const VehicleDetailsPage = () => {
  const { id } = useParams(); // Récupère l'ID du véhicule depuis l'URL
  const location = useLocation(); // Pour récupérer les dates de recherche

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  
  // Récupère les dates de la recherche précédente, s'il y en a
  const searchDates = location.state?.searchDates;
  const dateDebut = searchDates?.from ? new Date(searchDates.from) : null;
  const dateFin = searchDates?.to ? new Date(searchDates.to) : null;
  
  // Calcule la durée de la location
  const nombreJours = dateDebut && dateFin ? differenceInDays(dateFin, dateDebut) : 0;

  useEffect(() => {
    // Fonction pour charger les données du véhicule depuis l'API
    const fetchVehicleDetails = async () => {
      setLoading(true);
      try {
        const data = await vehicleService.getVehiculeById(id);
        setVehicle(data);
        // Initialise l'image principale avec l'image marquée 'estprincipale' ou la première
        const initialImage = data.VehiculeImages?.find(img => img.estprincipale)?.urlimage 
                           || data.VehiculeImages?.[0]?.urlimage 
                           || 'https://via.placeholder.com/800x600?text=Image+Indisponible';
        setMainImage(initialImage);
      } catch (error) {
        toast.error("Impossible de charger les détails du véhicule.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]); // Se redéclenche si l'ID dans l'URL change

  if (loading) {
    return <div className="text-center py-40"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (!vehicle) {
    return <div className="text-center py-40"><h1>Oups !</h1><p>Ce véhicule n'a pas été trouvé.</p><Link to="/vehicules" className="btn btn-primary mt-4">Voir d'autres véhicules</Link></div>;
  }
  
  // Construction des caractéristiques à partir des vraies données
  const caracteristiques = [
    { icon: Users, label: `${vehicle.nombreplaces} places` },
    { icon: Gauge, label: vehicle.transmission },
    { icon: Droplets, label: vehicle.energie },
    // Ajoutez d'autres caractéristiques si elles existent dans votre modèle
    { icon: Wind, label: 'Climatisation' },
    { icon: CheckCircle, label: 'GPS Intégré' },
  ];

  // Calcul du prix
  const tarifTotal = vehicle.tarifjournalier * nombreJours;
  const taxes = tarifTotal * 0.15; // Supposons 15% de taxes
  const prixFinal = tarifTotal + taxes;

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* === Colonne de Gauche : Images et Détails Techniques === */}
          <div className="lg:col-span-2">
            <div>
              <img src={mainImage} alt="Vue principale du véhicule" className="w-full h-auto rounded-lg shadow-lg object-cover aspect-video mb-4 transition-all duration-300" />
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                {vehicle.VehiculeImages?.map((img) => (
                  <img
                    key={img.idvehiculeimage}
                    src={img.urlimage}
                    alt={`Vue miniature du véhicule`}
                    className={`w-full h-24 object-cover rounded-md cursor-pointer transition-all duration-300 ${mainImage === img.urlimage ? 'ring-2 ring-primary shadow-lg' : 'opacity-70 hover:opacity-100'}`}
                    onClick={() => setMainImage(img.urlimage)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">{vehicle.marque} {vehicle.modele}</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">{vehicle.categorie} - {vehicle.annee}</p>
              <div className="prose dark:prose-invert mt-6 max-w-none">
                <p>{vehicle.description || "Aucune description disponible pour ce véhicule."}</p>
              </div>
            </div>

            <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Caractéristiques principales</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                {caracteristiques.map(carac => (
                    <div key={carac.label} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <carac.icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <span>{carac.label}</span>
                    </div>
                ))}
                </div>
            </div>
          </div>

          {/* === Colonne de Droite : Bloc de Réservation (Sticky) === */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-center mb-6">Résumé de la location</h2>
                    
                    {nombreJours > 0 ? (
                        <>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Début :</span><span className="font-semibold">{format(dateDebut, 'dd MMM yyyy')}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Fin :</span><span className="font-semibold">{format(dateFin, 'dd MMM yyyy')}</span></div>
                            </div>
                            
                            <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{vehicle.tarifjournalier} € x {nombreJours} jours</span><span className="font-mono">{tarifTotal.toFixed(2)} €</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Taxes et frais (15%)</span><span className="font-mono">{taxes.toFixed(2)} €</span></div>
                            </div>

                             <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>
                            
                            <div className="flex justify-between items-baseline"><span className="text-xl font-bold">Total</span><span className="text-2xl font-extrabold text-primary font-mono">{prixFinal.toFixed(2)} €</span></div>

                            <Link to="/reservation" state={{ vehicle, searchDates }}>
                                <button className="btn-primary w-full mt-6 text-lg h-12">Continuer</button>
                            </Link>
                        </>
                    ) : (
                        <div className="text-center p-4 bg-slate-100 dark:bg-slate-700 rounded-md">
                            <p className="text-slate-600 dark:text-slate-300">Pour voir le prix, veuillez d'abord rechercher des dates sur la <Link to="/" className="link link-primary">page d'accueil</Link>.</p>
                        </div>
                    )}
                </div>
                <div className="text-center text-xs text-slate-500">
                    <p>Une caution de {vehicle.caution || 500} € sera requise.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
