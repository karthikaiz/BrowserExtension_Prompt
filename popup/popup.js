/**
 * Universal Prompt Enhancer - Popup Script (Backend API Version)
 * Handles popup interface functionality without API key management
 */

class PopupManager {
  constructor() {
    this.isInitialized = false;
    this.settings = {};
    this.stats = {};
    this.storageManager = new StorageManager();
    this.apiManager = new ApiManager();
    
    // DOM elements
    this.elements = {};
    
    console.log('🚀 Popup manager initializing (Backend API version)');
  }

  /**
   * Initialize popup
   */
  async init() {
    try {
      // Get DOM elements
      this.getDOMElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial data
      await this.loadInitialData();
      
      // Check backend status
      await this.checkBackendStatus();
      
      // Update UI
      this.updateUI();
      
      this.isInitialized = true;
      console.log('✅ Popup manager ready');
      
    } catch (error) {
      console.error('❌ Error initializing popup:', error);
      this.showToast('Failed to initialize popup', 'error');
    }
  }

  /**
   * Get DOM elements
   */
  getDOMElements() {
    // Status elements
    this.elements.statusCard = document.getElementById('statusCard');
    this.elements.statusIcon = document.getElementById('statusIcon');
    this.elements.statusText = document.getElementById('statusText');

    // Settings elements
    this.elements.enhancementLevel = document.getElementById('enhancementLevel');
    this.elements.showSuccessAnimation = document.getElementById('showSuccessAnimation');

    // Statistics elements
    this.elements.totalEnhancements = document.getElementById('totalEnhancements');
    this.elements.successRate = document.getElementById('successRate');
    this.elements.platformStats = document.getElementById('platformStats');

    // Backend status elements
    this.elements.serviceStatus = document.getElementById('serviceStatus');
    this.elements.backendStatus = document.getElementById('backendStatus');

    // UI elements
    this.elements.loadingOverlay = document.getElementById('loadingOverlay');
    this.elements.toast = document.getElementById('toast');
    this.elements.toastIcon = document.getElementById('toastIcon');
    this.elements.toastMessage = document.getElementById('toastMessage');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Settings changes
    this.elements.enhancementLevel.addEventListener('change', () => {
      this.saveSettings();
    });

    this.elements.showSuccessAnimation.addEventListener('change', () => {
      this.saveSettings();
    });

    // Toast close on click
    this.elements.toast.addEventListener('click', () => {
      this.hideToast();
    });

    // Refresh backend status on click
    this.elements.serviceStatus.addEventListener('click', () => {
      this.checkBackendStatus();
    });
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      this.showLoading(true, 'Loading settings...');

      // Load settings
      await this.loadSettings();

      // Load statistics
      await this.loadStatistics();

    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Load settings
   */
  async loadSettings() {
    try {
      this.settings = await this.storageManager.getSettings();

      // Update UI
      this.elements.enhancementLevel.value = this.settings.enhancementLevel || 'moderate';
      this.elements.showSuccessAnimation.checked = this.settings.showSuccessAnimation !== false;

    } catch (error) {
      console.error('❌ Error loading settings:', error);
    }
  }

  /**
   * Load statistics
   */
  async loadStatistics() {
    try {
      this.stats = await this.storageManager.getUsageStats();
      this.updateStatistics();
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
    }
  }

  /**
   * Check backend API status
   */
  async checkBackendStatus() {
    try {
      console.log('🔍 Checking backend API status...');
      
      const statusDot = this.elements.serviceStatus.querySelector('.status-dot');
      const statusMessage = this.elements.serviceStatus.querySelector('.status-message');
      
      // Show checking state
      statusDot.className = 'status-dot checking';
      statusMessage.textContent = 'Checking service...';
      
      const status = await this.apiManager.getBackendStatus();
      
      if (status.isOnline) {
        statusDot.className = 'status-dot online';
        statusMessage.textContent = 'Service online';
        this.updateStatus('success', 'Enhancement service is ready', '✅');
      } else {
        statusDot.className = 'status-dot offline';
        statusMessage.textContent = 'Service offline';
        this.updateStatus('error', 'Enhancement service unavailable', '❌');
      }
      
    } catch (error) {
      console.error('❌ Error checking backend status:', error);
      const statusDot = this.elements.serviceStatus.querySelector('.status-dot');
      const statusMessage = this.elements.serviceStatus.querySelector('.status-message');
      
      statusDot.className = 'status-dot offline';
      statusMessage.textContent = 'Connection error';
      this.updateStatus('error', 'Cannot connect to enhancement service', '❌');
    }
  }

  /**
   * Save settings
   */
  async saveSettings() {
    try {
      this.settings = {
        ...this.settings,
        enhancementLevel: this.elements.enhancementLevel.value,
        showSuccessAnimation: this.elements.showSuccessAnimation.checked
      };

      await this.storageManager.saveSettings(this.settings);
      console.log('✅ Settings saved');

    } catch (error) {
      console.error('❌ Error saving settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  /**
   * Update statistics display
   */
  updateStatistics() {
    // Update total enhancements
    this.elements.totalEnhancements.textContent = this.stats.total || 0;

    // Update success rate
    const successRate = this.stats.total > 0 
      ? Math.round((this.stats.successful / this.stats.total) * 100)
      : 0;
    this.elements.successRate.textContent = `${successRate}%`;

    // Update platform stats
    this.updatePlatformStats();
  }

  /**
   * Update platform statistics
   */
  updatePlatformStats() {
    const platformNames = {
      chatgpt: 'ChatGPT',
      claude: 'Claude',
      gemini: 'Gemini',
      copilot: 'Microsoft Copilot',
      grok: 'Grok',
      deepseek: 'DeepSeek'
    };

    const container = this.elements.platformStats;
    container.innerHTML = '';

    if (!this.stats.platforms || Object.keys(this.stats.platforms).length === 0) {
      container.innerHTML = '<div class="no-data">No usage data yet. Try enhancing some prompts!</div>';
      return;
    }

    const platformsHeader = document.createElement('div');
    platformsHeader.className = 'platform-stats-header';
    platformsHeader.textContent = 'Platform Breakdown:';
    container.appendChild(platformsHeader);

    Object.entries(this.stats.platforms).forEach(([platform, data]) => {
      const platformDiv = document.createElement('div');
      platformDiv.className = 'platform-stat';
      
      const name = platformNames[platform] || platform;
      const total = data.total || 0;
      const successful = data.successful || 0;
      const rate = total > 0 ? Math.round((successful / total) * 100) : 0;
      
      platformDiv.innerHTML = `
        <span class="platform-name">${name}</span>
        <span class="platform-count">${total} (${rate}%)</span>
      `;
      
      container.appendChild(platformDiv);
    });
  }

  /**
   * Update status card
   */
  updateStatus(type, message, icon) {
    this.elements.statusCard.className = `status-card ${type}`;
    this.elements.statusIcon.textContent = icon;
    this.elements.statusText.textContent = message;
  }

  /**
   * Update UI
   */
  updateUI() {
    // Status is now handled by backend status check
    this.updateStatistics();
  }

  /**
   * Show loading overlay
   */
  showLoading(show, text = 'Loading...') {
    if (show) {
      this.elements.loadingOverlay.querySelector('.loading-text').textContent = text;
      this.elements.loadingOverlay.classList.add('show');
    } else {
      this.elements.loadingOverlay.classList.remove('show');
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'success') {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    this.elements.toast.className = `toast ${type} show`;
    this.elements.toastIcon.textContent = icons[type] || icons.info;
    this.elements.toastMessage.textContent = message;
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  /**
   * Hide toast notification
   */
  hideToast() {
    this.elements.toast.classList.remove('show');
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const popupManager = new PopupManager();
  popupManager.init();
}); 