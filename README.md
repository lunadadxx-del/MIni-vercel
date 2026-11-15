# DeployFlow — Mini Vercel

> **Automated Web Application Deployment Platform Using Docker and GitHub Actions**  
> *A full-stack DevOps demonstration platform inspired by Vercel.*

---

## 1. Project Overview

**DeployFlow (Mini Vercel)** is a full-stack DevOps project built to demonstrate automated CI/CD pipelines, containerization, and cloud deployment orchestration. Inspired by developer platforms like Vercel, DeployFlow provides an interactive, dark-themed dashboard where developers can:

- Monitor a preconfigured GitHub repository and branch telemetry.
- Trigger GitHub Actions CI/CD workflows on-demand via authenticated `workflow_dispatch`.
- Track real-time workflow statuses (`queued`, `in_progress`, `success`, `failure`, `cancelled`).
- Inspect individual pipeline jobs, execution times, and step-by-step build logs.
- Access live cloud-deployed applications hosted on Render.

This project uses **real Docker containerization**, **real GitHub Actions automation**, and **Render cloud infrastructure**.

---

## 2. Architecture & Pipeline Workflow

```
+-----------------------------------------------------------------------------------------+
|                                    DEVELOPER WORKFLOW                                   |
+-----------------------------------------------------------------------------------------+
       |                                                               |
  [Git Push]                                                  [Click "Deploy" in UI]
       |                                                               |
       v                                                               v
  GitHub Repo (main)                                           Backend API (/api/deploy)
       |                                                               | (x-admin-secret)
       +-----------------------+---------------------------------------+
                               |
                               v (Trigger: push / workflow_dispatch)
+-----------------------------------------------------------------------------------------+
|                                 GITHUB ACTIONS CI/CD                                    |
|                              (.github/workflows/deploy.yml)                             |
+-----------------------------------------------------------------------------------------+
|  1. Checkout code (actions/checkout@v4)                                                 |
|  2. Setup Node.js LTS (actions/setup-node@v4)                                           |
|  3. Install frontend dependencies (npm ci)                                              |
|  4. Compile & build frontend (npm run build)                                            |
|  5. Install backend dependencies (npm ci)                                               |
|  6. Run backend automated tests (Jest / Supertest)                                      |
|  7. Setup Docker Buildx (docker/setup-buildx-action@v3)                                  |
|  8. Build backend Docker image (docker/build-push-action@v5)                             |
|  9. Invoke optional Render deploy hook webhook (curl -X POST $RENDER_DEPLOY_HOOK_URL)   |
| 10. Generate Step Summary markdown report                                               |
+-----------------------------------------------------------------------------------------+
                               |
                               v
+-----------------------------------------------------------------------------------------+
|                                 RENDER CLOUD DEPLOYMENT                                 |
+-----------------------------------------------------------------------------------------+
|  [Render Static Site]                                 [Render Web Service]              |
|  - Root: frontend/                                    - Runtime: Docker                 |
|  - Build: npm ci && npm run build                     - Root: backend/                  |
|  - Publish: dist/                                     - Health: /api/health             |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend Dashboard** | React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Fetch API |
| **Backend API** | Node.js LTS, Express, Axios, GitHub REST API, dotenv, cors |
| **Testing** | Jest, Supertest |
| **Containerization** | Docker, Alpine Linux (`node:20-alpine`), dumb-init |
| **CI/CD Automation** | GitHub Actions (`deploy.yml`, Docker Buildx) |
| **Cloud Hosting** | Render Static Site (Frontend) + Render Docker Web Service (Backend) |

---

## 4. Repository Structure

```
Mini Vercel/
├── .github/
│   └── workflows/
│       ├── deploy.yml                   # DeployFlow Platform CI/CD Pipeline
│       └── demo-portfolio-deploy.yml    # Demo Portfolio Dedicated CI/CD Pipeline
├── demo-portfolio/                      # Demo Application deployed via DeployFlow
│   ├── src/                             # React, Vite & Tailwind portfolio
│   ├── index.html
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js          # Centralized configuration & environment loader
│   │   ├── controllers/
│   │   │   ├── healthController.js   # GET /api/health
│   │   │   ├── projectController.js  # GET /api/projects, GET /api/commits
│   │   │   └── deployController.js   # GET /api/deployments, POST /api/deploy
│   │   ├── middleware/
│   │   │   ├── auth.js         # Admin secret authentication middleware
│   │   │   └── errorHandler.js # Error parsing & GitHub rate limit handling
│   │   ├── services/
│   │   │   └── githubService.js # GitHub REST API integration
│   │   ├── app.js              # Express app setup & route registration
│   │   └── server.js           # Production server binding to 0.0.0.0:PORT
│   ├── tests/
│   │   ├── health.test.js      # Health endpoint test suite
│   │   └── deploy.test.js      # Auth & validation test suite
│   ├── .dockerignore           # Excludes node_modules, .env, and test files
│   ├── .env.example            # Backend env documentation template
│   ├── Dockerfile              # Multi-stage Node.js 20 Alpine container
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Layout, Navbar, Sidebar, StatusBadge, Modal
│   │   ├── pages/              # Dashboard, Projects, Deployments, Logs, Settings
│   │   ├── services/api.js     # Frontend Fetch API client
│   │   ├── App.jsx             # React Router routing & polling sync
│   │   ├── main.jsx            # React root
│   │   └── index.css           # Tailwind directives & terminal styling
│   ├── public/
│   │   └── favicon.svg         # Vercel-style geometric triangle favicon
│   ├── .env.example            # Frontend env documentation template
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js          # Vite configuration with /api reverse proxy
│   └── package.json
├── .gitignore
├── .env.example                # Root environment template
└── README.md
```

---

## 5. Local Setup & Running Locally

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- Git
- Docker (optional for local container testing)

### Step 1: Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mini-vercel.git
cd mini-vercel
```

