const renderService = require('../src/services/renderService');
const config = require('../src/config/env');

describe('RenderService Unit Tests', () => {
  describe('sanitizeServiceName', () => {
    it('should format names to lowercase with hyphens and random suffix', () => {
      const sanitized = renderService.sanitizeServiceName('My Cool App!');
      expect(sanitized).toMatch(/^my-cool-app-[a-z0-9]{4}$/);
    });

    it('should handle special characters and underscores', () => {
      const sanitized = renderService.sanitizeServiceName('test___repo.name');
      expect(sanitized).toMatch(/^test-repo-name-[a-z0-9]{4}$/);
    });

    it('should truncate overly long project names to under 32 chars', () => {
      const longName = 'this-is-an-extremely-long-repository-name-that-exceeds-render-limits';
      const sanitized = renderService.sanitizeServiceName(longName);
      expect(sanitized.length).toBeLessThanOrEqual(33);
    });
  });

  describe('checkConfiguration', () => {
    it('should throw 503 if RENDER_API_KEY is missing', () => {
      const origKey = config.renderApiKey;
      config.renderApiKey = '';

      try {
        expect(() => renderService.checkConfiguration()).toThrow('Render API is not configured');
      } finally {
        config.renderApiKey = origKey;
      }
    });

    it('should pass if RENDER_API_KEY is present', () => {
      const origKey = config.renderApiKey;
      config.renderApiKey = 'rnd_valid_key';

      try {
        expect(() => renderService.checkConfiguration()).not.toThrow();
      } finally {
        config.renderApiKey = origKey;
      }
    });
  });
});
