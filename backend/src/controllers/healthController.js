const config = require('../config/env');

const startTime = Date.now();

const getHealth = (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  res.status(200).json({
    status: 'ok',
    service: 'DeployFlow - Mini Vercel Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: config.nodeEnv,
    configuration: {
      githubRepository: config.isConfigured.github,
      githubTokenConfigured: config.isConfigured.githubToken,
      adminSecretConfigured: config.isConfigured.adminSecret,
      renderApiKeyConfigured: config.isConfigured.render,
      liveAppConfigured: config.isConfigured.liveApp,
      configuredTarget: config.isConfigured.github
        ? `${config.github.owner}/${config.github.repo}`
        : 'Not configured (set GITHUB_OWNER & GITHUB_REPO)'
    }
  });
};

module.exports = {
  getHealth
};
