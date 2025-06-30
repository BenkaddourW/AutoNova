import { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import RecentReservations from '../components/RecentReservations';
import MonthlyChart from '../components/MonthlyChart';
import { getDashboardStats, getRecentReservations, getMonthlyEvolution } from '../services/statsService';
import { Car, CalendarCheck, Users, Building } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({ 
    totalVehicules: 0, 
    reservationsActives: 0, 
    totalSuccursales: 0, 
    totalUtilisateurs: 0 
  });
  // const [reservations, setReservations] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [statsData,  evolutionData] = await Promise.all([
          getDashboardStats(),
          // getRecentReservations(),
          getMonthlyEvolution()
        ]);

        setStats({
          totalVehicules: statsData.vehicules?.total || 0,
          reservationsActives: statsData.reservationsActives || 0,
          totalSuccursales: statsData.succursales?.count || 0,
          totalUtilisateurs: 0 // Gardé à 0 pour le moment
        });

        // setReservations(reservationsData);
        setChartData(evolutionData);

      } catch (error) {
        console.error("Erreur lors de la récupération des données du dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard Analytique</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Véhicules au total" value={stats.totalVehicules} icon={Car} />
        <StatCard title="Réservations Actives" value={stats.reservationsActives} icon={CalendarCheck} />
        <StatCard title="Succursales" value={stats.totalSuccursales} icon={Building} />
        <StatCard title="Utilisateurs" value={stats.totalUtilisateurs} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            {chartData && <MonthlyChart chartData={chartData} />}
        </div>
        <div className="lg:col-span-1">
          {/* <RecentReservations reservations={reservations} /> */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
