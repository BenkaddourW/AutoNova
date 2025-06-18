// src/Dashboard.jsx
import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    vehicles: 0,
    reservations: 0,
  });

  useEffect(() => {
    // Appel aux microservices REST
    // fetch("http://localhost:3001/api/users/count")
    //   .then(res => res.json())
    //   .then(data => setStats(prev => ({ ...prev, users: data.count })));

    fetch("http://localhost:3002/api/vehicules/count")
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, vehicles: data.count })));

    fetch("http://localhost:3004/api/reservations/count")
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, reservations: data.count })));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700">Utilisateurs</h2>
        <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700">Véhicules</h2>
        <p className="text-3xl font-bold text-green-600">{stats.vehicles}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-700">Réservations</h2>
        <p className="text-3xl font-bold text-purple-600">{stats.reservations}</p>
      </div>
    </div>
  );
}

export default Dashboard;
