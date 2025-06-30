import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getContratById,
  updateContrat,
  createInspection,
} from "../services/contratService";
import { payerContrat } from "../services/paiementService";
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

// Formulaire Inspection adapté au modèle backend
const InspectionForm = ({ contrat, onClose, onSaved }) => {
  const lastInspection =
    contrat.inspections && contrat.inspections.length > 0
      ? contrat.inspections
          .slice()
          .sort(
            (a, b) => new Date(b.dateinspection) - new Date(a.dateinspection)
          )[0]
      : null;

  const [form, setForm] = useState({
    dateinspection: lastInspection
      ? new Date(lastInspection.dateinspection).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    kilometrage: lastInspection ? lastInspection.kilometrage : "",
    niveaucarburant: lastInspection ? lastInspection.niveaucarburant : "",
    proprete: lastInspection ? lastInspection.proprete : true,
    note: lastInspection ? lastInspection.note : "",
    typeinspection: lastInspection ? lastInspection.typeinspection : "Départ",
  });

  useEffect(() => {
    if (lastInspection) {
      setForm({
        dateinspection: new Date(lastInspection.dateinspection)
          .toISOString()
          .slice(0, 16),
        kilometrage: lastInspection.kilometrage,
        niveaucarburant: lastInspection.niveaucarburant,
        proprete: lastInspection.proprete,
        note: lastInspection.note,
        typeinspection: lastInspection.typeinspection,
      });
    }
  }, [contrat]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth() || {};

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveInspection = async () => {
    setSaving(true);
    setError("");
    try {
      await createInspection(
        {
          ...form,
          dateinspection: new Date(form.dateinspection).toISOString(),
          idvehicule: contrat.reservation?.Vehicule?.idvehicule,
          idcontrat: contrat.idcontrat,
        },
        token
      );
      if (onSaved) onSaved("Inspection enregistrée !");
      onClose();
    } catch (e) {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          zIndex: 1000,
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(20, 20, 30, 0.85)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          background: "#23272f",
          color: "#fff",
          border: "1px solid #444",
          padding: 28,
          marginBottom: 24,
          maxWidth: 500,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Formulaire Inspection</h3>
        <br />
        {error && (
          <div style={{ color: "#ff6b6b", marginBottom: 8 }}>{error}</div>
        )}
        <div>
          <label>
            Date inspection :
            <input
              type="datetime-local"
              name="dateinspection"
              value={form.dateinspection}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 10,
                background: "#181a20",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 4,
                padding: 8,
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Kilométrage :
            <input
              type="number"
              name="kilometrage"
              value={form.kilometrage}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 10,
                background: "#181a20",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 4,
                padding: 8,
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Niveau de carburant :
            <input
              type="text"
              name="niveaucarburant"
              value={form.niveaucarburant}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 10,
                background: "#181a20",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 4,
                padding: 8,
              }}
            />
          </label>
        </div>
        <div>
          <label>
            Propreté :
            <input
              type="checkbox"
              name="proprete"
              checked={form.proprete}
              onChange={handleChange}
              style={{ marginLeft: 8 }}
            />{" "}
            Propre
          </label>
        </div>
        <br />
        <div>
          <label>
            Type inspection :
            <select
              name="typeinspection"
              value={form.typeinspection}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 10,
                background: "#181a20",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 4,
                padding: 8,
              }}
            >
              <option value="Départ">Départ</option>
              <option value="Retour">Retour</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Note :
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: 10,
                background: "#181a20",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 4,
                padding: 8,
                minHeight: 70,
                resize: "vertical",
              }}
            />
          </label>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 18,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "#444",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              cursor: "pointer",
            }}
            disabled={saving}
          >
            Annuler
          </button>
          <button
            onClick={saveInspection}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "8px 24px",
              cursor: "pointer",
              fontWeight: "bold",
              opacity: saving ? 0.7 : 1,
            }}
            disabled={saving}
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </>
  );
};