### Step 2: Configure Environment Variables
Copy `.env.example` in `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Fill in the parameters:
```env
PORT=5000
NODE_ENV=development
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repo_name
GITHUB_WORKFLOW_ID=deploy.yml
GITHUB_TOKEN=ghp_your_personal_access_token
ADMIN_SECRET=your_super_secret_admin_key
FRONTEND_URL=http://localhost:5173
LIVE_APP_URL=https://your-frontend.onrender.com
```

### Step 3: Install Dependencies & Run Backend
```bash
cd backend
npm install
npm test
npm start
```
The backend starts on `http://localhost:5000`. Test the health check at `http://localhost:5000/api/health`.

### Step 4: Install Dependencies & Run Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`. The Vite dev server automatically proxies `/api/*` calls to the backend on port 5000.

---

## 6. Docker Containerization Instructions

The backend is packaged using a lightweight, secure Alpine Linux container (`node:20-alpine`) running under `dumb-init` and a non-root user (`node`).

### Build the Docker Image
```bash
cd backend
docker build -t deployflow-backend:latest .
```

### Run the Docker Container
```bash
docker run -d \
  --name deployflow-backend \
  -p 5000:5000 \
  -e PORT=5000 \
  -e GITHUB_OWNER="your_username" \
  -e GITHUB_REPO="your_repo" \
  -e GITHUB_TOKEN="ghp_your_token" \
  -e ADMIN_SECRET="your_admin_secret" \
  deployflow-backend:latest
```

### Verify Container Health
```bash
curl http://localhost:5000/api/health
```

### Stop and Remove Container
```bash
docker stop deployflow-backend
docker rm deployflow-backend
```

---

## 7. GitHub Actions CI/CD Pipeline

The workflow defined in `.github/workflows/deploy.yml` runs on:
1. Every `push` to the `main` branch.
2. Manual `workflow_dispatch` triggered from the DeployFlow dashboard.

### Workflow Stages:
1. **Checkout Code**: Uses `actions/checkout@v4` to pull the latest commit.
2. **Setup Node.js LTS**: Uses `actions/setup-node@v4` with Node 20.
3. **Frontend Build Check**: Runs `cd frontend && npm ci && npm run build` to verify React bundle compiles without errors.
4. **Backend Dependencies**: Runs `cd backend && npm ci`.
5. **Automated Unit & Integration Tests**: Runs `cd backend && npm test` to ensure API and authentication contracts are met.
6. **Docker Engine Setup**: Configures `docker/setup-buildx-action@v3`.
7. **Container Verification Build**: Builds the backend Docker image using `docker/build-push-action@v5` to guarantee production image buildability.
8. **Render Deployment Webhook (Optional)**: If `RENDER_DEPLOY_HOOK_URL` secret is configured, calls Render's webhook to start cloud deployment.
9. **Execution Summary**: Appends execution metadata directly into GitHub Actions step summary.

---

## 8. GitHub Personal Access Token Setup

To allow DeployFlow to monitor private repositories, fetch workflow telemetry without strict IP rate limits, and trigger `workflow_dispatch`, generate a GitHub Token:

1. Go to **GitHub Settings** -> **Developer Settings** -> **Personal Access Tokens**.
2. Select **Tokens (classic)** -> **Generate new token**.
3. Choose token expiration (e.g. 30 or 90 days).
4. Select the following scopes:
   - `repo` (Full control of private repositories; or `public_repo` for public projects)
   - `workflow` (Update GitHub Action workflows)
5. Copy the generated token (`ghp_...`).
6. Paste it into your backend `.env` file as `GITHUB_TOKEN`.
> **Security Note:** Never commit `GITHUB_TOKEN` to git. It is excluded by `.gitignore` and `.dockerignore`.

