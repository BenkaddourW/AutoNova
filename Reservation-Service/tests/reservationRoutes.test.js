/**
 * Tests d'intégration pour les routes de réservation
 * -------------------------------------------------
 * Teste les endpoints de l'API de réservation
 */

const request = require('supertest');
const express = require('express');

// Mock des middlewares
jest.mock('../src/middlewares/authMiddleware', () => ({
  authenticateToken: (req, res, next) => next(),
  protect: (req, res, next) => next(),
}));

jest.mock('../src/middlewares/validate', () => (req, res, next) => next());

// Mock des modèles
jest.mock('../src/models', () => ({
  Reservation: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Client: {
    attributes: ['nom', 'prenom'],
  },
  Vehicule: {
    attributes: ['marque', 'modele'],
  },
}));

// Mock de express-async-handler
jest.mock('express-async-handler', () => (fn) => fn);

// Mock de Stripe
jest.mock('stripe', () => jest.fn(() => ({})));

// Mock d'axios
jest.mock('axios');

// Mock de date-fns
jest.mock('date-fns', () => ({
  differenceInDays: jest.fn(),
}));

// Mock de sequelize
jest.mock('../src/config/database', () => ({
  transaction: jest.fn(),
}));

// Mock du contrôleur avec toutes les fonctions nécessaires
const mockReservationController = {
  getReservations: jest.fn(),
  getReservationById: jest.fn(),
  createReservation: jest.fn(),
  updateReservation: jest.fn(),
  deleteReservation: jest.fn(),
  getDisponibilites: jest.fn(),
  getRecentReservations: jest.fn(),
  getMyReservations: jest.fn(),
  getMyReservationById: jest.fn(),
  initiateCheckout: jest.fn(),
  finalizeReservation: jest.fn(),
  getTopSuccursalesByReservation: jest.fn(),
  getTopReservedVehicles: jest.fn(),
  getReservationCountBySuccursale: jest.fn(),
  getMonthlyEvolution: jest.fn(),
  getActiveReservationsCount: jest.fn(),
};

jest.mock('../src/controllers/reservationController', () => mockReservationController);

// Mock des validateurs - retourner des tableaux de fonctions middleware
jest.mock('../src/validators/reservationValidator', () => ({
  createReservationRules: [(req, res, next) => next()],
  updateReservationRules: [(req, res, next) => next()],
}));

