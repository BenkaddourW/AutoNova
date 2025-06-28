import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getReservationById,
  updateReservation,
} from "../services/reservationService";

const ReservationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    getReservationById(id)
      .then((res) => {
        setReservation(res);
        setEditValues({
          daterdv: res.daterdv ? res.daterdv.slice(0, 10) : "",
          dateretour: res.dateretour ? res.dateretour.slice(0, 10) : "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditChange = (e) => {
    setEditValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateReservation(id, editValues);
      const updated = await getReservationById(id);
      setReservation(updated);
      setIsEditing(false);
    } catch (err) {
      alert("Erreur lors de la modification");
    }
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;
  if (!reservation) return <div>Réservation introuvable.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
      <button className="mb-4 btn btn-secondary" onClick={() => navigate(-1)}>
        Retour à la liste
      </button>
      <h2 className="text-2xl font-bold mb-4">
        Détail de la réservation {reservation.numeroreservation}
      </h2>
      <div className="flex gap-2 mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Annuler" : "Modifier"}
        </button>
        {reservation.statut === "Confirmée" && (
          <button
            className="btn btn-success"
            onClick={() => {
              // Action pour générer un contrat
            }}
          >
            Générer un contrat
          </button>
        )}
      </div>
      {isEditing ? (
        <form className="space-y-2" onSubmit={handleEditSubmit}>
          <div>
            <b>Client :</b> {reservation.Client?.Utilisateur?.nom}{" "}
            {reservation.Client?.Utilisateur?.prenom}
          </div>
          <div>
            <b>Véhicule :</b> {reservation.Vehicule?.marque}{" "}
            {reservation.Vehicule?.modele}
          </div>
          <div>
            <b>Date de livraison :</b>
            <input
              type="date"
              name="daterdv"
              className="input input-style-auto ml-2"
              value={editValues.daterdv}
              onChange={handleEditChange}
            />
          </div>
          <div>
            <b>Date de retour :</b>
            <input
              type="date"
              name="dateretour"
              className="input input-style-auto ml-2"
              value={editValues.dateretour}
              onChange={handleEditChange}
            />
          </div>
          <div>
            <b>Succursale :</b> {reservation.SuccursaleLivraison?.nomsuccursale}
          </div>
          <div>
            <b>Statut :</b> {reservation.statut}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div>
            <b>Client :</b> {reservation.Client?.Utilisateur?.nom}{" "}
            {reservation.Client?.Utilisateur?.prenom}
          </div>
          <div>
            <b>Véhicule :</b> {reservation.Vehicule?.marque}{" "}
            {reservation.Vehicule?.modele}
          </div>
          <div>
            <b>Date de livraison :</b> {reservation.daterdv}
          </div>
          <div>
            <b>Date de retour :</b> {reservation.dateretour}
          </div>
          <div>
            <b>Succursale :</b> {reservation.SuccursaleLivraison?.nomsuccursale}
          </div>
          <div>
            <b>Statut :</b> {reservation.statut}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDetailPage;
