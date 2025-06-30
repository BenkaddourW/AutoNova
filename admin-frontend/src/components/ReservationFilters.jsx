import { useState } from "react";

const ReservationFilters = ({
  filters,
  onFilterChange,
  agences = [],
  isEmploye = false,
}) => {
  const [localFilters, setLocalFilters] = useState({
    numeroreservation: filters.numeroreservation || "",
    nom: filters.nom || "",
    prenom: filters.prenom || "",
  });

  const handleInputChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleInputKeyDown = (key, value, e) => {
    if (e.key === "Enter") {
      onFilterChange(key, value);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      <input
        type="text"
        placeholder="Numéro de réservation"
        value={localFilters.numeroreservation}
        onChange={(e) =>
          handleInputChange("numeroreservation", e.target.value.toUpperCase())
        }
        onKeyDown={(e) =>
          handleInputKeyDown(
            "numeroreservation",
            localFilters.numeroreservation,
            e
          )
        }
        className="input input-style-auto uppercase"
        maxLength={20}
      />
      <input
        type="text"
        placeholder="Nom du client"
        value={localFilters.nom}
        onChange={(e) => handleInputChange("nom", e.target.value)}
        onKeyDown={(e) => handleInputKeyDown("nom", localFilters.nom, e)}
        className="input input-style-auto"
      />
      <input
        type="text"
        placeholder="Prénom du client"
        value={localFilters.prenom}
        onChange={(e) => handleInputChange("prenom", e.target.value)}
        onKeyDown={(e) => handleInputKeyDown("prenom", localFilters.prenom, e)}
        className="input input-style-auto"
      />
      <input
        type="date"
        placeholder="Date de livraison"
        value={filters.date_livraison || ""}
        onChange={(e) => onFilterChange("date_livraison", e.target.value)}
        className="input input-style-auto"
      />
      <input
        type="date"
        placeholder="Date de retour"
        value={filters.date_retour || ""}
        onChange={(e) => onFilterChange("date_retour", e.target.value)}
        className="input input-style-auto"
      />
      {!isEmploye && (
        <select
          value={filters.succursale || ""}
          onChange={(e) => onFilterChange("succursale", e.target.value)}
          className="input input-style-auto"
        >
          <option value="">Toutes les succursales</option>
          {agences.map((ag) => (
            <option key={ag.id} value={ag.id}>
              {ag.nom}
            </option>
          ))}
        </select>
      )}
      <button
        className="btn btn-secondary"
        onClick={() => {
          setLocalFilters({ numeroreservation: "", nom: "", prenom: "" });
          onFilterChange("clear");
        }}
      >
        Réinitialiser
      </button>
    </div>
  );
};

export default ReservationFilters;
