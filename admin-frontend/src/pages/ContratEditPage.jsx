import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getContratById, updateContrat } from "../services/contratService";

const ContratEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    getContratById(id)
      .then((res) => {
        setContrat(res);
        setEditValues({
          date_debut: res.date_debut ? res.date_debut.slice(0, 10) : "",
          date_fin: res.date_fin ? res.date_fin.slice(0, 10) : "",
          montant_total: res.montant_total || "",
          caution: res.caution || "",
          // Ajoute ici d'autres champs à éditer si besoin
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setEditValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateContrat(id, editValues);
      navigate(-1); // Retour à la page précédente ou adapte selon ton besoin
    } catch (err) {
      alert("Erreur lors de la modification du contrat");
    }
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;
  if (!contrat) return <div>Contrat introuvable.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
      <button className="mb-4 btn btn-secondary" onClick={() => navigate(-1)}>
        Retour
      </button>
      <h2 className="text-2xl font-bold mb-4">
        Édition du contrat #{contrat.numero_contrat || contrat.idcontrat}
      </h2>
      <form className="space-y-2" onSubmit={handleSubmit}>
        <div>
          <b>Date début :</b>
          <input
            type="date"
            name="date_debut"
            className="input input-style-auto ml-2"
            value={editValues.date_debut}
            onChange={handleChange}
          />
        </div>
        <div>
          <b>Date fin :</b>
          <input
            type="date"
            name="date_fin"
            className="input input-style-auto ml-2"
            value={editValues.date_fin}
            onChange={handleChange}
          />
        </div>
        <div>
          <b>Montant total :</b>
          <input
            type="number"
            name="montant_total"
            className="input input-style-auto ml-2"
            value={editValues.montant_total}
            onChange={handleChange}
          />
        </div>
        <div>
          <b>Caution :</b>
          <input
            type="number"
            name="caution"
            className="input input-style-auto ml-2"
            value={editValues.caution}
            onChange={handleChange}
          />
        </div>
        {/* Ajoute ici d'autres champs à éditer si besoin */}
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary">
            Enregistrer
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratEditPage;
