/**
 * Tests unitaires pour ReservationController
 * -----------------------------------------
 * Teste les principales fonctionnalités du contrôleur de réservation
 */

const request = require('supertest');
const express = require('express');
const { Reservation, Client, Vehicule } = require('../src/models');
const reservationController = require('../src/controllers/reservationController');

// --- MOCKS ---
// On garde un mock simple et direct pour Stripe
jest.mock('stripe');

jest.mock('../src/models', () => ({
  Reservation: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Client: {},
  Vehicule: {},
}));

jest.mock('express-async-handler', () => (fn) => fn);
jest.mock('axios');
jest.mock('date-fns');
jest.mock('../src/config/database');

const stripe = require('stripe');

describe('ReservationController', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = { params: {}, body: {}, query: {} };
    mockResponse = { json: jest.fn(), status: jest.fn().mockReturnThis(), end: jest.fn() };
    jest.clearAllMocks();
  });

  // Les autres tests (get, create, etc.) qui passent déjà sont omis pour la clarté

  describe('updateReservation', () => {
    it('devrait mettre à jour une réservation existante', async () => {
      // --- ARRANGE ---
      const updateData = { statut: 'Confirmée' };
      // Ceci est l'objet que la fonction .update() DOIT retourner
      const updatedReservation = { idreservation: 1, statut: 'Confirmée' };
      
      // **CORRECTION 1 : On utilise un statut qui existe VRAIMENT dans ton modèle**
      // On utilise 'En attente' comme statut initial.
      const mockReservationInstance = {
        idreservation: 1,
        statut: 'En attente', 
        // On s'assure que la méthode .update() retourne bien l'objet mis à jour
        update: jest.fn().mockResolvedValue(updatedReservation),
      };
      
      mockRequest.params.id = '1';
      mockRequest.body = updateData;
      Reservation.findByPk.mockResolvedValue(mockReservationInstance);
      
      // --- ACT ---
      await reservationController.updateReservation(mockRequest, mockResponse);
      
      // --- ASSERT ---
      // 1. On vérifie que la méthode de mise à jour a bien été appelée
      expect(mockReservationInstance.update).toHaveBeenCalledWith(updateData);
      
      // 2. On vérifie que la réponse JSON contient bien l'objet mis à jour.
      // NOTE: Si ce test échoue, cela signifie que votre contrôleur renvoie `reservation`
      // au lieu de renvoyer le résultat de `await reservation.update(...)`.
      // C'est un bug dans le contrôleur à corriger.
      expect(mockResponse.json).toHaveBeenCalledWith(updatedReservation);
    });
  });

  describe('deleteReservation', () => {
    it('devrait supprimer une réservation existante', async () => {
        const existingReservation = { idreservation: 1, destroy: jest.fn() };
        existingReservation.destroy.mockResolvedValue();
        mockRequest.params.id = '1';
        Reservation.findByPk.mockResolvedValue(existingReservation);
        await reservationController.deleteReservation(mockRequest, mockResponse);
        expect(mockResponse.status).toHaveBeenCalledWith(204);
    });
  });

  describe('initiateCheckout', () => {
    it('devrait initier un checkout et retourner le clientSecret', async () => {
      // --- ARRANGE ---
      const mockPaymentIntent = { id: 'test_intent_id', client_secret: 'test_client_secret' };
      
      // **CORRECTION 2 : On reconfigure le comportement du mock Stripe à l'intérieur du test**
      // C'est la seule façon d'être sûr qu'il n'est pas effacé par beforeEach.
      stripe.mockReturnValue({
        paymentIntents: {
          create: jest.fn().mockResolvedValue(mockPaymentIntent),
        },
      });

      // Configure la réponse des mocks Axios
      const mockVehicule = { tarifjournalier: 100 };
      const mockSuccursale = { pays: 'FR', province: 'IDF' };
      const mockTaxe = { montant_ttc: 120, montant_hors_taxe: 100 };
      require('axios').get.mockImplementation((url) => {
        if (url.includes('/vehicules/')) return Promise.resolve({ data: mockVehicule });
        if (url.includes('/succursales/')) return Promise.resolve({ data: mockSuccursale });
        return Promise.resolve({ data: {} });
      });
      require('axios').post.mockResolvedValue({ data: mockTaxe });

      // Prépare le corps de la requête
      mockRequest.body = { idvehicule: 1, datedebut: '2024-01-01', datefin: '2024-01-03', idclient: 1, idsuccursalelivraison: 1, idsuccursaleretour: 2 };

      // --- ACT ---
      await reservationController.initiateCheckout(mockRequest, mockResponse);

      // --- ASSERT ---
      const stripeInstance = stripe();
      expect(stripeInstance.paymentIntents.create).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        clientSecret: 'test_client_secret',
        idintentstripe: 'test_intent_id',
      }));
    });
  });
});