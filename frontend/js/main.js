// GreenVision Global Logic

const API_BASE_URL = 'https://greenvision-pxd3.onrender.com';

// ===============================
// Theme Management
// ===============================

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme();
    this.setupToggle();
  }

  applyTheme() {
    if (this.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  setupToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  }
}

// ===============================
// Accessibility
// ===============================

class AccessibilityManager {
  constructor() {
    this.fontSize = localStorage.getItem('fontSize') || '16';
    this.highContrast = localStorage.getItem('highContrast') === 'true';
    this.init();
  }

  init() {
    this.applyFontSize();
    this.setupControls();
  }

  applyFontSize() {
    document.documentElement.style.fontSize = this.fontSize + 'px';
  }

  setFontSize(size) {
    this.fontSize = size;
    localStorage.setItem('fontSize', size);
    this.applyFontSize();
  }

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    localStorage.setItem('highContrast', this.highContrast);
    
    if (this.highContrast) {
      document.body.style.filter = 'contrast(1.5)';
    } else {
      document.body.style.filter = 'contrast(1)';
    }
  }

  setupControls() {
    const contrastBtn = document.getElementById('contrast-toggle');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', () => this.toggleHighContrast());
    }
  }
}

// ===============================
// API Client
// ===============================

class APIClient {
  static async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }

  static async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }

  static async uploadFile(endpoint, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }
}

// ===============================
// Utility Functions
// ===============================

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.setAttribute('role', 'alert');
  
  const container = document.body.firstChild || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatPercent(decimal) {
  return (decimal * 100).toFixed(1) + '%';
}

// ===============================
// Session Management
// ===============================

class SessionManager {
  static setUser(user) {
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  static getUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static setToken(token) {
    sessionStorage.setItem('token', token);
  }

  static getToken() {
    return sessionStorage.getItem('token');
  }

  static logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
  }

  static isAuthenticated() {
    return !!SessionManager.getToken();
  }
}

// ===============================
// Initialize on Page Load
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new AccessibilityManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ThemeManager, 
    AccessibilityManager, 
    APIClient, 
    SessionManager,
    showAlert,
    showModal,
    hideModal,
    formatDate,
    formatPercent
  };
}