// Formulaire Paiement avec thème sombre
const PaiementForm = ({ contrat, onClose, onSaved }) => {
  const [form, setForm] = useState({
    montant: (
      Number(contrat.montantttc || 0) -
      50 +
      Number(contrat.reservation?.Vehicule?.montantcaution || 0)
    ).toFixed(2),
    mode: "carte",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth() || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaiement = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await payerContrat(
        {
          montant: form.montant,
          mode: form.mode,
          date: form.date,
          note: form.note,
          idcontrat: contrat.idcontrat,
          typepaiement: "paiement",
          statutPaiement: "succeeded", // Ajouté pour forcer succeeded
        },
        token
      );
      if (onSaved) onSaved("Paiement effectué !");
      onClose();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Erreur lors de la validation du paiement."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          zIndex: 1000,
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(20, 20, 30, 0.85)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          background: "#23272f",
          color: "#fff",
          border: "1px solid #444",
          padding: 28,
          marginBottom: 24,
          maxWidth: 500,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Paiement du contrat</h3>
        <br />
        {error && (
          <div style={{ color: "#ff6b6b", marginBottom: 8 }}>{error}</div>
        )}
        <form onSubmit={handlePaiement}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Montant à payer :
              <input
                type="number"
                name="montant"
                value={form.montant}
                readOnly
                style={{
                  marginLeft: 8,
                  width: 120,
                  background: "#181a20",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: 4,
                  padding: 8,
                }}
              />{" "}
              CAD
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Mode de paiement :
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                style={{
                  marginLeft: 8,
                  background: "#181a20",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: 4,
                  padding: 8,
                }}
              >
                <option value="carte">Carte</option>
                <option value="espece">Espèce</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Date du paiement :
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={{
                  marginLeft: 8,
                  background: "#181a20",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: 4,
                  padding: 8,
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>
              Note :
              <input
                type="text"
                name="note"
                value={form.note}
                onChange={handleChange}
                style={{
                  marginLeft: 8,
                  width: 180,
                  background: "#181a20",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: 4,
                  padding: 8,
                }}
                placeholder="Référence ou note (optionnel)"
              />
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#444",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 20px",
                cursor: "pointer",
              }}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 24px",
                cursor: "pointer",
                fontWeight: "bold",
                opacity: saving ? 0.7 : 1,
              }}
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Valider"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

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

  // Fonction pour recharger le contrat après création d'une inspection ou paiement
  const reloadContrat = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getContratById(id, token);
      setContrat(data);
      setForm({
        montant: data.montant,
        montantttc: data.montantttc,
        statut: data.statut,
        dateretourprevue: formatDateForInput(data.dateretourprevue),
      });
    } catch {
      setError("Erreur lors du chargement du contrat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadContrat();
    // eslint-disable-next-line
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

  // Affichage du message de succès après création inspection ou paiement
  const handleInspectionSaved = (msg) => {
    setSuccess(msg);
    reloadContrat();
  };

  const handlePaiementSaved = (msg) => {
    setSuccess(msg);
    reloadContrat();
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!contrat) return <div>Contrat introuvable.</div>;

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
          onSaved={handleInspectionSaved}
        />
      )}
      {showPaiementForm && (
        <PaiementForm
          contrat={contrat}
          onClose={() => setShowPaiementForm(false)}
          onSaved={handlePaiementSaved}
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
                <span style={labelStyle}>Image principale :</span>
                {(() => {
                  const mainImage =
                    vehicule.VehiculeImages.find((img) => img.estprincipale) ||
                    vehicule.VehiculeImages[0];
                  return (
                    <img
                      src={mainImage.urlimage}
                      alt="Véhicule"
                      style={{
                        width: 260,
                        borderRadius: 10,
                        marginLeft: 16,
                        boxShadow: "0 4px 24px #0003",
                        border: "2px solid #1976d2",
                        objectFit: "cover",
                      }}
                    />
                  );
                })()}
              </div>
            )}
          </div>

          {/* Section Inspection (affichage de la dernière inspection seulement) */}
          <div style={sectionStyle}>
            <h3>Etat du véhicule</h3>
            <br />
            {contrat.inspections && contrat.inspections.length > 0 ? (
              (() => {
                const lastInspection = contrat.inspections
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.dateinspection) - new Date(a.dateinspection)
                  )[0];
                return (
                  <div style={{ marginBottom: 12 }}>
                    <div>
                      <span style={labelStyle}>Date :</span>
                      <span style={valueStyle}>
                        {lastInspection.dateinspection
                          ? new Date(
                              lastInspection.dateinspection
                            ).toLocaleString("fr-CA")
                          : ""}
                      </span>
                    </div>
                    <div>
                      <span style={labelStyle}>Kilométrage :</span>
                      <span style={valueStyle}>
                        {lastInspection.kilometrage}
                      </span>
                    </div>
                    <div>
                      <span style={labelStyle}>Niveau carburant :</span>
                      <span style={valueStyle}>
                        {lastInspection.niveaucarburant}
                      </span>
                    </div>
                    <div>
                      <span style={labelStyle}>Propreté :</span>
                      <span style={valueStyle}>
                        {lastInspection.proprete ? "Oui" : "Non"}
                      </span>
                    </div>
                    <div>
                      <span style={labelStyle}>Type inspection :</span>
                      <span style={valueStyle}>
                        {lastInspection.typeinspection}
                      </span>
                    </div>
                    <div>
                      <span style={labelStyle}>Note :</span>
                      <span style={valueStyle}>{lastInspection.note}</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div>Aucune inspection enregistrée.</div>
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
            <div
              style={{ marginTop: 8, textAlign: "right", fontWeight: "bold" }}
            >
              Versement Réservation : - CAD 50.00
            </div>
            <div
              style={{ marginTop: 8, textAlign: "right", fontWeight: "bold" }}
            >
              Caution : CAD{" "}
              {vehicule.montantcaution
                ? Number(vehicule.montantcaution).toFixed(2)
                : "0.00"}
            </div>
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
                cursor: contrat.statut === "actif" ? "not-allowed" : "pointer",
                opacity: contrat.statut === "actif" ? 0.5 : 1,
              }}
              disabled={contrat.statut === "actif"}
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