import VehicleCard from '../components/ui/VehicleCard';

// Données de simulation
const allVehicles = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  marque: ['Toyota', 'Honda', 'Ford', 'Tesla', 'BMW', 'Hyundai'][i % 6],
  modele: ['Camry', 'Civic', 'F-150', 'Model Y', '3 Series', 'Elantra'][i % 6],
  categorie: ['Berline', 'Compacte', 'VUS', 'Camion'][i % 4],
  sieges: 5,
  transmission: 'Auto',
  energie: 'Essence',
  tarif: 50 + i * 5,
  imageUrl: 'https://via.placeholder.com/400x300'
}));

const VehiclesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Colonne de filtres */}
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Filtres</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Catégorie</h3>
              <ul className="space-y-1">
                <li><label><input type="checkbox" className="mr-2" /> Berline</label></li>
                <li><label><input type="checkbox" className="mr-2" /> VUS</label></li>
                <li><label><input type="checkbox" className="mr-2" /> Compacte</label></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Prix / jour</h3>
              <input type="range" className="w-full" />
            </div>
            {/* ... autres filtres ... */}
          </div>
        </aside>

        {/* Grille de résultats */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Nos Véhicules</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VehiclesPage;
