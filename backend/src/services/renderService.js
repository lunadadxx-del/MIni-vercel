const axios = require('axios');
const config = require('../config/env');

class RenderService {
  constructor() {
    this.baseURL = 'https://api.render.com/v1';
    this.cachedOwnerId = null;
  }

  /**
   * Check if RENDER_API_KEY is configured
   */
  checkConfiguration() {
    if (!config.renderApiKey) {
      const error = new Error('Render API is not configured. Please define RENDER_API_KEY in backend environment variables.');
      error.status = 503;
      error.isConfigError = true;
      throw error;
    }
  }

  /**
   * Get authenticated Axios client
   */
  getClient() {
    this.checkConfiguration();
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${config.renderApiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'DeployFlow-MiniVercel/1.0.0'
      },
      timeout: 15000
    });
  }

  /**
   * Sanitize a project name for Render service naming rules:
   * 3-32 characters, lowercase alphanumeric and hyphens only, no leading/trailing hyphens.
   */
  sanitizeServiceName(name) {
    if (!name || typeof name !== 'string') {
      name = 'static-site';
    }
    let sanitized = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (sanitized.length < 3) {
      sanitized = `${sanitized}-site`;
    }
    if (sanitized.length > 28) {
      sanitized = sanitized.substring(0, 28).replace(/-+$/, '');
    }
    // Append a 4-char random hex to prevent naming collisions on Render's global domain
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${sanitized}-${suffix}`;
  }

  /**
   * Fetch all owners/workspaces accessible by the API key
   */
  async getOwners() {
    const client = this.getClient();
    try {
      const response = await client.get('/owners');
      return response.data || [];
    } catch (error) {
      this._handleError('Failed to fetch Render owners/workspace', error);
    }
  }

  /**
   * Get or resolve ownerId automatically
   */
  async getOwnerId() {
    if (config.renderOwnerId) {
      return config.renderOwnerId;
    }
    if (this.cachedOwnerId) {
      return this.cachedOwnerId;
    }

    const owners = await this.getOwners();
    if (!owners || owners.length === 0) {
      const error = new Error('No Render workspace or owner found for the configured RENDER_API_KEY.');
      error.status = 404;
      throw error;
    }

    // Owner object structure: { owner: { id, name, email, type } }
    const firstOwner = owners[0].owner || owners[0];
    this.cachedOwnerId = firstOwner.id;
    return this.cachedOwnerId;
  }

  /**
   * Create a new Static Site service on Render via REST API
   *
   * @param {Object} options
   * @param {string} options.name - Service name
   * @param {string} options.repoUrl - Public GitHub repository URL
   * @param {string} [options.branch='main'] - Git branch to deploy
   * @param {string} [options.publishPath='.'] - Path to publish directory
   * @param {string} [options.buildCommand=''] - Optional build command
   */
  async createStaticSite({ name, repoUrl, branch = 'main', publishPath = '.', buildCommand = '' }) {
    const client = this.getClient();
    const ownerId = await this.getOwnerId();
    const serviceName = this.sanitizeServiceName(name);

    // Clean up repoUrl (ensure standard https://github.com/owner/repo)
    let cleanRepoUrl = repoUrl.trim();
    if (!cleanRepoUrl.startsWith('http://') && !cleanRepoUrl.startsWith('https://')) {
      cleanRepoUrl = `https://${cleanRepoUrl}`;
    }
    cleanRepoUrl = cleanRepoUrl.replace(/\.git$/, '');

    const payload = {
      type: 'static_site',
      name: serviceName,
      ownerId,
      repo: cleanRepoUrl,
      branch: branch || 'main',
      autoDeploy: 'yes',
      serviceDetails: {
        buildCommand: buildCommand || '',
        publishPath: publishPath || '.'
      }
    };

    try {
      const response = await client.post('/services', payload);
      const raw = response.data;
      const data = (raw && raw.service) ? raw.service : raw;

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        repo: data.repo,
        branch: data.branch,
        autoDeploy: data.autoDeploy === 'yes',
        liveUrl: data.serviceDetails?.url || `https://${data.name}.onrender.com`,
        publishPath: data.serviceDetails?.publishPath || '.',
        buildCommand: data.serviceDetails?.buildCommand || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      this._handleError(`Failed to create Render static site for repository "${cleanRepoUrl}"`, error);
    }
  }

  /**
   * Get service details by serviceId
   */
  async getService(serviceId) {
    const client = this.getClient();
    try {
      const response = await client.get(`/services/${serviceId}`);
      const raw = response.data;
      const data = (raw && raw.service) ? raw.service : raw;

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        repo: data.repo,
        branch: data.branch,
        autoDeploy: data.autoDeploy === 'yes',
        liveUrl: data.serviceDetails?.url || `https://${data.name}.onrender.com`,
        publishPath: data.serviceDetails?.publishPath || '.',
        buildCommand: data.serviceDetails?.buildCommand || '',
        suspended: data.suspended,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } catch (error) {
      this._handleError(`Failed to retrieve Render service "${serviceId}"`, error);
    }
  }

  /**
   * List recent deployments for a service
   */
  async getDeployments(serviceId, limit = 10) {
    const client = this.getClient();
    try {
      const response = await client.get(`/services/${serviceId}/deploys`, {
        params: { limit }
      });

      const rawData = response.data;
      const rawDeploys = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
      return rawDeploys.map((item) => {
        const d = item.deploy || item;
        return {
          id: d.id,
          status: d.status, // created, build_in_progress, live, build_failed, canceled, deactivated
          trigger: d.trigger,
          commit: d.commit ? {
            id: d.commit.id,
            shortId: d.commit.id ? d.commit.id.substring(0, 7) : '',
            message: d.commit.message,
            createdAt: d.commit.createdAt
          } : null,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          finishedAt: d.finishedAt
        };
      });
    } catch (error) {
      this._handleError(`Failed to retrieve deployments for Render service "${serviceId}"`, error);
    }
  }

  /**
   * Get the latest deploy for a service
   */
  async getLatestDeploy(serviceId) {
    const deploys = await this.getDeployments(serviceId, 1);
    return deploys && deploys.length > 0 ? deploys[0] : null;
  }

  /**
   * Trigger a manual deployment for a service
   */
  async triggerDeploy(serviceId, clearCache = 'do_not_clear') {
    const client = this.getClient();
    try {
      const response = await client.post(`/services/${serviceId}/deploys`, {
        clearCache
      });
      const data = response.data;
      return {
        success: true,
        deploy: {
          id: data.id,
          status: data.status,
          createdAt: data.createdAt
        }
      };
    } catch (error) {
      this._handleError(`Failed to trigger deployment for Render service "${serviceId}"`, error);
    }
  }

  /**
   * Normalize and throw informative errors
   */
  _handleError(prefix, error) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      const apiMessage = responseData?.message || responseData?.error || JSON.stringify(responseData);
      const err = new Error(`${prefix}: [Render API ${status}] ${apiMessage}`);
      err.status = status;
      err.details = responseData;
      throw err;
    }
    const err = new Error(`${prefix}: ${error.message}`);
    err.status = 500;
    throw err;
  }
}

module.exports = new RenderService();
