/**
 * Tests unitaires pour ReservationValidator
 * ----------------------------------------
 * Teste les règles de validation des réservations
 */

const { validationResult } = require('express-validator');
const { createReservationRules, updateReservationRules } = require('../src/validators/reservationValidator');

describe('ReservationValidator', () => {
  describe('createReservationRules', () => {
    it('devrait valider des données de réservation valides', async () => {
      const validData = {
        numeroreservation: 'RES001',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: validData };
      
      // Appliquer toutes les règles de validation
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait rejeter un numéro de réservation vide', async () => {
      const invalidData = {
        numeroreservation: '',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'numeroreservation',
          msg: 'Numéro requis',
        })
      );
    });

    it('devrait rejeter un numéro de réservation trop long', async () => {
      const invalidData = {
        numeroreservation: 'RES' + '0'.repeat(30), // Plus de 30 caractères
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'numeroreservation',
          msg: '30 caractères max',
        })
      );
    });

    it('devrait rejeter une date invalide', async () => {
      const invalidData = {
        numeroreservation: 'RES001',
        datereservation: 'date-invalide',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'datereservation',
          msg: 'Date réservation invalide',
        })
      );
    });

    it('devrait rejeter un montant négatif', async () => {
      const invalidData = {
        numeroreservation: 'RES001',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: -100.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'montanttotal',
          msg: 'Montant total négatif',
        })
      );
    });

    it('devrait rejeter un statut invalide', async () => {
      const invalidData = {
        numeroreservation: 'RES001',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'StatutInvalide',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'statut',
          msg: 'Statut invalide',
        })
      );
    });

    it('devrait accepter tous les statuts valides', async () => {
      const validStatuts = [ 'Confirmée', 'Terminée', 'Active', 'Annulée'];
      
      for (const statut of validStatuts) {
        const validData = {
          numeroreservation: 'RES001',
          datereservation: '2024-01-15T10:00:00Z',
          daterdv: '2024-01-20T10:00:00Z',
          dateretour: '2024-01-25T10:00:00Z',
          montanttotal: 500.00,
          taxes: 50.00,
          montantttc: 550.00,
          statut: statut,
          idclient: 1,
          idsuccursalelivraison: 1,
          idsuccursaleretour: 1,
          idvehicule: 1,
          idpaiement: 1,
        };

        const req = { body: validData };
        
        for (const rule of createReservationRules) {
          await rule(req, {}, () => {});
        }

        const errors = validationResult(req);
        expect(errors.isEmpty()).toBe(true);
      }
    });

    it('devrait rejeter un ID client invalide', async () => {
      const invalidData = {
        numeroreservation: 'RES001',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 0, // ID invalide (doit être >= 1)
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'idclient',
          msg: 'Client invalide',
        })
      );
    });

    it('devrait rejeter des champs non autorisés', async () => {
      const invalidData = {
        numeroreservation: 'RES001',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 500.00,
        taxes: 50.00,
        montantttc: 550.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
        champNonAutorise: 'valeur', // Champ non autorisé
      };

      const req = { body: invalidData };
      
      for (const rule of createReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          msg: 'Champs non autorisés: champNonAutorise',
        })
      );
    });
  });

  describe('updateReservationRules', () => {
    it('devrait permettre la mise à jour partielle avec des champs optionnels', async () => {
      const updateData = {
        statut: 'Confirmée', // Seul le statut est mis à jour
      };

      const req = { body: updateData };
      
      for (const rule of updateReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });

    it('devrait valider une mise à jour complète', async () => {
      const updateData = {
        numeroreservation: 'RES001-UPDATED',
        datereservation: '2024-01-15T10:00:00Z',
        daterdv: '2024-01-20T10:00:00Z',
        dateretour: '2024-01-25T10:00:00Z',
        montanttotal: 600.00,
        taxes: 60.00,
        montantttc: 660.00,
        statut: 'Confirmée',
        idclient: 1,
        idsuccursalelivraison: 1,
        idsuccursaleretour: 1,
        idvehicule: 1,
        idpaiement: 1,
      };

      const req = { body: updateData };
      
      for (const rule of updateReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(true);
    });
//
    it('devrait rejeter des données invalides même en mode mise à jour', async () => {
      const invalidUpdateData = {
        statut: 'StatutInvalide', // Statut invalide
        montanttotal: -100.00, // Montant négatif
      };

      const req = { body: invalidUpdateData };
      
      for (const rule of updateReservationRules) {
        await rule(req, {}, () => {});
      }

      const errors = validationResult(req);
      expect(errors.isEmpty()).toBe(false);
      expect(errors.array()).toHaveLength(2);
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'statut',
          msg: 'Statut invalide',
        })
      );
      expect(errors.array()).toContainEqual(
        expect.objectContaining({
          path: 'montanttotal',
          msg: 'Montant total négatif',
        })
      );
    });
  });
}); 