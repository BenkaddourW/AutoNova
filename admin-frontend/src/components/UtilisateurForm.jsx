import { useState, useEffect } from "react";

const UtilisateurForm = ({
  initialData = {},
  onCancel,
  onSubmit,
  succursales = [],
}) => {
  const [form, setForm] = useState({
    nom: initialData?.nom || "",
    prenom: initialData?.prenom || "",
    email: initialData?.email || "",
    motdepasse: "",
    role: initialData?.role || "employe",
    succursale: initialData?.succursale || "",
    dateembauche: initialData?.dateembauche || "",
    adresse1: initialData?.adresse1 || "",
    adresse2: initialData?.adresse2 || "",
    ville: initialData?.ville || "",
    codepostal: initialData?.codepostal || "",
    province: initialData?.province || "",
    pays: initialData?.pays || "",
    numerotelephone: initialData?.numerotelephone || "",
    numeromobile: initialData?.numeromobile || "",
  });

  useEffect(() => {
    setForm({
      nom: initialData?.nom || "",
      prenom: initialData?.prenom || "",
      email: initialData?.email || "",
      motdepasse: "",
      role: initialData?.role || "employe",
      succursale: initialData?.succursale || "",
      dateembauche: initialData?.dateembauche || "",
      adresse1: initialData?.adresse1 || "",
      adresse2: initialData?.adresse2 || "",
      ville: initialData?.ville || "",
      codepostal: initialData?.codepostal || "",
      province: initialData?.province || "",
      pays: initialData?.pays || "",
      numerotelephone: initialData?.numerotelephone || "",
      numeromobile: initialData?.numeromobile || "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  const isEditing = !!initialData && !!initialData.idutilisateur;
  const isEmploye = form.role === "employe";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">
            {isEditing
              ? `Modifier l'utilisateur`
              : "Ajouter un nouvel utilisateur"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="label-style">Nom</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label-style">Prénom</label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-style">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-style">Mot de passe</label>
              <input
                name="motdepasse"
                type="password"
                value={form.motdepasse}
                onChange={handleChange}
                className="input input-bordered w-full"
                required={!isEditing}
                placeholder={
                  isEditing ? "Laisser vide pour ne pas changer" : ""
                }
              />
            </div>
            <div>
              <label className="label-style">Rôle</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input input-style w-full"
                // className="input input-bordered w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              >
                <option value="admin">Admin</option>
                <option value="employe">Employé</option>
              </select>
            </div>
            <div>
              <label className="label-style">Succursale</label>
              <select
                name="succursale"
                value={form.succursale}
                onChange={handleChange}
                className="input input-style w-full"
                //className="input input-bordered w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required={isEmploye}
                disabled={!isEmploye}
              >
                <option value="">Aucune</option>
                {succursales.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
              {isEmploye && !form.succursale && (
                //<span className="text-red-500 text-xs">
                <span className="text-red-500 text-xs">
                  Succursale obligatoire pour un employé
                </span>
              )}
            </div>
            {isEmploye && (
              <div className="md:col-span-2">
                <label className="label-style">Date d'embauche</label>
                <input
                  name="dateembauche"
                  type="date"
                  value={form.dateembauche || ""}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required={isEmploye}
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="label-style">Adresse 1</label>
              <input
                name="adresse1"
                value={form.adresse1}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-style">Adresse 2</label>
              <input
                name="adresse2"
                value={form.adresse2}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label-style">Ville</label>
              <input
                name="ville"
                value={form.ville}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label-style">Code postal</label>
              <input
                name="codepostal"
                value={form.codepostal}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label-style">Province</label>
              <input
                name="province"
                value={form.province}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label-style">Pays</label>
              <input
                name="pays"
                value={form.pays}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label-style">Téléphone</label>
              <input
                name="numerotelephone"
                value={form.numerotelephone}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label-style">Mobile</label>
              <input
                name="numeromobile"
                value={form.numeromobile}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? "Sauvegarder" : "Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UtilisateurForm;
