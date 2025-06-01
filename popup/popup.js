/**
 * Universal Prompt Enhancer - Popup Script
 * Handles popup interface functionality
 */

class PopupManager {
  constructor() {
    this.isInitialized = false;
    this.currentApiKey = null;
    this.settings = {};
    this.stats = {};
    
    // DOM elements
    this.elements = {};
    
    console.log('🚀 Popup manager initializing');
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
    // Main elements
    this.elements.statusCard = document.getElementById('statusCard');
    this.elements.statusIcon = document.getElementById('statusIcon');
    this.elements.statusText = document.getElementById('statusText');
    this.elements.loadingOverlay = document.getElementById('loadingOverlay');
    this.elements.toast = document.getElementById('toast');
    this.elements.toastIcon = document.getElementById('toastIcon');
    this.elements.toastMessage = document.getElementById('toastMessage');

    // API key elements
    this.elements.apiKeyInput = document.getElementById('apiKeyInput');
    this.elements.toggleApiKey = document.getElementById('toggleApiKey');
    this.elements.saveApiKey = document.getElementById('saveApiKey');
    this.elements.testApiKey = document.getElementById('testApiKey');

    // Settings elements
    this.elements.enhancementLevel = document.getElementById('enhancementLevel');
    this.elements.showSuccessAnimation = document.getElementById('showSuccessAnimation');
    this.elements.enableAnalytics = document.getElementById('enableAnalytics');

    // Statistics elements
    this.elements.totalEnhancements = document.getElementById('totalEnhancements');
    this.elements.successRate = document.getElementById('successRate');
    this.elements.platformStats = document.getElementById('platformStats');

    // Action buttons
    this.elements.exportData = document.getElementById('exportData');
    this.elements.importData = document.getElementById('importData');
    this.elements.resetExtension = document.getElementById('resetExtension');
    this.elements.importFileInput = document.getElementById('importFileInput');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // API key actions
    this.elements.toggleApiKey.addEventListener('click', () => {
      this.toggleApiKeyVisibility();
    });

    this.elements.saveApiKey.addEventListener('click', () => {
      this.saveApiKey();
    });

    this.elements.testApiKey.addEventListener('click', () => {
      this.testApiKey();
    });

    this.elements.apiKeyInput.addEventListener('input', () => {
      this.onApiKeyInputChange();
    });

    this.elements.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveApiKey();
      }
    });

    // Settings changes
    this.elements.enhancementLevel.addEventListener('change', () => {
      this.saveSettings();
    });

    this.elements.showSuccessAnimation.addEventListener('change', () => {
      this.saveSettings();
    });

    this.elements.enableAnalytics.addEventListener('change', () => {
      this.saveSettings();
    });

    // Action buttons
    this.elements.exportData.addEventListener('click', () => {
      this.exportData();
    });

    this.elements.importData.addEventListener('click', () => {
      this.importData();
    });

    this.elements.resetExtension.addEventListener('click', () => {
      this.resetExtension();
    });

    this.elements.importFileInput.addEventListener('change', (e) => {
      this.handleFileImport(e);
    });

    // Toast close on click
    this.elements.toast.addEventListener('click', () => {
      this.hideToast();
    });
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      this.showLoading(true);

      // Load API key
      await this.loadApiKey();

      // Load settings
      await this.loadSettings();

      // Load statistics
      await this.loadStatistics();

    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Load API key
   */
  async loadApiKey() {
    try {
      const result = await chrome.storage.sync.get(['gemini_api_key']);
      this.currentApiKey = result.gemini_api_key || null;
      
      if (this.currentApiKey) {
        this.elements.apiKeyInput.value = this.currentApiKey;
        this.updateStatus('success', 'API key configured', '✅');
      } else {
        this.updateStatus('warning', 'API key not configured', '⚠️');
      }
    } catch (error) {
      console.error('❌ Error loading API key:', error);
      this.updateStatus('error', 'Error loading API key', '❌');
    }
  }

  /**
   * Load settings
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['user_settings']);
      this.settings = result.user_settings || {
        enhancementLevel: 'moderate',
        showSuccessAnimation: true,
        enableAnalytics: true
      };

      // Update UI
      this.elements.enhancementLevel.value = this.settings.enhancementLevel || 'moderate';
      this.elements.showSuccessAnimation.checked = this.settings.showSuccessAnimation !== false;
      this.elements.enableAnalytics.checked = this.settings.enableAnalytics !== false;

    } catch (error) {
      console.error('❌ Error loading settings:', error);
    }
  }

  /**
   * Load statistics
   */
  async loadStatistics() {
    try {
      const result = await chrome.storage.sync.get(['usage_stats']);
      this.stats = result.usage_stats || {
        total: 0,
        successful: 0,
        platforms: {}
      };

      this.updateStatistics();
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
    }
  }

  /**
   * Toggle API key visibility
   */
  toggleApiKeyVisibility() {
    const input = this.elements.apiKeyInput;
    const button = this.elements.toggleApiKey;
    
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
    } else {
      input.type = 'password';
      button.textContent = '👁️';
    }
  }

  /**
   * Handle API key input change
   */
  onApiKeyInputChange() {
    const value = this.elements.apiKeyInput.value.trim();
    const isValid = this.validateApiKey(value);
    
    this.elements.saveApiKey.disabled = !value || !isValid;
    this.elements.testApiKey.disabled = !value || !isValid;
    
    if (value && !isValid) {
      this.elements.apiKeyInput.style.borderColor = '#f44336';
    } else {
      this.elements.apiKeyInput.style.borderColor = '';
    }
  }

  /**
   * Validate API key format
   */
  validateApiKey(apiKey) {
    if (!apiKey) return false;
    
    // Basic validation for Gemini API key format
    const geminiKeyPattern = /^AIza[0-9A-Za-z_-]{35}$/;
    return geminiKeyPattern.test(apiKey);
  }

  /**
   * Save API key
   */
  async saveApiKey() {
    try {
      const apiKey = this.elements.apiKeyInput.value.trim();
      
      if (!apiKey) {
        this.showToast('Please enter an API key', 'error');
        return;
      }

      if (!this.validateApiKey(apiKey)) {
        this.showToast('Invalid API key format', 'error');
        return;
      }

      this.showLoading(true, 'Saving API key...');

      // Save to storage
      await chrome.storage.sync.set({ gemini_api_key: apiKey });
      this.currentApiKey = apiKey;

      this.updateStatus('success', 'API key saved successfully', '✅');
      this.showToast('API key saved successfully', 'success');

    } catch (error) {
      console.error('❌ Error saving API key:', error);
      this.showToast('Failed to save API key', 'error');
      this.updateStatus('error', 'Error saving API key', '❌');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Test API key
   */
  async testApiKey() {
    try {
      const apiKey = this.elements.apiKeyInput.value.trim();
      
      if (!apiKey) {
        this.showToast('Please enter an API key', 'error');
        return;
      }

      this.showLoading(true, 'Testing API key...');

      // Test API key via background script
      const response = await chrome.runtime.sendMessage({
        action: 'testApiKey',
        apiKey: apiKey
      });

      if (response.success) {
        this.showToast('API key is valid!', 'success');
        this.updateStatus('success', 'API key is valid', '✅');
      } else {
        this.showToast(`API test failed: ${response.error}`, 'error');
        this.updateStatus('error', 'API key test failed', '❌');
      }

    } catch (error) {
      console.error('❌ Error testing API key:', error);
      this.showToast('Failed to test API key', 'error');
    } finally {
      this.showLoading(false);
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
        showSuccessAnimation: this.elements.showSuccessAnimation.checked,
        enableAnalytics: this.elements.enableAnalytics.checked
      };

      await chrome.storage.sync.set({ user_settings: this.settings });
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
      container.innerHTML = '<div style="text-align: center; color: #666; font-size: 12px;">No usage data yet</div>';
      return;
    }

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
   * Export user data
   */
  async exportData() {
    try {
      this.showLoading(true, 'Exporting data...');

      const response = await chrome.runtime.sendMessage({
        action: 'exportData'
      });

      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `prompt-enhancer-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully', 'success');
      } else {
        this.showToast('Failed to export data', 'error');
      }

    } catch (error) {
      console.error('❌ Error exporting data:', error);
      this.showToast('Failed to export data', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Import user data
   */
  importData() {
    this.elements.importFileInput.click();
  }

  /**
   * Handle file import
   */
  async handleFileImport(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;

      this.showLoading(true, 'Importing data...');

      const text = await file.text();
      const data = JSON.parse(text);

      const response = await chrome.runtime.sendMessage({
        action: 'importData',
        data: data
      });

      if (response.success) {
        this.showToast('Data imported successfully', 'success');
        
        // Reload the popup data
        await this.loadInitialData();
        this.updateUI();
      } else {
        this.showToast('Failed to import data', 'error');
      }

    } catch (error) {
      console.error('❌ Error importing data:', error);
      this.showToast('Invalid data file', 'error');
    } finally {
      this.showLoading(false);
      // Reset file input
      event.target.value = '';
    }
  }

  /**
   * Reset extension
   */
  async resetExtension() {
    try {
      if (!confirm('Are you sure you want to reset all extension data? This cannot be undone.')) {
        return;
      }

      this.showLoading(true, 'Resetting extension...');

      const response = await chrome.runtime.sendMessage({
        action: 'resetExtension'
      });

      if (response.success) {
        this.showToast('Extension reset successfully', 'success');
        
        // Reload the popup data
        await this.loadInitialData();
        this.updateUI();
      } else {
        this.showToast('Failed to reset extension', 'error');
      }

    } catch (error) {
      console.error('❌ Error resetting extension:', error);
      this.showToast('Failed to reset extension', 'error');
    } finally {
      this.showLoading(false);
    }
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
    // Update API key status
    if (this.currentApiKey) {
      this.updateStatus('success', 'API key configured', '✅');
    } else {
      this.updateStatus('warning', 'API key not configured', '⚠️');
    }

    // Update statistics
    this.updateStatistics();
  }

  /**
   * Show loading overlay
   */
  showLoading(show, text = 'Processing...') {
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

    this.elements.toast.className = `toast ${type}`;
    this.elements.toastIcon.textContent = icons[type] || icons.info;
    this.elements.toastMessage.textContent = message;
    
    this.elements.toast.classList.add('show');
    
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