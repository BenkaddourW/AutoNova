import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getContratById, updateContrat } from "../services/contratService";
import { useAuth } from "../context/AuthContext";

// Styles réutilisables
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

// Placeholders pour les formulaires Inspection et Paiement
const InspectionForm = ({ contrat, onClose }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #ccc",
      padding: 24,
      marginBottom: 24,
    }}
  >
    <h3>Formulaire Inspection (à implémenter)</h3>
    <button onClick={onClose}>Fermer</button>
  </div>
);

const PaiementForm = ({ contrat, onClose }) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #ccc",
      padding: 24,
      marginBottom: 24,
    }}
  >
    <h3>Formulaire Paiement (à implémenter)</h3>
    <button onClick={onClose}>Fermer</button>
  </div>
);

const ContratEditPage = () => {
  const { id } = useParams();
  const { token } = useAuth() || {};
  const navigate = useNavigate();
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showPaiementForm, setShowPaiementForm] = useState(false);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    setLoading(true);
    getContratById(id, token)
      .then((data) => {
        setContrat(data);
        setForm({
          montant: data.montant,
          montantttc: data.montantttc,
          statut: data.statut,
          dateretourprevue: formatDateForInput(data.dateretourprevue),
        });
      })
      .catch(() => setError("Erreur lors du chargement du contrat"))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const updated = await updateContrat(id, {
        ...form,
        dateretourprevue: form.dateretourprevue
          ? new Date(form.dateretourprevue).toISOString()
          : null,
      });
      setContrat(updated);
      setSuccess("Contrat mis à jour !");
      setEditMode(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!contrat) return <div>Contrat introuvable.</div>;

  // Raccourcis pour les infos liées
  const vehicule = contrat.reservation?.Vehicule || {};
  const client = contrat.reservation?.Client?.utilisateur || {};
  const succLiv = contrat.reservation?.SuccursaleLivraison || {};
  const succRet = contrat.reservation?.SuccursaleRetour || {};

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Détail du contrat</h2>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Formulaires modaux */}
      {showInspectionForm && (
        <InspectionForm
          contrat={contrat}
          onClose={() => setShowInspectionForm(false)}
        />
      )}
      {showPaiementForm && (
        <PaiementForm
          contrat={contrat}
          onClose={() => setShowPaiementForm(false)}
        />
      )}

      {!editMode ? (
        <div>
          {/* Section Contrat */}
          <div style={sectionStyle}>
            <h3>Informations générales</h3>
            <br />
            <div>
              <span style={labelStyle}>Numéro de contrat :</span>
              <span style={valueStyle}>{contrat.numerocontrat}</span>
            </div>
            <div>
              <span style={labelStyle}>Statut :</span>
              <span style={valueStyle}>
                {contrat.statut.charAt(0).toUpperCase() +
                  contrat.statut.slice(1)}
              </span>
            </div>
            <div>
              <span style={labelStyle}>Date de création :</span>
              <span style={valueStyle}>
                {new Date(contrat.date).toLocaleString("fr-CA")}
              </span>
            </div>
            <div>
              <span style={labelStyle}>Date retour prévue :</span>
              <span style={valueStyle}>
                {contrat.dateretourprevue
                  ? new Date(contrat.dateretourprevue).toLocaleString("fr-CA")
                  : ""}
              </span>
            </div>
          </div>

          {/* Section Client */}
          <div style={sectionStyle}>
            <h3>Détails du locataire</h3>
            <br />
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

          {/* Section Véhicule */}
          <div style={sectionStyle}>
            <h3>Détails du véhicule</h3>
            <br />
            <div>
              <span style={labelStyle}>Catégorie de véhicule :</span>
              <span style={valueStyle}>{vehicule.categorie}</span>
            </div>
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
            <div>
              <span style={labelStyle}>Transmission :</span>
              <span style={valueStyle}>{vehicule.transmission}</span>
            </div>
            <div>
              <span style={labelStyle}>Immatriculation :</span>
              <span style={valueStyle}>{vehicule.immatriculation}</span>
            </div>
            <div>
              <span style={labelStyle}>Kilométrage :</span>
              <span style={valueStyle}>{vehicule.kilometrage}</span>
            </div>
            <div>
              <span style={labelStyle}>Tarif journalier :</span>
              <span style={valueStyle}>CAD {vehicule.tarifjournalier}</span>
            </div>
            {vehicule.VehiculeImages && vehicule.VehiculeImages.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={labelStyle}>Images :</span>
                <span>
                  {vehicule.VehiculeImages.map((img) => (
                    <img
                      key={img.idimage}
                      src={img.urlimage}
                      alt="Véhicule"
                      style={{ width: 80, borderRadius: 4, marginRight: 8 }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Section Succursales */}
          <div style={sectionStyle}>
            <h3>Succursale de livraison</h3>
            <br />
            <div>
              <span style={labelStyle}>Nom :</span>
              <span style={valueStyle}>{succLiv.nomsuccursale}</span>
            </div>
            <div>
              <span style={labelStyle}>Adresse :</span>
              <span style={valueStyle}>
                {succLiv.adresse1} {succLiv.adresse2}, {succLiv.ville}{" "}
                {succLiv.codepostal}
              </span>
            </div>
            <div>
              <span style={labelStyle}>Téléphone :</span>
              <span style={valueStyle}>{succLiv.telephone}</span>
            </div>
          </div>
          <div style={sectionStyle}>
            <h3 style={{ marginTop: 16 }}>Succursale de retour</h3>
            <div>
              <span style={labelStyle}>Nom :</span>
              <span style={valueStyle}>{succRet.nomsuccursale}</span>
            </div>
            <div>
              <span style={labelStyle}>Adresse :</span>
              <span style={valueStyle}>
                {succRet.adresse1} {succRet.adresse2}, {succRet.ville}{" "}
                {succRet.codepostal}
              </span>
            </div>
            <div>
              <span style={labelStyle}>Téléphone :</span>
              <span style={valueStyle}>{succRet.telephone}</span>
            </div>
          </div>

          {/* Section Prix et Taxes */}
          <div style={sectionStyle}>
            <h3>Détail du prix</h3>
            <br />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={labelStyle}>Montant total :</span>
              <span
                style={{ ...valueStyle, textAlign: "right", minWidth: 120 }}
              >
                CAD {contrat.montant}
              </span>
            </div>
            <div style={{ marginTop: 16, fontWeight: "bold" }}>
              Taxes et frais
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 8,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    Taxe
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      borderBottom: "1px solid #ccc",
                    }}
                  >
                    Taux
                  </th>
                </tr>
              </thead>
              <tbody>
                {(contrat.taxes || []).map((taxe, idx) => (
                  <tr key={idx}>
                    <td>{taxe.denomination || taxe.abrege}</td>
                    <td style={{ textAlign: "right" }}>
                      {taxe.taux ? `${Number(taxe.taux).toFixed(2)}%` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{ marginTop: 8, textAlign: "right", fontWeight: "bold" }}
            >
              Total TTC : CAD {Number(contrat.montantttc).toFixed(2)}
            </div>
            {/* Ajout du versement réservation */}
            <div
              style={{ marginTop: 8, textAlign: "right", fontWeight: "bold" }}
            >
              Versement Réservation : - CAD 50.00
            </div>
            {/* Ajout de la caution */}
            <div
              style={{ marginTop: 8, textAlign: "right", fontWeight: "bold" }}
            >
              Caution : CAD{" "}
              {vehicule.montantcaution
                ? Number(vehicule.montantcaution).toFixed(2)
                : "0.00"}
            </div>
            {/* Ajout du total à payer */}
            <div
              style={{
                marginTop: 8,
                textAlign: "right",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Total à payer : CAD{" "}
              {(
                Number(contrat.montantttc || 0) -
                50 +
                Number(vehicule.montantcaution || 0)
              ).toFixed(2)}
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
              onClick={() => setShowInspectionForm(true)}
              style={{
                padding: "10px 24px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Inspection
            </button>
            <button
              onClick={() => setShowPaiementForm(true)}
              style={{
                padding: "10px 24px",
                background: "#388e3c",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Paiement
            </button>
            <button
              disabled
              style={{
                padding: "10px 24px",
                background: "#888",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "not-allowed",
                opacity: 0.5,
              }}
            >
              Modifier
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "10px 24px",
                background: "#ccc",
                color: "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Retour
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3>Édition du contrat</h3>
          <div>
            <label>
              Montant :
              <input
                type="number"
                name="montant"
                value={form.montant || ""}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              Montant TTC :
              <input
                type="number"
                name="montantttc"
                value={form.montantttc || ""}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              Statut :
              <input
                type="text"
                name="statut"
                value={form.statut || ""}
                onChange={handleChange}
              />
            </label>
          </div>
          <div>
            <label>
              Date retour prévue :
              <input
                type="datetime-local"
                name="dateretourprevue"
                value={form.dateretourprevue || ""}
                onChange={handleChange}
              />
            </label>
          </div>
          <button
            style={{ marginTop: 24, padding: "8px 24px" }}
            onClick={handleSave}
          >
            Sauvegarder
          </button>
          <button
            style={{ marginLeft: 16, padding: "8px 24px" }}
            onClick={() => setEditMode(false)}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
};

export default ContratEditPage;
