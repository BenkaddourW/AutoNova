// src/pages/VehiclesPage.jsx

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import VehicleCard from '../components/ui/VehicleCard';
import * as vehicleService from '../services/vehicleService';
import { toast } from 'react-hot-toast';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoading(true);
      try {
        // Cas 1: On a reçu des résultats de recherche via la navigation
        if (location.state?.searchResults) {
          setVehicles(location.state.searchResults);
        } 
        // Cas 2: Pas de recherche, on charge tous les véhicules
        else {
          const allVehicles = await vehicleService.getVehicles();
          setVehicles(allVehicles);
        }
      } catch (error) {
        toast.error("Impossible de charger la liste des véhicules.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
    // Se déclenche à chaque fois que l'état de la navigation change
  }, [location.state]); 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Colonne de filtres */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Filtres</h2>
          <div className="space-y-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
            <div>
              <h3 className="font-semibold mb-2">Catégorie</h3>
              <ul className="space-y-1 text-sm"><li className="flex items-center"><input type="checkbox" className="checkbox checkbox-sm mr-2" /> Berline</li><li className="flex items-center"><input type="checkbox" className="checkbox checkbox-sm mr-2" /> VUS</li><li className="flex items-center"><input type="checkbox" className="checkbox checkbox-sm mr-2" /> Compacte</li></ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Prix / jour</h3>
              <input type="range" min="0" max="200" className="range range-primary" />
            </div>
          </div>
        </aside>

        {/* Grille de résultats */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">
            {location.state?.searchResults ? "Véhicules disponibles pour votre recherche" : "Notre Flotte Complète"}
          </h1>
          
          {isLoading ? (
            <div className="text-center py-10">
              <span className="loading loading-dots loading-lg"></span>
              <p>Chargement en cours...</p>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(v => <VehicleCard key={v.idvehicule} vehicle={v} />)}
            </div>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-lg shadow">
              <h3 className="text-xl font-semibold">Aucun résultat</h3>
              <p className="mt-2 text-slate-500">Aucun véhicule ne correspond à votre recherche.</p>
              <Link to="/" className="btn btn-primary mt-4">Modifier ma recherche</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VehiclesPage;
