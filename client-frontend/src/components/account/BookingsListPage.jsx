// src/components/account/BookingsListPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyBookings } from '../../services/reservationService';
import { Calendar, Tag, Car, Hash } from 'lucide-react';

const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    'En attente': 'bg-yellow-100 text-yellow-800',
    'Confirmée': 'bg-blue-100 text-blue-800',
    'Active': 'bg-green-100 text-green-800',
    'Terminée': 'bg-slate-200 text-slate-600',
    'Annulée': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

const BookingsListPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        setError('Impossible de charger vos réservations.');
        toast.error('Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="text-center p-8">Chargement de vos réservations...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Mes Réservations</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">Vous n'avez aucune réservation pour le moment.</p>
          <Link to="/vehicules" className="btn btn-primary mt-4">
            Découvrir nos véhicules
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {bookings.map((booking) => (
            <li key={booking.idreservation} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border dark:border-slate-700 transition-shadow hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <Car size={20} /> {booking.Vehicule?.marque} {booking.Vehicule?.modele}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <Hash size={14} /> Réf : {booking.numeroreservation}
                  </p>
                </div>
                <div className="self-end md:self-center">
                    <BookingStatusBadge status={booking.statut} />
                </div>
              </div>
              <div className="border-t dark:border-slate-700 my-3"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-sky-500" />
                  <strong>Départ :</strong> {new Date(booking.daterdv).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center gap-2">
                   <Calendar size={16} className="text-sky-500" />
                  <strong>Retour :</strong> {new Date(booking.dateretour).toLocaleDateString('fr-FR')}
                </div>
                 <div className="flex items-center gap-2">
                  <Tag size={16} className="text-green-500" />
                  <strong>Montant total :</strong> {Number(booking.montantttc).toFixed(2)} $
                </div>
              </div>
              <div className="mt-4 text-right">
                <Link to={`/compte/reservations/${booking.idreservation}`} className="btn btn-outline btn-sm">
                  Voir les détails
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingsListPage;