describe('Reservation Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Réinitialiser tous les mocks
    jest.clearAllMocks();
    
    // Configurer les mocks par défaut
    mockReservationController.getReservations.mockImplementation((req, res) => {
      res.json([]);
    });
    
    mockReservationController.getReservationById.mockImplementation((req, res) => {
      res.json({ id: req.params.id });
    });
    
    mockReservationController.createReservation.mockImplementation((req, res) => {
      res.status(201).json(req.body);
    });
    
    mockReservationController.updateReservation.mockImplementation((req, res) => {
      res.json({ id: req.params.id, ...req.body });
    });
    
    mockReservationController.deleteReservation.mockImplementation((req, res) => {
      res.status(204).end();
    });
    
    mockReservationController.getDisponibilites.mockImplementation((req, res) => {
      res.json({ disponibles: [] });
    });
    
    mockReservationController.getRecentReservations.mockImplementation((req, res) => {
      res.json([]);
    });
    
    // Charger les routes après avoir configuré les mocks
    const reservationRoutes = require('../src/routes/reservationRoutes');
    app.use('/reservations', reservationRoutes);
  });

  describe('GET /reservations', () => {
    it('devrait retourner toutes les réservations', async () => {
      const mockReservations = [
        {
          idreservation: 1,
          numeroreservation: 'RES001',
          datereservation: new Date(),
          statut: 'Confirmée',
        },
        {
          idreservation: 2,
          numeroreservation: 'RES002',
          datereservation: new Date(),
          statut: 'Confirmée',
        },
      ];

      mockReservationController.getReservations.mockImplementation((req, res) => {
        res.json(mockReservations);
      });

      const response = await request(app)
        .get('/reservations')
        .expect(200);

      // Vérifier la structure sans se soucier du format exact des dates
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        idreservation: 1,
        numeroreservation: 'RES001',
        statut: 'Confirmée',
      });
      expect(response.body[1]).toMatchObject({
        idreservation: 2,
        numeroreservation: 'RES002',
        statut: 'Confirmée',
      });
      expect(mockReservationController.getReservations).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de base de données', async () => {
      mockReservationController.getReservations.mockImplementation((req, res) => {
        res.status(500).json({ error: 'Erreur de base de données' });
      });

      await request(app)
        .get('/reservations')
        .expect(500);
    });
  });

  describe('GET /reservations/:id', () => {
    it('devrait retourner une réservation spécifique', async () => {
      const mockReservation = {
        idreservation: 1,
        numeroreservation: 'RES001',
        datereservation: new Date(),
        statut: 'Confirmée',
      };

      mockReservationController.getReservationById.mockImplementation((req, res) => {
        res.json(mockReservation);
      });

      const response = await request(app)
        .get('/reservations/1')
        .expect(200);

      // Vérifier la structure sans se soucier du format exact des dates
      expect(response.body).toMatchObject({
        idreservation: 1,
        numeroreservation: 'RES001',
        statut: 'Confirmée',
      });
      expect(mockReservationController.getReservationById).toHaveBeenCalled();
    });

    it('devrait retourner 404 pour une réservation inexistante', async () => {
      mockReservationController.getReservationById.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Réservation non trouvée' });
      });

      await request(app)
        .get('/reservations/999')
        .expect(404);
    });
  });

  describe('POST /reservations', () => {
    it('devrait créer une nouvelle réservation', async () => {
      const reservationData = {
        datereservation: new Date(),
        daterdv: new Date('2024-01-15'),
        dateretour: new Date('2024-01-20'),
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
      };

      const createdReservation = {
        idreservation: 1,
        numeroreservation: 'RES001',
        ...reservationData,
      };

      mockReservationController.createReservation.mockImplementation((req, res) => {
        res.status(201).json(createdReservation);
      });

      const response = await request(app)
        .post('/reservations')
        .send(reservationData)
        .expect(201);

      // Vérifier la structure sans se soucier du format exact des dates
      expect(response.body).toMatchObject({
        idreservation: 1,
        numeroreservation: 'RES001',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
      });
      expect(mockReservationController.createReservation).toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de validation', async () => {
      mockReservationController.createReservation.mockImplementation((req, res) => {
        res.status(400).json({ error: 'Données invalides' });
      });

      await request(app)
        .post('/reservations')
        .send({})
        .expect(400);
    });
  });

  describe('PUT /reservations/:id', () => {
    it('devrait mettre à jour une réservation existante', async () => {
      const updateData = { statut: 'Confirmée' };
      const updatedReservation = { idreservation: 1, ...updateData };

      mockReservationController.updateReservation.mockImplementation((req, res) => {
        res.json(updatedReservation);
      });

      const response = await request(app)
        .put('/reservations/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(updatedReservation);
      expect(mockReservationController.updateReservation).toHaveBeenCalled();
    });

    it('devrait retourner 404 pour une réservation inexistante', async () => {
      mockReservationController.updateReservation.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Réservation non trouvée' });
      });

      await request(app)
        .put('/reservations/999')
        .send({ statut: 'Confirmée' })
        .expect(404);
    });
  });

  describe('DELETE /reservations/:id', () => {
    it('devrait supprimer une réservation existante', async () => {
      mockReservationController.deleteReservation.mockImplementation((req, res) => {
        res.status(204).end();
      });

      await request(app)
        .delete('/reservations/1')
        .expect(204);

      expect(mockReservationController.deleteReservation).toHaveBeenCalled();
    });

    it('devrait retourner 404 pour une réservation inexistante', async () => {
      mockReservationController.deleteReservation.mockImplementation((req, res) => {
        res.status(404).json({ error: 'Réservation non trouvée' });
      });

      await request(app)
        .delete('/reservations/999')
        .expect(404);
    });
  });

  describe('POST /reservations/disponibilites', () => {
    it('devrait retourner les véhicules disponibles', async () => {
      const requestData = {
        idsvehicules: [1, 2, 3],
        datedebut: '2024-01-15',
        datefin: '2024-01-20',
      };

      const responseData = {
        disponibles: [2, 3], // Véhicules 2 et 3 sont disponibles
      };

      mockReservationController.getDisponibilites.mockImplementation((req, res) => {
        res.json(responseData);
      });

      const response = await request(app)
        .post('/reservations/disponibilites')
        .send(requestData)
        .expect(200);

      expect(response.body).toEqual(responseData);
      expect(mockReservationController.getDisponibilites).toHaveBeenCalled();
    });

    it('devrait retourner 400 pour des paramètres manquants', async () => {
      mockReservationController.getDisponibilites.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Paramètres manquants' });
      });

      await request(app)
        .post('/reservations/disponibilites')
        .send({})
        .expect(400);
    });
  });

  describe('GET /reservations/recent', () => {
    it('devrait retourner les 5 dernières réservations', async () => {
      const mockRecentReservations = [
        {
          idreservation: 1,
          numeroreservation: 'RES001',
          datereservation: new Date(),
          Client: { nom: 'Dupont', prenom: 'Jean' },
          Vehicule: { marque: 'Renault', modele: 'Clio' },
        },
        {
          idreservation: 2,
          numeroreservation: 'RES002',
          datereservation: new Date(),
          Client: { nom: 'Martin', prenom: 'Marie' },
          Vehicule: { marque: 'Peugeot', modele: '208' },
        },
      ];

      mockReservationController.getRecentReservations.mockImplementation((req, res) => {
        res.json(mockRecentReservations);
      });

      const response = await request(app)
        .get('/reservations/recent')
        .expect(200);

      // Vérifier la structure sans se soucier du format exact des dates
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        idreservation: 1,
        numeroreservation: 'RES001',
        Client: { nom: 'Dupont', prenom: 'Jean' },
        Vehicule: { marque: 'Renault', modele: 'Clio' },
      });
      expect(response.body[1]).toMatchObject({
        idreservation: 2,
        numeroreservation: 'RES002',
        Client: { nom: 'Martin', prenom: 'Marie' },
        Vehicule: { marque: 'Peugeot', modele: '208' },
      });
      expect(mockReservationController.getRecentReservations).toHaveBeenCalled();
    });
  });

  describe('GET /reservations/my-bookings', () => {
    it('devrait retourner les réservations de l\'utilisateur connecté', async () => {
      const mockUserReservations = [
        {
          idreservation: 1,
          numeroreservation: 'RES001',
          statut: 'Confirmée',
        },
      ];

      mockReservationController.getMyReservations.mockImplementation((req, res) => {
        res.json(mockUserReservations);
      });

      const response = await request(app)
        .get('/reservations/my-bookings')
        .expect(200);

      expect(response.body).toEqual(mockUserReservations);
      expect(mockReservationController.getMyReservations).toHaveBeenCalled();
    });
  });
}); 