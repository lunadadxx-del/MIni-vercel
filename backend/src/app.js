const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { requireAdminSecret } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const healthController = require('./controllers/healthController');
const projectController = require('./controllers/projectController');
const deployController = require('./controllers/deployController');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

if (config.frontendUrl) {
  // Support comma-separated origins if provided
  config.frontendUrl.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server tests)
      if (!origin) return callback(null, true);

      // In production or dev, allow if origin matches allowedOrigins or is a Render preview url
      if (
        allowedOrigins.includes(origin) ||
        config.nodeEnv !== 'production' ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }

      callback(new Error(`CORS origin policy blocked request from ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
  })
);

// Security & Parsing
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));

// Request logger in dev
if (config.nodeEnv !== 'test') {
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ============================================================================
// API Routes
// ============================================================================

// Health check
app.get('/api/health', healthController.getHealth);

// Projects and Commits
app.get('/api/projects', projectController.getProjects);
app.get('/api/commits', projectController.getCommits);

// Deployments and Workflow Runs
app.get('/api/deployments', deployController.getDeployments);
app.get('/api/deployments/:runId', deployController.getDeploymentById);
app.get('/api/deployments/:runId/jobs', deployController.getDeploymentJobs);
app.get('/api/jobs/:jobId/logs', deployController.getJobLogs);

// Trigger Deployment (Protected)
app.post('/api/deploy', requireAdminSecret, deployController.triggerDeploy);

// 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
