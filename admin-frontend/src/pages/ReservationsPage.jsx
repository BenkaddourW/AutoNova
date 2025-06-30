import { useEffect, useState } from "react";
import ReservationTable from "../components/ReservationTable";
import ReservationFilters from "../components/ReservationFilters";
import { getReservations } from "../services/reservationService";
import { useAuth } from "../context/AuthContext";

const ReservationsPage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const [filters, setFilters] = useState({ date_livraison: today });
  const [agences, setAgences] = useState([]); // À remplir selon ton projet (API ou statique)
  const [loading, setLoading] = useState(false);
 // format YYYY-MM-DD

  useEffect(() => {
    setLoading(true);
    getReservations(user, filters)
      .then(setReservations)
      .finally(() => setLoading(false));
  }, [user, filters]);

  const handleFilterChange = (key, value) => {
    if (key === "clear") setFilters({});
    else setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Gestion des réservations</h2>
      <ReservationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        agences={agences}
        isEmploye={user?.role === "employe"}
      />
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : (
          <ReservationTable
            reservations={reservations}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
