/**
 * API Utility - Backend API Integration
 * Handles requests to the backend API for prompt enhancement
 */

class ApiManager {
  constructor() {
    // Backend API URL - change this to your deployed backend
    this.baseUrl = 'http://localhost:3000/api'; // For development
    // For production: 'https://your-backend-url.com/api'
    
    this.requestTimeout = 30000; // 30 seconds
    this.maxRetries = 3;
  }

  /**
   * Enhance a prompt using backend API
   * @param {string} originalPrompt - The original prompt to enhance
   * @param {string} platform - The target platform
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Enhancement result
   */
  async enhancePrompt(originalPrompt, platform, options = {}) {
    try {
      console.log('🚀 Sending prompt to backend API for platform:', platform);
      
      // Validate input
      if (!originalPrompt || typeof originalPrompt !== 'string') {
        throw new Error('Prompt is required and must be a string');
      }

      const trimmedPrompt = originalPrompt.trim();
      if (trimmedPrompt.length < 3) {
        throw new Error('Prompt must be at least 3 characters long');
      }

      if (trimmedPrompt.length > 2000) {
        throw new Error('Prompt too long. Maximum 2000 characters allowed.');
      }

      // Prepare request data
      const requestData = {
        prompt: trimmedPrompt,
        platform: platform || 'chatgpt',
        enhancementLevel: options.enhancementLevel || 'moderate'
      };

      console.log('📤 Request data:', { 
        prompt: `${trimmedPrompt.substring(0, 50)}...`, 
        platform: requestData.platform, 
        enhancementLevel: requestData.enhancementLevel 
      });

      // Make API call with retry logic
      const response = await this.makeApiCallWithRetry(requestData);
      
      if (response.success) {
        console.log('✅ Enhancement successful');
        
        // Update usage statistics
        await this.updateUsageStats(platform, true);
        
        return {
          success: true,
          originalPrompt: trimmedPrompt,
          enhancedPrompt: response.enhancedPrompt,
          platform: response.platform,
          metadata: {
            timestamp: response.timestamp,
            enhancementLevel: response.enhancementLevel,
            originalLength: response.metadata?.originalLength || trimmedPrompt.length,
            enhancedLength: response.metadata?.enhancedLength || response.enhancedPrompt.length,
            enhancementFactor: response.metadata?.enhancementFactor || (response.enhancedPrompt.length / trimmedPrompt.length)
          }
        };
      } else {
        throw new Error(response.error || 'Enhancement failed');
      }
      
    } catch (error) {
      console.error('❌ Enhancement failed:', error);
      
      // Update usage statistics with failure
      await this.updateUsageStats(platform, false);
      
      // Provide user-friendly error messages
      let userMessage = 'Enhancement failed. Please try again.';
      
      if (error.name === 'AbortError') {
        userMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        userMessage = 'Cannot connect to enhancement service. Please check your internet connection.';
      } else if (error.message.includes('429') || error.message.includes('Too many requests')) {
        userMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('503') || error.message.includes('unavailable')) {
        userMessage = 'Enhancement service temporarily unavailable. Please try again later.';
      } else if (error.message.includes('504') || error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      } else if (error.message.length < 100) {
        // Use the error message if it's user-friendly and not too long
        userMessage = error.message;
      }
      
      return {
        success: false,
        error: userMessage,
        originalPrompt: originalPrompt,
        platform
      };
    }
  }

  /**
   * Make API call with retry logic
   * @param {Object} requestData - Request data
   * @returns {Promise<Object>} API response
   */
  async makeApiCallWithRetry(requestData) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 API attempt ${attempt}/${this.maxRetries}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        
        const response = await fetch(`${this.baseUrl}/enhance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Backend API call successful');
        return data;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ API attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.message.includes('400') || error.message.includes('Prompt')) {
          throw error; // Bad request - don't retry
        }
        
        if (error.message.includes('429')) {
          // Rate limit - wait before retry
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Rate limited. Waiting ${waitTime}ms before retry...`);
          await this.delay(waitTime);
        }
        
        if (attempt === this.maxRetries) {
          throw lastError;
        }
      }
    }
  }

  /**
   * Test backend API connection
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      console.log('🔍 Testing backend API connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: `API Health Check Failed (${response.status}): ${data.error || response.statusText}`
        };
      }

      console.log('✅ Backend API connection successful');
      return {
        success: true,
        message: 'Backend API is running',
        data: data
      };

    } catch (error) {
      console.error('❌ Backend API connection failed:', error);
      
      let errorMessage = 'Cannot connect to enhancement service';
      if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - check if backend is running';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update usage statistics
   * @param {string} platform - Platform name
   * @param {boolean} success - Whether the request was successful
   */
  async updateUsageStats(platform, success) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageManager = new StorageManager();
        await storageManager.updateUsageStats(platform, success);
      }
    } catch (error) {
      console.warn('⚠️ Failed to update usage stats:', error);
    }
  }

  /**
   * Get API usage information
   * @returns {Promise<Object>} Usage information
   */
  async getApiUsage() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const storageManager = new StorageManager();
        const stats = await storageManager.getUsageStats();
        
        return {
          totalRequests: stats.total,
          successfulRequests: stats.successful,
          failureRate: stats.total > 0 ? ((stats.total - stats.successful) / stats.total * 100).toFixed(1) : 0,
          platformBreakdown: stats.platforms,
          lastUsed: stats.lastUsed
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting API usage:', error);
      return null;
    }
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get backend API status
   * @returns {Promise<Object>} Status information
   */
  async getBackendStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      
      return {
        isOnline: response.ok,
        version: data.version,
        timestamp: data.timestamp,
        message: data.message
      };
    } catch (error) {
      return {
        isOnline: false,
        error: error.message
      };
    }
  }
}

// Make the class available globally
window.ApiManager = ApiManager; 