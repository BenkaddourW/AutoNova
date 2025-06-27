// Fichier: src/pages/BookingDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getBookingDetails } from '../services/reservationService';
import { Calendar, Tag, Car, Hash, MapPin } from 'lucide-react';

// On réutilise le même badge de statut
const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    'En attente': 'bg-yellow-100 text-yellow-800', 'Confirmée': 'bg-blue-100 text-blue-800',
    'Active': 'bg-green-100 text-green-800', 'Terminée': 'bg-slate-200 text-slate-600',
    'Annulée': 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100'}`}>{status}</span>;
};

const DetailItem = ({ icon, label, children }) => (
    <div>
        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">{icon}{label}</dt>
        <dd className="mt-1 text-sm text-slate-900 dark:text-white">{children}</dd>
    </div>
);


const BookingDetailPage = () => {
  const { id } = useParams(); // Récupère l'ID depuis l'URL
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const data = await getBookingDetails(id);
        setBooking(data);
      } catch (err) {
        toast.error("Impossible de charger les détails de cette réservation.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id]);

  if (loading) return <div className="text-center py-20">Chargement des détails...</div>;
  if (!booking) return <div className="text-center py-20">Réservation non trouvée.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-6">
        <Link to="/compte/reservations" className="text-sm text-sky-600 hover:underline">← Retour à mes réservations</Link>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Détails de la Réservation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Référence : {booking.numeroreservation}</p>
          </div>
          <BookingStatusBadge status={booking.statut} />
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Informations Clés</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <DetailItem icon={<Car size={16}/>} label="Véhicule">{booking.Vehicule?.marque} {booking.Vehicule?.modele}</DetailItem>
                <DetailItem icon={<Tag size={16}/>} label="Catégorie">{booking.Vehicule?.categorie}</DetailItem>
                <DetailItem icon={<Calendar size={16}/>} label="Date de départ">{new Date(booking.daterdv).toLocaleString('fr-FR')}</DetailItem>
                <DetailItem icon={<Calendar size={16}/>} label="Date de retour">{new Date(booking.dateretour).toLocaleString('fr-FR')}</DetailItem>
                <DetailItem icon={<MapPin size={16}/>} label="Succursale de départ">{booking.SuccursaleDepart?.nomsuccursale}</DetailItem>
                <DetailItem icon={<MapPin size={16}/>} label="Succursale de retour">{booking.SuccursaleRetour?.nomsuccursale}</DetailItem>
            </dl>
        </div>
        
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
             <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Détails Financiers</h2>
             <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <DetailItem label="Sous-total">{Number(booking.montanttotal).toFixed(2)} $</DetailItem>
                <DetailItem label="Taxes">{Number(booking.taxes).toFixed(2)} $</DetailItem>
                <DetailItem label="Montant du dépôt payé">{Number(booking.montantttc).toFixed(2)} $</DetailItem>
             </dl>
        </div>

      </div>
    </div>
  );
};

export default BookingDetailPage;
