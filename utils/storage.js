/**
 * Storage Utility
 * Manages Chrome extension storage operations
 */

class StorageManager {
  constructor() {
    this.storage = chrome.storage.sync;
    this.keys = {
      SETTINGS: 'user_settings',
      USAGE_STATS: 'usage_stats'
    };
  }

  /**
   * Save user settings
   * @param {Object} settings - Settings object
   * @returns {Promise<boolean>} Success status
   */
  async saveSettings(settings) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await this.storage.set({ [this.keys.SETTINGS]: updatedSettings });
      console.log('✅ Settings saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      return false;
    }
  }

  /**
   * Get user settings
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    try {
      const result = await this.storage.get([this.keys.SETTINGS]);
      return result[this.keys.SETTINGS] || this.getDefaultSettings();
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   * @returns {Object} Default settings object
   */
  getDefaultSettings() {
    return {
      enhancementLevel: 'moderate', // basic, moderate, advanced
      showSuccessAnimation: true,
      theme: 'auto' // light, dark, auto
    };
  }

  /**
   * Update usage statistics
   * @param {string} platform - Platform where enhancement was used
   * @param {boolean} success - Whether enhancement was successful
   * @returns {Promise<boolean>} Success status
   */
  async updateUsageStats(platform, success = true) {
    try {
      const stats = await this.getUsageStats();
      
      if (!stats.platforms[platform]) {
        stats.platforms[platform] = { total: 0, successful: 0 };
      }
      
      stats.total++;
      stats.platforms[platform].total++;
      
      if (success) {
        stats.successful++;
        stats.platforms[platform].successful++;
      }
      
      stats.lastUsed = new Date().toISOString();
      
      await this.storage.set({ [this.keys.USAGE_STATS]: stats });
      return true;
    } catch (error) {
      console.error('❌ Error updating usage stats:', error);
      return false;
    }
  }

  /**
   * Get usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    try {
      const result = await this.storage.get([this.keys.USAGE_STATS]);
      return result[this.keys.USAGE_STATS] || this.getDefaultStats();
    } catch (error) {
      console.error('❌ Error getting usage stats:', error);
      return this.getDefaultStats();
    }
  }

  /**
   * Get default statistics
   * @returns {Object} Default statistics object
   */
  getDefaultStats() {
    return {
      total: 0,
      successful: 0,
      platforms: {},
      firstUsed: new Date().toISOString(),
      lastUsed: null
    };
  }

  /**
   * Clear all data
   * @returns {Promise<boolean>} Success status
   */
  async clearAllData() {
    try {
      await this.storage.clear();
      console.log('✅ All data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return false;
    }
  }

  /**
   * Export user data
   * @returns {Promise<Object>} All user data
   */
  async exportData() {
    try {
      const data = await this.storage.get(null);
      console.log('✅ Data exported successfully');
      return data;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return {};
    }
  }

  /**
   * Import user data
   * @param {Object} data - Data to import
   * @returns {Promise<boolean>} Success status
   */
  async importData(data) {
    try {
      await this.storage.set(data);
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return false;
    }
  }

  /**
   * Listen for storage changes
   * @param {Function} callback - Callback function for changes
   */
  addStorageListener(callback) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync') {
        callback(changes);
      }
    });
  }
}

// Make the class available globally
window.StorageManager = StorageManager; 