---

## 9. Render Deployment Instructions

### A. Deploying the Backend (Render Docker Web Service)
1. Log in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** as the Runtime environment.
5. Set:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Health Check Path**: `/api/health`
6. Add the Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `GITHUB_OWNER`: `your_github_username`
   - `GITHUB_REPO`: `your_repository_name`
   - `GITHUB_WORKFLOW_ID`: `deploy.yml`
   - `GITHUB_TOKEN`: `ghp_your_token`
   - `ADMIN_SECRET`: `your_secure_admin_password`
   - `FRONTEND_URL`: `https://your-frontend-app.onrender.com`
   - `LIVE_APP_URL`: `https://your-frontend-app.onrender.com`
7. Click **Create Web Service**. Note the deployed service URL (e.g., `https://deployflow-api.onrender.com`).

### B. Deploying the Frontend (Render Static Site)
1. Click **New +** -> **Static Site**.
2. Connect the same GitHub repository.
3. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
4. Add the Environment Variable:
   - `VITE_API_URL`: `https://deployflow-api.onrender.com` (Your Render backend URL)
5. Click **Create Static Site**.

---

## 10. College Demonstration Procedure

Follow this walkthrough during your project demonstration:

1. **Dashboard Overview**:
   - Open DeployFlow in your browser.
   - Point out the dark Vercel aesthetic, live system metrics (Configured projects, Successful/Failed runs, Latest execution time).
   - Show the backend connectivity indicator in the sidebar footer (`/api/health` check).

2. **Project Inspection**:
   - Navigate to the **Projects** tab.
   - Show the detected repository details, default branch (`main`), repository stats, and live application link.
   - Explain the single-repository architecture model and the security reasons why arbitrary external repositories cannot be triggered.

3. **Triggering a Deployment (CI/CD)**:
   - Click the **Deploy** button in the navigation header.
   - Enter the target branch (`main`).
   - Enter the `ADMIN_SECRET` key.
   - Click **Dispatch Workflow**.
   - Show the confirmation notification indicating the `workflow_dispatch` event was accepted by GitHub.

4. **Tracking Real-Time Runs**:
   - Navigate to **Deployments**.
   - Observe the new workflow run appearing at the top with status `queued` or `building` (in progress).
   - Click the external link to view the run live on GitHub Actions.

5. **Inspecting Build Logs**:
   - Open **Build Logs**.
   - Demonstrate the pipeline step breakdown:
     - 1. Checkout repository
     - 2. Set up Node.js
     - 3. Install frontend dependencies
     - 4. Build frontend
     - 5. Install backend dependencies
     - 6. Run backend automated tests
     - 7. Setup Docker Buildx
     - 8. Build backend Docker image
     - 9. Trigger Render deploy hook
     - 10. Summary report
   - Show the raw console stream viewer with search filtering and copy-to-clipboard capabilities.

6. **Settings & Security**:
   - Open **Settings**.
   - Show how environment parameters are displayed safely with sensitive secrets masked (`ghp_••••••••`).
   - Demonstrate session storage persistence for the admin key.

---

## 11. Security & Best Practices

- **Zero Secret Exposure**: Tokens and credentials are stored strictly in server-side environment variables and never bundled into frontend assets.
- **Protected Deployment Endpoint**: `POST /api/deploy` is guarded by the `requireAdminSecret` middleware. Unauthenticated requests are rejected with `401 Unauthorized`.
- **CORS Restricted**: Backend CORS policy permits requests only from the designated `FRONTEND_URL` origin.
- **Input Sanitization**: Branch and git reference parameters are strictly validated against injection characters (`/^[a-zA-Z0-9_.\-\/]+$/`).
- **Non-Root Container Execution**: The Docker container drops root privileges to run as the standard Alpine `node` user.

---

## 12. Known Limitations & Technical Notes

1. **Single Configured Repository Target**: This application is intentionally designed for demonstration and institutional review, targeting one monitored repository defined by `GITHUB_OWNER` and `GITHUB_REPO`. Multi-tenant dynamic GitHub App OAuth onboarding is out of scope for this MVP.
2. **GitHub API Rate Limits**: GitHub imposes a limit of 60 requests/hour for unauthenticated API requests. Setting a valid `GITHUB_TOKEN` raises this quota to 5,000 requests/hour.
3. **Log Archive Availability**: GitHub Actions automatically purges raw execution logs after 90 days. For older archived runs, DeployFlow provides direct links to the official GitHub Actions interface.
4. **Render Free Tier Cold Starts**: On Render's free tier, backend web services spin down after 15 minutes of inactivity. The first request may take 30-50 seconds to wake up the container.
