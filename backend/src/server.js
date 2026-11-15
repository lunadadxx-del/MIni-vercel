const app = require('./app');
const config = require('./config/env');

const PORT = config.port;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`
=====================================================
  DeployFlow — Mini Vercel Backend Service
=====================================================
  Status:      RUNNING
  Host:        ${HOST}
  Port:        ${PORT}
  Environment: ${config.nodeEnv}
  Target Repo: ${config.github.owner ? `${config.github.owner}/${config.github.repo}` : 'Not configured'}
  Live App:    ${config.liveAppUrl || 'Not configured'}
  Admin Auth:  ${config.adminSecret ? 'Configured (Active)' : 'Disabled / Missing'}
=====================================================
  Health:      http://localhost:${PORT}/api/health
  API Base:    http://localhost:${PORT}/api
=====================================================
  `);
});

// Graceful shutdown handling
const handleShutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}. Shutting down DeployFlow gracefully...`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('DeployFlow HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
