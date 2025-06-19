-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.client (
  idclient integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codeclient character varying NOT NULL UNIQUE,
  numeropc character varying NOT NULL,
  paysdelivrance character varying NOT NULL,
  autoritedelivrance character varying NOT NULL,
  datenaissance date NOT NULL,
  dateexpiration date NOT NULL,
  idutilisateur integer NOT NULL,
  CONSTRAINT client_pkey PRIMARY KEY (idclient),
  CONSTRAINT fk_utilisateur FOREIGN KEY (idutilisateur) REFERENCES public.utilisateur(idutilisateur)
);
CREATE TABLE public.contrat (
  idcontrat integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  numerocontrat character varying NOT NULL UNIQUE,
  date timestamp without time zone NOT NULL,
  montant numeric NOT NULL CHECK (montant >= 0::numeric),
  montantttc numeric NOT NULL CHECK (montantttc >= 0::numeric),
  statut character varying NOT NULL,
  taxes numeric NOT NULL CHECK (taxes >= 0::numeric),
  idreservation integer NOT NULL,
  dateretourprevue timestamp without time zone NOT NULL,
  dateretour timestamp without time zone NOT NULL,
  idpaiement integer,
  idfacture integer,
  CONSTRAINT contrat_pkey PRIMARY KEY (idcontrat),
  CONSTRAINT contrat_idreservation_fkey FOREIGN KEY (idreservation) REFERENCES public.reservation(idreservation),
  CONSTRAINT contrat_idfacture_fkey FOREIGN KEY (idfacture) REFERENCES public.facture(idfacture),
  CONSTRAINT contrat_idpaiement_fkey FOREIGN KEY (idpaiement) REFERENCES public.paiement(idpaiement)
);
CREATE TABLE public.employe (
  idemploye integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codeemploye character varying NOT NULL UNIQUE,
  dateembauche date NOT NULL,
  datedepart date,
  idutilisateur integer NOT NULL,
  idsuccursale integer NOT NULL,
  CONSTRAINT employe_pkey PRIMARY KEY (idemploye),
  CONSTRAINT fk_utilisateur_employe FOREIGN KEY (idutilisateur) REFERENCES public.utilisateur(idutilisateur),
  CONSTRAINT fk_succursale_employe FOREIGN KEY (idsuccursale) REFERENCES public.succursale(idsuccursale)
);
CREATE TABLE public.facture (
  idfacture integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  numerofacture character varying NOT NULL UNIQUE,
  date timestamp without time zone NOT NULL,
  montant numeric NOT NULL,
  montantpenalite numeric NOT NULL,
  montanttaxes numeric NOT NULL,
  montantttc numeric NOT NULL,
  montantremboursement numeric NOT NULL,
  idpaiement integer,
  CONSTRAINT facture_pkey PRIMARY KEY (idfacture),
  CONSTRAINT facture_idpaiement_fkey FOREIGN KEY (idpaiement) REFERENCES public.paiement(idpaiement)
);
CREATE TABLE public.facture_penalite (
  idfacture integer NOT NULL,
  idpenalite integer NOT NULL,
  montantbase numeric NOT NULL,
  quantite numeric NOT NULL,
  CONSTRAINT facture_penalite_pkey PRIMARY KEY (idfacture, idpenalite),
  CONSTRAINT facture_penalite_idfacture_fkey FOREIGN KEY (idfacture) REFERENCES public.facture(idfacture),
  CONSTRAINT facture_penalite_idpenalite_fkey FOREIGN KEY (idpenalite) REFERENCES public.penalite(idpenalite)
);
CREATE TABLE public.imageinspection (
  idimageinspection integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  urlimage character varying NOT NULL,
  idinspection integer NOT NULL,
  CONSTRAINT imageinspection_pkey PRIMARY KEY (idimageinspection),
  CONSTRAINT imageinspection_idinspection_fkey FOREIGN KEY (idinspection) REFERENCES public.inspection(idinspection)
);
CREATE TABLE public.imagevehicule (
  idimage integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  urlimage character varying NOT NULL,
  estprincipale boolean NOT NULL,
  idvehicule integer NOT NULL,
  CONSTRAINT imagevehicule_pkey PRIMARY KEY (idimage),
  CONSTRAINT image_idvehicule_fkey FOREIGN KEY (idvehicule) REFERENCES public.vehicule(idvehicule)
);
CREATE TABLE public.inspection (
  idinspection integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  dateinspection timestamp without time zone NOT NULL,
  kilometrage integer NOT NULL CHECK (kilometrage >= 0),
  niveaucarburant character varying NOT NULL,
  proprete boolean NOT NULL,
  note character varying,
  typeinspection character varying NOT NULL,
  idvehicule integer NOT NULL,
  idcontrat integer NOT NULL,
  CONSTRAINT inspection_pkey PRIMARY KEY (idinspection),
  CONSTRAINT inspection_idcontrat_fkey FOREIGN KEY (idcontrat) REFERENCES public.contrat(idcontrat),
  CONSTRAINT inspection_idvehicule_fkey FOREIGN KEY (idvehicule) REFERENCES public.vehicule(idvehicule)
);
CREATE TABLE public.paiement (
  idpaiement integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  datepaiement timestamp without time zone NOT NULL,
  montant numeric NOT NULL,
  typepaiement character varying NOT NULL,
  modepaiement character varying NOT NULL,
  CONSTRAINT paiement_pkey PRIMARY KEY (idpaiement)
);
CREATE TABLE public.penalite (
  idpenalite integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codepenalite character varying NOT NULL,
  typepenalite character varying NOT NULL,
  description character varying NOT NULL,
  CONSTRAINT penalite_pkey PRIMARY KEY (idpenalite)
);
CREATE TABLE public.reservation (
  idreservation integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  numeroreservation character varying NOT NULL UNIQUE,
  datereservation timestamp without time zone NOT NULL,
  daterdv timestamp without time zone NOT NULL,
  dateretour timestamp without time zone NOT NULL,
  montanttotal numeric NOT NULL,
  taxes numeric NOT NULL,
  montantttc numeric NOT NULL,
  statut character varying NOT NULL,
  idclient integer NOT NULL,
  idsuccursalelivraison integer NOT NULL,
  idsuccursaleretour integer NOT NULL,
  idvehicule integer NOT NULL,
  idpaiement integer NOT NULL,
  CONSTRAINT reservation_pkey PRIMARY KEY (idreservation),
  CONSTRAINT fk_reservation_succursale_retour FOREIGN KEY (idsuccursaleretour) REFERENCES public.succursale(idsuccursale),
  CONSTRAINT fk_reservation_vehicule FOREIGN KEY (idvehicule) REFERENCES public.vehicule(idvehicule),
  CONSTRAINT fk_reservation_paiement FOREIGN KEY (idpaiement) REFERENCES public.paiement(idpaiement),
  CONSTRAINT fk_reservation_client FOREIGN KEY (idclient) REFERENCES public.client(idclient),
  CONSTRAINT fk_reservation_succursale_livraison FOREIGN KEY (idsuccursalelivraison) REFERENCES public.succursale(idsuccursale)
);
CREATE TABLE public.role (
  idrole integer NOT NULL DEFAULT nextval('role_idrole_seq'::regclass),
  role character varying NOT NULL UNIQUE CHECK (role::text = ANY (ARRAY['client'::character varying, 'employe'::character varying, 'admin'::character varying]::text[])),
  description text,
  CONSTRAINT role_pkey PRIMARY KEY (idrole)
);
CREATE TABLE public.succursale (
  idsuccursale integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  codeagence character varying NOT NULL UNIQUE,
  nomsuccursale character varying NOT NULL,
  adresse1 character varying NOT NULL,
  adresse2 character varying NOT NULL,
  ville character varying NOT NULL,
  codepostal character varying NOT NULL,
  province character varying NOT NULL,
  pays character varying NOT NULL,
  telephone character varying NOT NULL,
  CONSTRAINT succursale_pkey PRIMARY KEY (idsuccursale)
);
CREATE TABLE public.succursale_employe (
  idsuccursale integer NOT NULL,
  idemploye integer NOT NULL,
  datearrivee date NOT NULL,
  datedepart date NOT NULL,
  CONSTRAINT succursale_employe_pkey PRIMARY KEY (idsuccursale, idemploye),
  CONSTRAINT succursale_employe_idsuccursale_fkey FOREIGN KEY (idsuccursale) REFERENCES public.succursale(idsuccursale),
  CONSTRAINT succursale_employe_idemploye_fkey FOREIGN KEY (idemploye) REFERENCES public.employe(idemploye)
);
CREATE TABLE public.taxe (
  idtaxe integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  denomination character varying NOT NULL UNIQUE,
  abrege character varying NOT NULL UNIQUE,
  taux numeric NOT NULL CHECK (taux >= 0::numeric AND taux <= 100::numeric),
  CONSTRAINT taxe_pkey PRIMARY KEY (idtaxe)
);
CREATE TABLE public.taxe_contrat (
  idtaxe integer NOT NULL,
  idcontrat integer NOT NULL,
  CONSTRAINT taxe_contrat_pkey PRIMARY KEY (idtaxe, idcontrat),
  CONSTRAINT taxes_contrat_idtaxe_fkey FOREIGN KEY (idtaxe) REFERENCES public.taxe(idtaxe),
  CONSTRAINT taxes_contrat_idcontrat_fkey FOREIGN KEY (idcontrat) REFERENCES public.contrat(idcontrat)
);
CREATE TABLE public.taxes_reservation (
  idtaxe integer NOT NULL,
  idreservation integer NOT NULL,
  CONSTRAINT taxes_reservation_pkey PRIMARY KEY (idtaxe, idreservation),
  CONSTRAINT taxes_reservation_idreservation_fkey FOREIGN KEY (idreservation) REFERENCES public.reservation(idreservation),
  CONSTRAINT taxes_reservation_idtaxe_fkey FOREIGN KEY (idtaxe) REFERENCES public.taxe(idtaxe)
);
CREATE TABLE public.token_session (
  idtoken integer NOT NULL DEFAULT nextval('token_session_idtoken_seq'::regclass),
  idutilisateur integer NOT NULL,
  token text NOT NULL,
  type character varying CHECK (type::text = ANY (ARRAY['access'::character varying, 'refresh'::character varying]::text[])),
  dateexpiration timestamp without time zone NOT NULL,
  ipsource character varying,
  useragent text,
  isrevoked boolean DEFAULT false,
  daterevocation timestamp without time zone,
  createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT token_session_pkey PRIMARY KEY (idtoken),
  CONSTRAINT token_session_idutilisateur_fkey FOREIGN KEY (idutilisateur) REFERENCES public.utilisateur(idutilisateur)
);
CREATE TABLE public.utilisateur (
  idutilisateur integer NOT NULL DEFAULT nextval('utilisateur_idutilisateur_seq'::regclass),
  email character varying NOT NULL UNIQUE,
  motdepasse text NOT NULL,
  estactif boolean DEFAULT true,
  datecreation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  nom character varying NOT NULL,
  prenom character varying NOT NULL,
  adresse1 character varying,
  adresse2 character varying,
  ville character varying,
  codepostal character varying,
  province character varying,
  pays character varying,
  numerotelephone character varying,
  numeromobile character varying,
  CONSTRAINT utilisateur_pkey PRIMARY KEY (idutilisateur)
);
CREATE TABLE public.utilisateur_role (
  idutilisateur integer NOT NULL,
  idrole integer NOT NULL,
  CONSTRAINT utilisateur_role_pkey PRIMARY KEY (idutilisateur, idrole),
  CONSTRAINT utilisateur_role_idrole_fkey FOREIGN KEY (idrole) REFERENCES public.role(idrole),
  CONSTRAINT utilisateur_role_idutilisateur_fkey FOREIGN KEY (idutilisateur) REFERENCES public.utilisateur(idutilisateur)
);
CREATE TABLE public.vehicule (
  idvehicule integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  immatriculation character varying NOT NULL UNIQUE,
  marque character varying NOT NULL,
  modele character varying NOT NULL,
  categorie character varying NOT NULL,
  transmission character varying NOT NULL,
  energie character varying NOT NULL,
  couleur character varying NOT NULL,
  statut character varying NOT NULL,
  kilometrage integer NOT NULL,
  sieges integer NOT NULL,
  typeentrainement character varying NOT NULL,
  tarifjournalier numeric NOT NULL,
  montantcaution numeric NOT NULL,
  succursaleidsuccursale integer NOT NULL,
  CONSTRAINT vehicule_pkey PRIMARY KEY (idvehicule),
  CONSTRAINT fk_vehicule_succursale FOREIGN KEY (succursaleidsuccursale) REFERENCES public.succursale(idsuccursale)
);
CREATE TABLE public.vehicule_penalite (
  idvehicule integer NOT NULL,
  idpenalite integer NOT NULL,
  montantbase numeric NOT NULL,
  CONSTRAINT vehicule_penalite_pkey PRIMARY KEY (idvehicule, idpenalite),
  CONSTRAINT vehicule_penalite_idpenalite_fkey FOREIGN KEY (idpenalite) REFERENCES public.penalite(idpenalite),
  CONSTRAINT vehicule_penalite_idvehicule_fkey FOREIGN KEY (idvehicule) REFERENCES public.vehicule(idvehicule)
);