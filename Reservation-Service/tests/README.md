# Tests du Service de Réservation

Ce dossier contient tous les tests unitaires et d'intégration pour le service de réservation.

## Structure des Tests

```
tests/
├── README.md                           # Ce fichier
├── setup.js                           # Configuration globale des tests
├── reservationController.test.js      # Tests unitaires du contrôleur
├── reservationRoutes.test.js          # Tests d'intégration des routes
└── reservationValidator.test.js       # Tests des validateurs
```

## Types de Tests

### 1. Tests Unitaires (`reservationController.test.js`)
Teste les fonctions individuelles du contrôleur de réservation :
- `getReservations()` - Récupération de toutes les réservations
- `getReservationById()` - Récupération d'une réservation par ID
- `createReservation()` - Création d'une nouvelle réservation
- `updateReservation()` - Mise à jour d'une réservation
- `deleteReservation()` - Suppression d'une réservation
- `getRecentReservations()` - Récupération des réservations récentes
- `getDisponibilites()` - Vérification des disponibilités

### 2. Tests d'Intégration (`reservationRoutes.test.js`)
Teste les endpoints de l'API :
- `GET /reservations` - Liste des réservations
- `GET /reservations/:id` - Détails d'une réservation
- `POST /reservations` - Création d'une réservation
- `PUT /reservations/:id` - Mise à jour d'une réservation
- `DELETE /reservations/:id` - Suppression d'une réservation
- `POST /reservations/disponibilites` - Vérification des disponibilités
- `GET /reservations/recent` - Réservations récentes

### 3. Tests de Validation (`reservationValidator.test.js`)
Teste les règles de validation des données :
- Validation des champs obligatoires
- Validation des formats de données
- Validation des valeurs autorisées
- Validation des mises à jour partielles

## Configuration

### Variables d'Environnement de Test
Les tests utilisent des variables d'environnement spécifiques définies dans `setup.js` :
- `NODE_ENV=test`
- `PORT=3001`
- Base de données de test séparée
- Clés de test pour JWT et Stripe

### Mocks
Les tests utilisent des mocks pour :
- **Sequelize** : Modèles de base de données
- **Stripe** : Service de paiement
- **Axios** : Appels HTTP inter-services
- **Express-async-handler** : Gestion des erreurs
- **Date-fns** : Manipulation des dates

## Exécution des Tests

### Installation des Dépendances
```bash
npm install
```

### Exécution de Tous les Tests
```bash
npm test
```

### Exécution en Mode Watch
```bash
npm run test:watch
```

### Exécution avec Couverture
```bash
npm run test:coverage
```

### Exécution Verbose
```bash
npm run test:verbose
```

### Exécution d'un Test Spécifique
```bash
# Test unitaire du contrôleur
npm test -- reservationController.test.js

# Test d'intégration des routes
npm test -- reservationRoutes.test.js

# Test des validateurs
npm test -- reservationValidator.test.js
```

## Couverture de Code

Les tests couvrent :
- ✅ **Contrôleur** : 100% des fonctions principales
- ✅ **Routes** : Tous les endpoints CRUD
- ✅ **Validation** : Toutes les règles de validation
- ✅ **Gestion d'erreurs** : Cas d'erreur et exceptions
- ✅ **Logique métier** : Disponibilités, statuts, etc.

## Bonnes Pratiques

### Structure des Tests
- **Arrange** : Préparation des données de test
- **Act** : Exécution de la fonction testée
- **Assert** : Vérification des résultats

### Naming Convention
- `describe()` : Groupe de tests (nom de la fonction/endpoint)
- `it()` : Test individuel (comportement attendu)
- Noms en français pour la lisibilité

### Isolation
- Chaque test est indépendant
- Reset des mocks entre les tests
- Pas de dépendance entre les tests

### Données de Test
- Données réalistes mais simplifiées
- Cas limites et d'erreur inclus
- Couverture des statuts de réservation

## Ajout de Nouveaux Tests

### Pour une Nouvelle Fonction
1. Ajouter le test dans `reservationController.test.js`
2. Tester les cas de succès et d'erreur
3. Vérifier les appels aux modèles
4. Tester la gestion des exceptions

### Pour un Nouvel Endpoint
1. Ajouter le test dans `reservationRoutes.test.js`
2. Tester les codes de statut HTTP
3. Vérifier les réponses JSON
4. Tester les validations de requête

### Pour une Nouvelle Validation
1. Ajouter le test dans `reservationValidator.test.js`
2. Tester les données valides et invalides
3. Vérifier les messages d'erreur
4. Tester les cas limites

## Dépannage

### Erreurs Courantes
- **Timeout** : Augmenter `testTimeout` dans `jest.config.js`
- **Mocks manquants** : Vérifier les imports dans les fichiers de test
- **Variables d'environnement** : Vérifier `setup.js`

### Debug
```bash
# Mode debug avec console.log
npm test -- --verbose --no-coverage

# Test spécifique avec debug
node --inspect-brk node_modules/.bin/jest --runInBand reservationController.test.js
``` 