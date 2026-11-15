const request = require('supertest');
const app = require('../src/app');
const config = require('../src/config/env');
const renderService = require('../src/services/renderService');
const projectStorage = require('../src/services/projectStorage');

describe('Project Import & Render API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return projects list with renderApiConfigured flag', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('projects');
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body).toHaveProperty('renderApiConfigured');
    });
  });

  describe('POST /api/projects/import', () => {
    it('should reject requests with missing repository URL', async () => {
      const res = await request(app)
        .post('/api/projects/import')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('repository URL is required');
    });

    it('should reject requests with non-GitHub URL format', async () => {
      const res = await request(app)
        .post('/api/projects/import')
        .send({ repoUrl: 'https://example.com/not-github' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid GitHub repository URL');
    });

    it('should return 503 when RENDER_API_KEY is not configured', async () => {
      const origKey = config.renderApiKey;
      const origFlag = config.isConfigured.render;
      config.renderApiKey = '';
      config.isConfigured.render = false;

      try {
        const res = await request(app)
          .post('/api/projects/import')
          .send({ repoUrl: 'https://github.com/lunadadxx-del/html-live' });

        expect(res.statusCode).toBe(503);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Render API key is not configured');
      } finally {
        config.renderApiKey = origKey;
        config.isConfigured.render = origFlag;
      }
    });

    it('should create and store project when Render API succeeds', async () => {
      const origKey = config.renderApiKey;
      const origFlag = config.isConfigured.render;
      config.renderApiKey = 'rnd_mock_test_key_12345';
      config.isConfigured.render = true;

      const mockCreate = jest.spyOn(renderService, 'createStaticSite').mockResolvedValue({
        id: 'srv-test-123',
        name: 'devpulse-html',
        type: 'static_site',
        repo: 'https://github.com/lunadadxx-del/html-live',
        branch: 'main',
        autoDeploy: true,
        liveUrl: 'https://devpulse-html.onrender.com',
        publishPath: '.',
        buildCommand: '',
        createdAt: '2026-11-15T12:00:00Z',
        updatedAt: '2026-11-15T12:00:00Z'
      });

      try {
        const res = await request(app)
          .post('/api/projects/import')
          .send({
            repoUrl: 'https://github.com/lunadadxx-del/html-live',
            projectName: 'DevPulse Test',
            branch: 'main',
            publishDir: '.'
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.project).toBeDefined();
        expect(res.body.project.id).toBe('proj_render_srv-test-123');
        expect(res.body.project.liveUrl).toBe('https://devpulse-html.onrender.com');
        expect(res.body.project.deploymentType).toBe('render_api');

        // Verify it exists in GET /api/projects
        const listRes = await request(app).get('/api/projects');
        const found = listRes.body.projects.find((p) => p.id === 'proj_render_srv-test-123');
        expect(found).toBeDefined();

        // Clean up test project
        projectStorage.deleteProject('proj_render_srv-test-123');
      } finally {
        mockCreate.mockRestore();
        config.renderApiKey = origKey;
        config.isConfigured.render = origFlag;
      }
    });
  });

  describe('GET /api/projects/:id/status', () => {
    it('should return 404 for nonexistent project', async () => {
      const res = await request(app).get('/api/projects/proj_non_existent/status');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return status for built-in project', async () => {
      const res = await request(app).get('/api/projects/proj_demo_portfolio/status');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.deploymentType).toBe('github_actions');
    });
  });
});
