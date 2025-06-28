const UtilisateurFilters = ({ filters, onFilterChange, succursales = [] }) => (
  <div className="flex flex-wrap gap-4 mb-4 items-end">
    <input
      type="text"
      placeholder="Nom"
      value={filters.nom || ""}
      onChange={(e) => onFilterChange("nom", e.target.value)}
      className="input input-style-auto"
    />
    <input
      type="text"
      placeholder="Prénom"
      value={filters.prenom || ""}
      onChange={(e) => onFilterChange("prenom", e.target.value)}
      className="input input-style-auto"
    />
    <select
      value={filters.succursale || ""}
      onChange={(e) => onFilterChange("succursale", e.target.value)}
      className="input input-style-auto"
    >
      <option value="">Toutes les succursales</option>
      {succursales.map((s) => (
        <option key={s.id} value={s.id}>
          {s.nom}
        </option>
      ))}
    </select>
    <select
      value={filters.role || ""}
      onChange={(e) => onFilterChange("role", e.target.value)}
      className="input input-style-auto"
      //className="input-style w-full"
    >
      <option value="">Tous les rôles</option>
      <option value="admin">Admin</option>
      <option value="employe">Employé</option>
      <option value="client">Client</option>
    </select>
    <button
      className="btn btn-secondary"
      onClick={() => onFilterChange("clear")}
    >
      Réinitialiser
    </button>
  </div>
);

export default UtilisateurFilters;
