/**
 * Universal Prompt Enhancer - Background Service Worker
 * Handles extension lifecycle and communication
 */

class BackgroundService {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  /**
   * Initialize background service
   */
  init() {
    console.log('🚀 Background service initializing');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Handle extension installation
    this.handleInstallation();
    
    this.isInitialized = true;
    console.log('✅ Background service ready');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Handle extension installation and updates
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleOnInstalled(details);
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      console.log('🔄 Extension startup');
    });
  }

  /**
   * Handle extension installation
   */
  handleInstallation() {
    // Set default settings on first install
    chrome.storage.sync.get(['user_settings'], (result) => {
      if (!result.user_settings) {
        const defaultSettings = {
          enableAutoEnhancement: false,
          showSuccessAnimation: true,
          buttonPosition: 'top-right',
          enhancementLevel: 'moderate',
          enableAnalytics: true,
          theme: 'auto'
        };
        
        chrome.storage.sync.set({ user_settings: defaultSettings }, () => {
          console.log('✅ Default settings initialized');
        });
      }
    });
  }

  /**
   * Handle installation and update events
   * @param {Object} details - Installation details
   */
  handleOnInstalled(details) {
    console.log('📦 Extension installed/updated:', details.reason);
    
    switch (details.reason) {
      case 'install':
        this.handleFirstInstall();
        break;
      case 'update':
        this.handleUpdate(details.previousVersion);
        break;
      case 'chrome_update':
        console.log('🔄 Chrome browser updated');
        break;
    }
  }

  /**
   * Handle first installation
   */
  handleFirstInstall() {
    console.log('🎉 First time installation');
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup/popup.html?welcome=true')
    });
    
    // Initialize usage statistics
    const initialStats = {
      total: 0,
      successful: 0,
      platforms: {},
      firstUsed: new Date().toISOString(),
      lastUsed: null
    };
    
    chrome.storage.sync.set({ usage_stats: initialStats });
  }

  /**
   * Handle extension updates
   * @param {string} previousVersion - Previous version number
   */
  handleUpdate(previousVersion) {
    console.log(`🔄 Updated from version ${previousVersion}`);
    
    // Handle version-specific migrations if needed
    this.handleVersionMigration(previousVersion);
  }

  /**
   * Handle version migrations
   * @param {string} previousVersion - Previous version
   */
  handleVersionMigration(previousVersion) {
    // Add migration logic for future versions
    const currentVersion = chrome.runtime.getManifest().version;
    
    if (this.compareVersions(previousVersion, '1.0.0') < 0) {
      console.log('🔧 Migrating to version 1.0.0');
      // Add migration logic here
    }
  }

  /**
   * Compare two version strings
   * @param {string} a - First version
   * @param {string} b - Second version
   * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
   */
  compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }
    
    return 0;
  }

  /**
   * Handle messages from content scripts and popup
   * @param {Object} message - Message object
   * @param {Object} sender - Sender information
   * @param {Function} sendResponse - Response callback
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      console.log('📨 Received message:', message.action);
      
      switch (message.action) {
        case 'openPopup':
          this.openPopup();
          sendResponse({ success: true });
          break;
          
        case 'getSettings':
          const settings = await this.getSettings();
          sendResponse({ success: true, settings });
          break;
          
        case 'saveSettings':
          const saved = await this.saveSettings(message.settings);
          sendResponse({ success: saved });
          break;
          
        case 'testApiKey':
          const testResult = await this.testApiKey(message.apiKey);
          sendResponse(testResult);
          break;
          
        case 'getUsageStats':
          const stats = await this.getUsageStats();
          sendResponse({ success: true, stats });
          break;
          
        case 'exportData':
          const data = await this.exportUserData();
          sendResponse({ success: true, data });
          break;
          
        case 'importData':
          const imported = await this.importUserData(message.data);
          sendResponse({ success: imported });
          break;
          
        case 'resetExtension':
          const reset = await this.resetExtension();
          sendResponse({ success: reset });
          break;
          
        default:
          console.warn('⚠️ Unknown message action:', message.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle tab updates
   * @param {number} tabId - Tab ID
   * @param {Object} changeInfo - Change information
   * @param {Object} tab - Tab object
   */
  handleTabUpdate(tabId, changeInfo, tab) {
    // Only process complete page loads
    if (changeInfo.status !== 'complete') return;
    
    // Check if it's a supported LLM website
    const supportedSites = [
      'chat.openai.com',
      'claude.ai',
      'gemini.google.com',
      'copilot.microsoft.com',
      'grok.x.ai',
      'chat.deepseek.com'
    ];
    
    const isSupported = supportedSites.some(site => 
      tab.url && tab.url.includes(site)
    );
    
    if (isSupported) {
      console.log('🔍 Supported LLM site detected:', tab.url);
      
      // Update badge or icon if needed
      this.updateBadge(tabId, 'ready');
    }
  }

  /**
   * Open extension popup
   */
  openPopup() {
    chrome.action.openPopup();
  }

  /**
   * Get user settings
   * @returns {Promise<Object>} Settings object
   */
  getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['user_settings'], (result) => {
        resolve(result.user_settings || {});
      });
    });
  }

  /**
   * Save user settings
   * @param {Object} settings - Settings to save
   * @returns {Promise<boolean>} Success status
   */
  saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ user_settings: settings }, () => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error saving settings:', chrome.runtime.lastError);
          resolve(false);
        } else {
          console.log('✅ Settings saved successfully');
          resolve(true);
        }
      });
    });
  }

  /**
   * Test API key
   * @param {string} apiKey - API key to test
   * @returns {Promise<Object>} Test result
   */
  async testApiKey(apiKey) {
    try {
      const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: 'Respond with "API test successful" if you can see this message.'
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 10
        }
      };

      const response = await fetch(`${baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
        };
      }

      return {
        success: true,
        message: 'API key is valid'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  getUsageStats() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['usage_stats'], (result) => {
        resolve(result.usage_stats || {});
      });
    });
  }

  /**
   * Export user data
   * @returns {Promise<Object>} All user data
   */
  exportUserData() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (data) => {
        resolve(data);
      });
    });
  }

  /**
   * Import user data
   * @param {Object} data - Data to import
   * @returns {Promise<boolean>} Success status
   */
  importUserData(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error importing data:', chrome.runtime.lastError);
          resolve(false);
        } else {
          console.log('✅ Data imported successfully');
          resolve(true);
        }
      });
    });
  }

  /**
   * Reset extension to defaults
   * @returns {Promise<boolean>} Success status
   */
  resetExtension() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          console.error('❌ Error resetting extension:', chrome.runtime.lastError);
          resolve(false);
        } else {
          console.log('✅ Extension reset successfully');
          this.handleInstallation(); // Reinitialize defaults
          resolve(true);
        }
      });
    });
  }

  /**
   * Update extension badge
   * @param {number} tabId - Tab ID
   * @param {string} status - Status (ready, active, error)
   */
  updateBadge(tabId, status) {
    const badges = {
      ready: { text: '', color: '#4CAF50' },
      active: { text: '⚡', color: '#2196F3' },
      error: { text: '!', color: '#F44336' }
    };
    
    const badge = badges[status] || badges.ready;
    
    chrome.action.setBadgeText({ text: badge.text, tabId });
    chrome.action.setBadgeBackgroundColor({ color: badge.color, tabId });
  }
}

// Initialize background service
new BackgroundService(); 