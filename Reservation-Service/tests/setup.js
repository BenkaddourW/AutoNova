/**
 * Configuration globale pour les tests
 */

// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = 5432;
process.env.DB_NAME = 'autonova_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
process.env.GATEWAY_URL = 'http://localhost:3000';

// Mock Stripe globally
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        client_secret: 'test_client_secret',
        id: 'test_intent_id'
      }),
      retrieve: jest.fn().mockResolvedValue({
        status: 'succeeded',
        metadata: {
          idclient: '1',
          idvehicule: '1',
          idsuccursalelivraison: '1',
          idsuccursaleretour: '2'
        },
        payment_method_types: ['card'],
        currency: 'cad'
      })
    }
  }));
});

// Configuration globale de Jest
jest.setTimeout(10000);

// Mock global pour console.log pendant les tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}; 