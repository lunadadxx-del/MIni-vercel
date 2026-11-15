const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  github: {
    owner: process.env.GITHUB_OWNER ? process.env.GITHUB_OWNER.trim() : '',
    repo: process.env.GITHUB_REPO ? process.env.GITHUB_REPO.trim() : '',
    workflowId: process.env.GITHUB_WORKFLOW_ID ? process.env.GITHUB_WORKFLOW_ID.trim() : 'deploy.yml',
    token: process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN.trim() : '',
    demoWorkflowId: process.env.DEMO_WORKFLOW_ID ? process.env.DEMO_WORKFLOW_ID.trim() : 'demo-portfolio-deploy.yml',
  },
  adminSecret: process.env.ADMIN_SECRET ? process.env.ADMIN_SECRET.trim() : '',
  renderApiKey: process.env.RENDER_API_KEY ? process.env.RENDER_API_KEY.trim() : '',
  renderOwnerId: process.env.RENDER_OWNER_ID ? process.env.RENDER_OWNER_ID.trim() : '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  liveAppUrl: process.env.LIVE_APP_URL || '',
  demoPortfolioLiveUrl: process.env.DEMO_PORTFOLIO_LIVE_URL || 'https://mini-vercel-demo-portfolio.onrender.com',
  isConfigured: {
    github: Boolean(process.env.GITHUB_OWNER && process.env.GITHUB_REPO),
    githubToken: Boolean(process.env.GITHUB_TOKEN),
    adminSecret: Boolean(process.env.ADMIN_SECRET),
    liveApp: Boolean(process.env.LIVE_APP_URL),
    render: Boolean(process.env.RENDER_API_KEY)
  }
};

module.exports = config;
