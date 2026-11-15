const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config/env');

describe('Deploy Controller & Authentication', () => {
  describe('POST /api/deploy', () => {
    it('should reject unauthenticated request when ADMIN_SECRET is set', async () => {
      // Temporarily ensure admin secret is configured for test
      const originalSecret = config.adminSecret;
      config.adminSecret = 'test_secret_123';

      try {
        const res = await request(app)
          .post('/api/deploy')
          .send({ branch: 'main' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
      } finally {
        config.adminSecret = originalSecret;
      }
    });

    it('should reject invalid admin secret with 401', async () => {
      const originalSecret = config.adminSecret;
      config.adminSecret = 'test_secret_123';

      try {
        const res = await request(app)
          .post('/api/deploy')
          .set('x-admin-secret', 'wrong_secret')
          .send({ branch: 'main' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Invalid admin secret');
      } finally {
        config.adminSecret = originalSecret;
      }
    });

    it('should return 503 if ADMIN_SECRET is not configured on server', async () => {
      const originalSecret = config.adminSecret;
      config.adminSecret = '';

      try {
        const res = await request(app)
          .post('/api/deploy')
          .set('x-admin-secret', 'any_token')
          .send({ branch: 'main' });

        expect(res.statusCode).toEqual(503);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('ADMIN_SECRET is not configured');
      } finally {
        config.adminSecret = originalSecret;
      }
    });
  });

  describe('GET /api/deployments/:runId validation', () => {
    it('should reject invalid non-numeric runId', async () => {
      const res = await request(app).get('/api/deployments/invalid-run-id');
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid runId');
    });
  });

  describe('GET /api/deployments', () => {
    it('should return 200 with unconfigured status when GITHUB_OWNER is not set', async () => {
      const originalOwner = config.github.owner;
      config.github.owner = '';
      config.isConfigured.github = false;

      try {
        const res = await request(app).get('/api/deployments');
        expect(res.statusCode).toEqual(200);
        expect(res.body.configured).toBe(false);
        expect(Array.isArray(res.body.deployments)).toBe(true);
      } finally {
        config.github.owner = originalOwner;
        config.isConfigured.github = Boolean(config.github.owner && config.github.repo);
      }
    });
  });
});
