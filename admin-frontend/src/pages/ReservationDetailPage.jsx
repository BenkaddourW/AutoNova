import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getReservationFullDetails,
  updateReservation,
} from "../services/reservationService";
import { useAuth } from "../context/AuthContext";
import { creerContrat } from "../services/contratService";

const sectionStyle = {
  borderBottom: "1px solid #ddd",
  marginBottom: 16,
  paddingBottom: 12,
  marginTop: 24,
};
const labelStyle = {
  fontWeight: "bold",
  minWidth: 180,
  display: "inline-block",
};
const valueStyle = { marginLeft: 8 };

const ReservationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  let token;
  try {
    token = useAuth()?.token || localStorage.getItem("token");
  } catch {
    token = localStorage.getItem("token");
  }

  const [reservation, setReservation] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoading(true);
    getReservationFullDetails(id, token)
      .then((data) => {
        setReservation(data);
        setForm({
          numeroreservation: data.numeroreservation,
          daterdv: data.daterdv?.slice(0, 16),
          dateretour: data.dateretour?.slice(0, 16),
          statut: data.statut,
          montanttotal: data.montanttotal,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!reservation) return <div>Aucune réservation trouvée.</div>;

  const client =
    reservation.Client?.utilisateur || reservation.Client?.Utilisateur || {};
  const vehicule = reservation.Vehicule || {};
  const livraison = reservation.SuccursaleLivraison || {};
  const retour = reservation.SuccursaleRetour || {};

  // Pour la gestion des statuts
  const statut = (reservation.statut || "").toLowerCase();

  // Génération du contrat
  const genererContrat = async () => {
    setSuccess("");
    setError("");
    try {
      const data = await creerContrat(reservation, token);
      setSuccess("Contrat généré avec succès !");
      // Redirige vers la page d’édition du contrat
      navigate(`/contrats/${data.contrat.idcontrat}/edit`);
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Détail de la réservation</h2>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={sectionStyle}>
        <h3>Informations générales</h3>
        <br />
        <div>
          <span style={labelStyle}>Numéro de réservation :</span>
          <span style={valueStyle}>{reservation.numeroreservation}</span>
        </div>
        <div>
          <span style={labelStyle}>statut :</span>
          <span style={valueStyle}>
            {reservation.statut.charAt(0).toUpperCase() +
              reservation.statut.slice(1)}
          </span>
        </div>
      </div>

      {/* Détails du rendez-vous */}
      <div style={sectionStyle}>
        <h3>Détails du rendez-vous</h3>
        <br />
        <div>
          <span style={labelStyle}>Emplacement :</span>
          <span style={valueStyle}>{livraison.ville || "-"}</span>
        </div>
        <div>
          <span style={labelStyle}>Date et heure :</span>
          <span style={valueStyle}>
            {new Date(form.daterdv).toLocaleString("fr-CA")}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Adresse :</span>
          <span style={valueStyle}>
            {livraison.adresse1} {livraison.adresse2}, {livraison.ville},{" "}
            {livraison.codepostal}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Numéro De Téléphone :</span>
          <span style={valueStyle}>{livraison.telephone}</span>
        </div>
        <div>
          <span style={labelStyle}>Heures :</span>
          <span style={valueStyle}>07 h 30 - 18 h 00</span>
        </div>
      </div>

      {/* Détails du retour */}
      <div style={sectionStyle}>
        <h3>Détails du retour</h3>
        <br />
        <div>
          <span style={labelStyle}>Emplacement :</span>
          <span style={valueStyle}>{retour.ville || "-"}</span>
        </div>
        <div>
          <span style={labelStyle}>Date et heure :</span>
          <span style={valueStyle}>
            {new Date(form.dateretour).toLocaleString("fr-CA")}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Adresse :</span>
          <span style={valueStyle}>
            {retour.adresse1} {retour.adresse2}, {retour.ville},{" "}
            {retour.codepostal}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Numéro De Téléphone :</span>
          <span style={valueStyle}>{retour.telephone}</span>
        </div>
        <div>
          <span style={labelStyle}>Heures :</span>
          <span style={valueStyle}>07 h 30 - 18 h 00</span>
        </div>
      </div>

      {/* Détails du locataire */}
      <div style={sectionStyle}>
        <h3>Détails du locataire</h3>
        <br />
        <div>
          <span style={labelStyle}>Numéro de membre :</span>
          <span style={valueStyle}>{reservation.Client?.codeclient}</span>
        </div>
        <div>
          <span style={labelStyle}>Nom :</span>
          <span style={valueStyle}>
            {client.nom} {client.prenom}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Adresse courriel :</span>
          <span style={valueStyle}>{client.email}</span>
        </div>
        <div>
          <span style={labelStyle}>Adresse :</span>
          <span style={valueStyle}>
            {client.adresse1} {client.adresse2}, {client.ville}
          </span>
        </div>
        <div>
          <span style={labelStyle}>Numéro De Téléphone :</span>
          <span style={valueStyle}>{client.numerotelephone}</span>
        </div>
      </div>

      {/* Détails du véhicule */}
      <div style={sectionStyle}>
        <h3>Détails du véhicule</h3>
        <br />
        <div>
          <span style={labelStyle}>Catégorie de véhicule :</span>
          <span style={valueStyle}>{vehicule.categorie}</span>
        </div>
        <div>
          <div>
            <span style={labelStyle}>Marque :</span>
            <span style={valueStyle}>{vehicule.marque}</span>
          </div>
          <div>
            <span style={labelStyle}>Modèle :</span>
            <span style={valueStyle}>{vehicule.modele}</span>
          </div>
          <div>
            <span style={labelStyle}>Energie :</span>
            <span style={valueStyle}>{vehicule.energie}</span>
          </div>
          <span style={labelStyle}>Transmission :</span>
          <span style={valueStyle}>{vehicule.transmission}</span>
        </div>
        <div>
          <span style={labelStyle}>Entrainement :</span>
          <span style={valueStyle}>{vehicule.typeentrainement}</span>
        </div>
        <div>
          <span style={labelStyle}>Tarif journalier :</span>
          <span style={valueStyle}>CAD {vehicule.tarifjournalier}</span>
        </div>
      </div>

      {/* Détail du prix */}
      <div style={sectionStyle}>
        <h3>Détail du prix</h3>
        <br />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={labelStyle}>Montant total estimé :</span>
          <span style={{ ...valueStyle, textAlign: "right", minWidth: 120 }}>
            CAD {reservation.montanttotal}
          </span>
        </div>
        <div style={{ marginTop: 16, fontWeight: "bold" }}>Taxes et frais</div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                Taxe
              </th>
              <th
                style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}
              >
                Taux
              </th>
            </tr>
          </thead>
          <tbody>
            {(reservation.Taxes || []).map((taxe, idx) => (
              <tr key={idx}>
                <td>{taxe.denomination || taxe.abrege}</td>
                <td style={{ textAlign: "right" }}>
                  {taxe.taux ? `${Number(taxe.taux).toFixed(2)}%` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 8, textAlign: "right", fontWeight: "bold" }}>
          Total taxes : CAD {Number(reservation.taxes).toFixed(2)}
        </div>
        <div
          style={{
            marginTop: 16,
            textAlign: "right",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Total TTC Estimé : CAD {Number(reservation.montantttc).toFixed(2)}
        </div>
      </div>

      {/* Boutons d'action */}
      <div
        style={{
          display: "flex",
          gap: 16,
          justifyContent: "flex-end",
          marginTop: 32,
        }}
      >
        <button
          onClick={() => navigate("/reservations")}
          style={{
            padding: "10px 24px",
            background: "#888",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Retour à la liste
        </button>
        <button
          disabled={statut === "active" || statut === "terminée"}
          onClick={() => setEditMode(true)}
          style={{
            padding: "10px 24px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor:
              statut === "active" || statut === "terminée"
                ? "not-allowed"
                : "pointer",
            opacity: statut === "active" || statut === "terminée" ? 0.5 : 1,
          }}
        >
          Modifier
        </button>
        <button
          disabled={statut !== "confirmee" && statut !== "confirmée"}
          onClick={genererContrat}
          style={{
            padding: "10px 24px",
            background: "#388e3c",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor:
              statut !== "confirmee" && statut !== "confirmée"
                ? "not-allowed"
                : "pointer",
            opacity: statut !== "confirmee" && statut !== "confirmée" ? 0.5 : 1,
          }}
        >
          Générer contrat
        </button>
      </div>
    </div>
  );
};

export default ReservationDetailPage;
