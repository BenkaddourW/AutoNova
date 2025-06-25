// src/pages/HomePage.jsx (Version Finale avec Données Dynamiques)

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock } from 'lucide-react';
import * as vehicleService from '../services/vehicleService';

import HeroSearchForm from '../components/HeroSearchForm';
import VehicleCard from '../components/ui/VehicleCard';
import AnimatedSection from '../components/ui/AnimatedSection';

import heroBg from '../assets/hero-background.png';

const HomePage = () => {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        setLoading(true);
        // Cet appel va maintenant déclencher l'orchestration dans le backend
        const vehicles = await vehicleService.getFeaturedVehicles();
        setFeaturedVehicles(vehicles);
      } catch (error) {
        console.error("Erreur lors de la récupération des véhicules en vedette:", error);
        // En cas d'erreur, on affiche un tableau vide pour ne pas faire planter la page
        setFeaturedVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedVehicles();
  }, []); // Le tableau vide [] assure que cet effet ne se lance qu'une seule fois au montage

  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      {/* === Section Hero === */}
      <section 
        className="relative min-h-[70vh] flex items-center justify-center text-center text-white bg-cover bg-center" 
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 px-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
            Votre prochaine aventure commence ici.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
            La liberté de la route, sans les contraintes.
          </p>
          <HeroSearchForm />
        </div>
      </section>

      {/* === Section Avantages === */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Simple, Rapide et Fiable</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Louer une voiture n'a jamais été aussi facile.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AnimatedSection>
              <div className="p-8">
                <Car className="h-12 w-12 text-sky-500 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Large Flotte de Véhicules</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">De la citadine économique au VUS de luxe, trouvez la voiture qui vous correspond.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="p-8">
                <ShieldCheck className="h-12 w-12 text-sky-500 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Réservation Sûre et Flexible</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Annulation facile et options de paiement sécurisées pour votre tranquillité.</p>
              </div>
            </AnimatedSection>
             <AnimatedSection>
              <div className="p-8">
                <Clock className="h-12 w-12 text-sky-500 mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Support Client 24/7</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Notre équipe est là pour vous aider à tout moment, où que vous soyez.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* === Section Véhicules en Vedette === */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Les Plus Populaires</h2>
            <p className="mt-2 text-slate-500">Découvrez les véhicules préférés de nos clients.</p>
          </AnimatedSection>
          
          {loading ? (
            <div className="text-center"><span className="loading loading-dots loading-lg text-primary"></span></div>
          ) : featuredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles.map(v => (
                // Le composant VehicleCard est réutilisé ici. Il fonctionnera car les données sont formatées correctement par le backend.
                <VehicleCard key={v.idvehicule} vehicle={v} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">Aucun véhicule en vedette pour le moment.</p>
          )}

          <div className="text-center mt-12">
            <Link to="/vehicules" className="btn btn-primary text-lg px-8 py-3">
              Voir tous nos véhicules
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
