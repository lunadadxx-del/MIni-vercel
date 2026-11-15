const fs = require('fs');
const path = require('path');

class ProjectStorage {
  constructor() {
    this.dataDir = path.resolve(__dirname, '../data');
    this.dataFile = path.join(this.dataDir, 'projects.json');
    this.importedProjects = [];
    this.isInitialized = false;
  }

  ensureInitialized() {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFile)) {
        const fileContent = fs.readFileSync(this.dataFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          this.importedProjects = parsed;
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[ProjectStorage] Notice reading projects.json:', err.message);
      this.importedProjects = [];
    }

    this.isInitialized = true;
  }

  saveToFile() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(this.importedProjects, null, 2), 'utf-8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ProjectStorage] Error saving projects.json:', err.message);
    }
  }

  getImportedProjects() {
    this.ensureInitialized();
    return [...this.importedProjects];
  }

  getProjectById(id) {
    this.ensureInitialized();
    return this.importedProjects.find((p) => p.id === id) || null;
  }

  addProject(project) {
    this.ensureInitialized();
    // Check if project with same repo or name already exists in imported
    const existingIndex = this.importedProjects.findIndex(
      (p) => p.id === project.id || (p.repoUrl && p.repoUrl.toLowerCase() === project.repoUrl.toLowerCase())
    );

    if (existingIndex >= 0) {
      // Update existing
      this.importedProjects[existingIndex] = {
        ...this.importedProjects[existingIndex],
        ...project,
        updatedAt: new Date().toISOString()
      };
      this.saveToFile();
      return this.importedProjects[existingIndex];
    }

    const newProject = {
      ...project,
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.importedProjects.push(newProject);
    this.saveToFile();
    return newProject;
  }

  updateProject(id, updates) {
    this.ensureInitialized();
    const index = this.importedProjects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.importedProjects[index] = {
      ...this.importedProjects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToFile();
    return this.importedProjects[index];
  }

  deleteProject(id) {
    this.ensureInitialized();
    const initialLength = this.importedProjects.length;
    this.importedProjects = this.importedProjects.filter((p) => p.id !== id);
    if (this.importedProjects.length !== initialLength) {
      this.saveToFile();
      return true;
    }
    return false;
  }
}

module.exports = new ProjectStorage();
