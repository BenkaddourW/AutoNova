Ce fichier est conçu pour être la vitrine de votre projet sur GitHub. Il explique non seulement ce que fait le projet, mais aussi comment il est structuré et comment le lancer.

Voici le code complet à copier dans un nouveau fichier nommé README.md à la racine de votre projet.
Generated markdown

      
# AutoNova - Plateforme de Location de Véhicules

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-grey?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue?style=for-the-badge&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-API-blueviolet?style=for-the-badge&logo=stripe)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)

AutoNova est une application web complète de location de véhicules, bâtie sur une **architecture microservices** robuste et évolutive. Elle couvre l'ensemble du parcours client, de la recherche de véhicules à la réservation et au paiement sécurisé, ainsi qu'un back-office complet pour la gestion administrative et opérationnelle.

---

## Table des Matières
1.  [Fonctionnalités Clés](#fonctionnalités-clés)
2.  [Architecture Microservices](#architecture-microservices)
3.  [Technologies Utilisées](#technologies-utilisées)
4.  [Prérequis](#prérequis)
5.  [Installation et Démarrage](#installation-et-démarrage)
    - [Étape 1 : Cloner le Dépôt](#étape-1--cloner-le-dépôt)
    - [Étape 2 : Configuration de l'Environnement](#étape-2--configuration-de-lenvironnement)
    - [Étape 3 : Lancer l'Infrastructure](#étape-3--lancer-linfrastructure-avec-docker)
    - [Étape 4 : Installer les Dépendances](#étape-4--installer-les-dépendances)
    - [Étape 5 : Lancer les Services](#étape-5--lancer-les-services)
6.  [Aperçu des Endpoints de l'API](#aperçu-des-endpoints-de-lapi)
7.  [Contribuer](#contribuer)
8.  [Licence](#licence)

---

## Fonctionnalités Clés

-   **Recherche de Véhicules :** Filtres avancés par date, type, marque, succursale, etc.
-   **Gestion des Disponibilités :** Vérification en temps réel de la disponibilité des véhicules.
-   **Processus de Réservation :** Flux de réservation complet en plusieurs étapes.
-   **Paiement Sécurisé :** Intégration avec **Stripe** pour des paiements et remboursements sécurisés.
-   **Espace Client :** Gestion de profil, historique des réservations.
-   **Authentification Robuste :** Système basé sur JWT (Access & Refresh Tokens) avec gestion des rôles (Client, Employé, Admin).
-   **Back-Office (Admin/Employé) :**
    -   Gestion complète des véhicules, succursales, clients et employés.
    -   Suivi des réservations et des contrats.
    -   **Tableau de bord** avec statistiques clés (revenus, véhicules populaires, etc.).
-   **Découverte de Services :** Utilisation de **Consul** pour une communication dynamique et résiliente entre les services.

---

## Architecture Microservices

Le projet est décomposé en plusieurs services indépendants, chacun ayant une responsabilité unique. Ils communiquent entre eux via une **API Gateway** qui sert de point d'entrée unique et sécurisé.

    

IGNORE_WHEN_COPYING_START
Use code with caution. Markdown
IGNORE_WHEN_COPYING_END

Client (Navigateur / Mobile)
|
|
+------V------+
| API Gateway | (Express.js, http-proxy-middleware)
+-------------+
|
|------------------------------------------------------------------------+
| | | | |
+------V------+ +------V-------+ +------V------+ +------V-------+ +------V-----+
| Auth-Service| | Client-Service | | Vehicule-Service| | Succursale-Service| | Taxe-Service|
+-------------+ +--------------+ +---------------+ +-------------------+ +-------------+
| | | | |
| | | | |
+------V-----------+ +--V---------------+ +----V-------------+ +-----V----------+
| Reservation-Service | | Contrat-Service | | Paiement-Service | | Dashboard-Service|
+-------------------+ +------------------+ +------------------+ +------------------+
| | |
| | |
+------V------------------------V--------------------V------+
| Base de Données (PostgreSQL) |
+-----------------------------------------------------------+
|
+------V------+
| Consul | (Service Discovery)
+-------------+
Generated code

      
---

## Technologies Utilisées

-   **Backend :** Node.js, Express.js
-   **Base de Données :** PostgreSQL
-   **ORM :** Sequelize
-   **Authentification :** JSON Web Tokens (JWT)
-   **Paiement :** Stripe API
-   **Conteneurisation :** Docker, Docker Compose
-   **Orchestration & Découverte :** Consul
-   **Sécurité :** Helmet, CORS
-   **Outils de Développement :** Nodemon, Dotenv

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :
-   [Node.js](https://nodejs.org/) (v18.x ou supérieure)
-   [Docker](https://www.docker.com/get-started) et Docker Compose
-   [Git](https://git-scm.com/)

---

## Installation et Démarrage

Suivez ces étapes pour mettre en place et lancer le projet en local.

### Étape 1 : Cloner le Dépôt

```bash
git clone https://github.com/VOTRE_NOM_UTILISATEUR/AutoNova.git
cd AutoNova

    

IGNORE_WHEN_COPYING_START
Use code with caution.
IGNORE_WHEN_COPYING_END
Étape 2 : Configuration de l'Environnement

Chaque microservice nécessite son propre fichier .env pour les variables d'environnement.

    Naviguez dans chaque dossier de service (ex: auth-service, vehicule-service, etc.).

    Créez un fichier .env dans chacun de ces dossiers en vous basant sur le modèle .env.example s'il existe, ou en utilisant les variables ci-dessous.

Exemple de variables pour auth-service/.env :
Generated plaintext

      
PORT=3001
DATABASE_URL=postgres://user:password@localhost:5432/autonova_auth
JWT_SECRET=VOTRE_SECRET_TRES_COMPLEXE_POUR_ACCESS_TOKEN
JWT_REFRESH_SECRET=VOTRE_AUTRE_SECRET_TRES_COMPLEXE_POUR_REFRESH

    

IGNORE_WHEN_COPYING_START
Use code with caution.
IGNORE_WHEN_COPYING_END

Exemple pour reservation-service/.env :
Generated plaintext

      
PORT=3004
DATABASE_URL=postgres://user:password@localhost:5432/autonova_reservation
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE_STRIPE
GATEWAY_URL=http://localhost:3000

    

IGNORE_WHEN_COPYING_START
Use code with caution.
IGNORE_WHEN_COPYING_END

Répétez ce processus pour tous les services.
Étape 3 : Lancer l'Infrastructure (avec Docker)

Nous utilisons Docker Compose pour lancer facilement PostgreSQL et Consul.

    Créez un fichier docker-compose.yml à la racine de votre projet :
    Generated yaml

          
    version: '3.8'

    services:
      postgres:
        image: postgres:14
        container_name: autonova_db
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          # Créez une base de données pour chaque service
          POSTGRES_DB: autonova_auth 
        ports:
          - "5432:5432"
        volumes:
          - postgres_data:/var/lib/postgresql/data
      
      consul:
        image: consul:latest
        container_name: autonova_consul
        ports:
          - "8500:8500" # UI et API HTTP
          - "8600:8600/udp" # Port DNS

    volumes:
      postgres_data:

        

    IGNORE_WHEN_COPYING_START

Use code with caution. Yaml
IGNORE_WHEN_COPYING_END

Note : Vous devrez créer manuellement les autres bases de données (autonova_reservation, autonova_vehicule, etc.) en vous connectant à l'instance PostgreSQL.

Lancez les conteneurs :
Generated bash

      
docker-compose up -d

    

IGNORE_WHEN_COPYING_START

    Use code with caution. Bash
    IGNORE_WHEN_COPYING_END

Étape 4 : Installer les Dépendances

Exécutez ce script depuis la racine du projet pour installer les dépendances de tous les services.
Generated bash

      
for service in ./*-service; do (cd "$service" && echo "--- Installing dependencies in $service ---" && npm install); done

    

IGNORE_WHEN_COPYING_START
Use code with caution. Bash
IGNORE_WHEN_COPYING_END
Étape 5 : Lancer les Services

Ouvrez un terminal pour chaque microservice et lancez-le avec Nodemon (recommandé pour le développement).

Terminal 1 : API Gateway
Generated bash

      
cd api-gateway
npm run dev

    

IGNORE_WHEN_COPYING_START
Use code with caution. Bash
IGNORE_WHEN_COPYING_END

Terminal 2 : Auth Service
Generated bash

      
cd auth-service
npm run dev

    

IGNORE_WHEN_COPYING_START
Use code with caution. Bash
IGNORE_WHEN_COPYING_END

Terminal 3 : Vehicule Service
Generated bash

      
cd vehicule-service
npm run dev

    

IGNORE_WHEN_COPYING_START
Use code with caution. Bash
IGNORE_WHEN_COPYING_END

... et ainsi de suite pour tous les autres services.

Une fois tous les services démarrés, votre application AutoNova sera accessible via l'API Gateway sur http://localhost:3000.
Aperçu des Endpoints de l'API

Toutes les requêtes doivent passer par l'API Gateway (http://localhost:3000).

    /auth : Authentification (register, login, logout, refresh-token)

    /clients : Gestion des profils clients

    /vehicules : Recherche et gestion des véhicules

    /reservations : Création et gestion des réservations

    /paiements : Traitement des paiements et remboursements

    /contrats : Gestion des contrats de location

    /succursales : Informations sur les agences

    /taxes : Calcul et gestion des taxes

    /dashboards : Données pour les tableaux de bord

Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

    Forkez le projet.

    Créez une nouvelle branche (git checkout -b feature/NouvelleFonctionnalite).

    Commitez vos changements (git commit -m 'Ajout de la NouvelleFonctionnalite').

    Pushez vers la branche (git push origin feature/NouvelleFonctionnalite).

    Ouvrez une Pull Request.

Licence

Ce projet est distribué sous la licence MIT. Voir le fichier LICENSE pour plus de détails.
