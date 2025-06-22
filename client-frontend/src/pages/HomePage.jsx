import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock, Star } from 'lucide-react';

// --- Composants ---
import HeroSearchForm from '../components/HeroSearchForm';
import VehicleCard from '../components/ui/VehicleCard';
import AnimatedSection from '../components/ui/AnimatedSection'; // Notre nouveau composant d'animation

// --- IMPORTANT : Importez vos propres images ici ---
// Placez vos images dans le dossier `src/assets/`
import heroBg from '../assets/hero-background.png'; // Image de fond pour la section Hero
import suvImg from '../assets/suv-image.jpg';
import sedanImg from '../assets/sedan-image.jpg';
import electricImg from '../assets/electric-image.jpg';
import avatar1 from '../assets/avatar1.jpg'; // Image pour témoignage
import avatar2 from '../assets/avatar2.jpg';

// Données de simulation
const featuredVehicles = [
  { id: 1, marque: 'Tesla', modele: 'Model Y', categorie: 'VUS Électrique', sieges: 5, transmission: 'Auto', energie: 'Électrique', tarif: 95, imageUrl: suvImg },
  { id: 2, marque: 'Toyota', modele: 'Camry', categorie: 'Berline', sieges: 5, transmission: 'Auto', energie: 'Hybride', tarif: 65, imageUrl: sedanImg },
  { id: 3, marque: 'Hyundai', modele: 'Ioniq 5', categorie: 'Électrique', sieges: 5, transmission: 'Auto', energie: 'Électrique', tarif: 80, imageUrl: electricImg },
];

const testimonials = [
    { name: 'Alexandre P.', role: 'Voyageur d\'affaires', quote: 'Service impeccable et voiture très propre. Le processus de réservation en ligne était d\'une simplicité déconcertante. Je recommande !', avatar: avatar1 },
    { name: 'Sophie L.', role: 'Famille en vacances', quote: 'Nous avons loué un VUS pour nos vacances. Le véhicule était parfait et spacieux. AutoNova a rendu notre voyage beaucoup plus simple.', avatar: avatar2 },
];

const HomePage = () => {
  // Simule une donnée qui viendrait de l'API
  const [totalVehicles, setTotalVehicles] = useState(0);

  useEffect(() => {
    // Simule un appel API pour récupérer le nombre total de véhicules
    setTimeout(() => setTotalVehicles(53), 1000); 
  }, []);

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

      {/* === Section Avantages (Fond clair pour le contraste) === */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Simple, Rapide et Fiable</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Louer une voiture n'a jamais été aussi facile.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AnimatedSection>
              <div className="feature-card">
                <Car className="h-12 w-12 text-sky-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Plus de {totalVehicles} Véhicules</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">De la citadine économique au VUS de luxe, trouvez la voiture qui vous correspond.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection>
              <div className="feature-card">
                <ShieldCheck className="h-12 w-12 text-sky-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Réservation Sûre et Flexible</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Annulation facile et options de paiement sécurisées pour votre tranquillité.</p>
              </div>
            </AnimatedSection>
             <AnimatedSection>
              <div className="feature-card">
                <Clock className="h-12 w-12 text-sky-500 mb-4" />
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
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Notre Flotte en Vedette</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/vehicules" className="btn-primary text-lg px-8 py-3">
              Voir tous nos véhicules
            </Link>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default HomePage;
