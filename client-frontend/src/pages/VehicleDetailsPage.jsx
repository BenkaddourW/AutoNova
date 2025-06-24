// src/pages/VehicleDetailsPage.jsx (Version Réorganisée et Nettoyée)

import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import * as vehicleService from '../services/vehicleService';
import * as succursaleService from '../services/succursaleService';
import { toast } from 'react-hot-toast';
import { Users, Gauge, GitBranch, Droplet } from 'lucide-react';
import ReservationSidebar from '../components/ReservationSidebar';

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { initialDates, pickupLocationId } = location.state || {};

  const [vehicle, setVehicle] = useState(null);
  const [succursales, setSuccursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchDetailsData = async () => {
      try {
        setLoading(true);
        const [vehicleData, succursalesData] = await Promise.all([
          vehicleService.getVehicleById(id),
          succursaleService.getSuccursaleNamesList()
        ]);
        setVehicle(vehicleData);
        setSuccursales(succursalesData);
        setMainImage(vehicleData.VehiculeImages?.find(img => img.estprincipale)?.urlimage || vehicleData.VehiculeImages?.[0]?.urlimage || '');
      } catch (err) { 
        setError('Impossible de charger les données.'); 
        toast.error(err.message || 'Erreur de chargement.'); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDetailsData();
  }, [id]);

  if (loading) return <div className="text-center py-20"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!vehicle) return <div className="text-center py-20">Véhicule non trouvé.</div>;

  // Caractéristiques à afficher (sans la consommation)
  const features = [
    { icon: <Users size={18} />, label: `${vehicle.sieges} sièges` },
    { icon: <Gauge size={18} />, label: vehicle.transmission },
    { icon: <Droplet size={18} />, label: vehicle.energie },
    { icon: <GitBranch size={18} />, label: vehicle.typeentrainement },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        {/* --- Colonne de Gauche (Infos Véhicule) --- */}
        <div className="lg:col-span-2">
          {/* Titre et Prix */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary">{vehicle.categorie}</p>
            <div className="flex justify-between items-baseline">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                {vehicle.marque} {vehicle.modele}
              </h1>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">${Number(vehicle.tarifjournalier).toFixed(2)}</p>
                <span className="text-slate-500 dark:text-slate-400">/ jour</span>
              </div>
            </div>
          </div>
          
          {/* Galerie d'Images */}
          <div className="mb-8">
            <div className="mb-3 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img 
                src={mainImage || 'https://via.placeholder.com/600x400'} 
                alt={`Vue de ${vehicle.marque} ${vehicle.modele}`} 
                className="w-full h-auto md:h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {vehicle.VehiculeImages?.map((img) => (
                <button 
                  key={img.idvehiculeimage} 
                  onClick={() => setMainImage(img.urlimage)} 
                  className={`rounded-md overflow-hidden border-2 ${mainImage === img.urlimage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img.urlimage} alt="Thumbnail" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* Caractéristiques */}
          <div className="my-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Caractéristiques</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700 dark:text-slate-300">
              {features.map((feat, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <span className="text-primary mb-2">{feat.icon}</span>
                  <span className="text-sm">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="divider"></div>

          {/* Description */}
          <div className="my-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {vehicle.description || "Aucune description disponible pour ce véhicule."}
            </p>
          </div>
        </div>

        {/* --- Colonne de Droite (Réservation) --- */}
        <div>
          <ReservationSidebar 
            vehicle={vehicle} 
            succursales={succursales} 
            initialDates={initialDates}
            pickupLocationId={pickupLocationId}
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
