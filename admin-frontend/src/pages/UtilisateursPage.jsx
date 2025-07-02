import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Car,
  Wrench,
  CalendarCheck,
  CircleOff,
  Download,
  CarFront,
} from "lucide-react";

// --- Services ---
import * as utilisateurService from "../services/utilisateurService";
import { getSuccursales } from "../services/succursaleService";

// --- Composants ---
import UtilisateursTable from "../components/UtilisateursTable";
import UtilisateurForm from "../components/UtilisateurForm";
import StatCard from "../components/StatCard";
import UtilisateurFilters from "../components/UtilisateurFilters";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import { useAuth } from "../context/AuthContext";
import { User, ShieldCheck, Briefcase, UserCircle } from "lucide-react";

const UtilisateursPage = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    succursale: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUtilisateur, setCurrentUtilisateur] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [succursales, setSuccursales] = useState([]);

  const { token } = useAuth();

  // Charger la liste des succursales au montage
  useEffect(() => {
    getSuccursales()
      .then((data) => {
        setSuccursales(
          data.map((s) => ({
            id: s.idsuccursale,
            nom: s.nomsuccursale,
          }))
        );
      })
      .catch(console.error);
  }, []);

  // Correction ici : mapping succursale -> idsuccursale pour l'API
  const loadPageData = useCallback(async () => {
    setLoading(true);
    // Prépare les filtres pour l'API
    const apiFilters = {
      ...filters,
      idsuccursale: filters.succursale,
    };
    delete apiFilters.succursale;

    // Récupère les utilisateurs (en cas d'erreur, affiche la notif)
    try {
      const utilisateursData = await utilisateurService.getUtilisateurs(
        apiFilters,
        token
      );
      setUtilisateurs(Array.isArray(utilisateursData) ? utilisateursData : []);
    } catch (err) {
      setUtilisateurs([]);
      setNotification({
        show: true,
        type: "error",
        message: "Erreur lors de la récupération des utilisateurs",
      });
    }

    setLoading(false);
  }, [filters, token]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const handleFilterChange = (key, value) => {
    if (key === "clear") {
      setFilters({ nom: "", prenom: "", succursale: "", role: "" });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleOpenAddModal = () => {
    setCurrentUtilisateur(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (utilisateur) => {
    setCurrentUtilisateur(utilisateur);
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentUtilisateur(null);
  };

  // Handler pour création/mise à jour utilisateur
  const handleSubmit = async (formData) => {
    try {
      if (currentUtilisateur && currentUtilisateur.idutilisateur) {
        await utilisateurService.updateUtilisateur(
          currentUtilisateur.idutilisateur,
          formData,
          token
        );
        setNotification({
          show: true,
          type: "success",
          message: "Utilisateur modifié avec succès",
        });
      } else {
        await utilisateurService.createUserByAdmin(formData, token);
        setNotification({
          show: true,
          type: "success",
          message: "Utilisateur créé avec succès",
        });
      }
      setIsModalOpen(false);
      setCurrentUtilisateur(null);
      loadPageData();
    } catch (err) {
      setNotification({
        show: true,
        type: "error",
        message: err.message || "Erreur lors de l'enregistrement",
      });
    }
  };

  // --- Calcul des statistiques à partir de la liste ---
  const total = utilisateurs.length;
  const admins = utilisateurs.filter((u) =>
    u.Roles?.some((r) => r.role === "admin")
  ).length;
  const employes = utilisateurs.filter((u) =>
    u.Roles?.some((r) => r.role === "employe")
  ).length;
  const clients = utilisateurs.filter((u) =>
    u.Roles?.some((r) => r.role === "client")
  ).length;

  return (
    <div className="space-y-8">
      {notification.show && (
        <div
          className={`fixed top-5 right-5 text-white px-4 py-2 rounded-lg shadow-lg z-50 ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion des Utilisateurs</h2>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Dashboard Statistiques */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <StatCard title="Total utilisateurs" value={total} icon={User} />
          <StatCard title="Admins" value={admins} icon={ShieldCheck} />
          <StatCard title="Employés" value={employes} icon={Briefcase} />
          <StatCard title="Clients" value={clients} icon={UserCircle} />
        </div>
      )}

      {/* Filtres */}
      <UtilisateurFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        succursales={succursales}
      />

      {/* Tableau des utilisateurs */}
      <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold">Utilisateurs</h3>
        {loading ? (
          <div className="text-center py-8">Chargement de la liste...</div>
        ) : (
          <UtilisateursTable
            utilisateurs={utilisateurs}
            succursales={succursales}
            onEdit={handleOpenEditModal}
          />
        )}
      </div>

      {isModalOpen && (
        <UtilisateurForm
          initialData={currentUtilisateur || {}}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          succursales={succursales}
        />
      )}
    </div>
  );
};

export default UtilisateursPage;
