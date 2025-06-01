/**
 * API Utility
 * Handles Google Gemini 2.0 Flash API requests for prompt enhancement
 */

class ApiManager {
  constructor() {
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    this.storageManager = new StorageManager();
    this.requestTimeout = 30000; // 30 seconds
    this.maxRetries = 3;
  }

  /**
   * Enhance a prompt using Gemini API
   * @param {string} originalPrompt - The original prompt to enhance
   * @param {string} platform - The target platform
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Enhancement result
   */
  async enhancePrompt(originalPrompt, platform, options = {}) {
    try {
      console.log('🚀 Starting prompt enhancement for', platform);
      
      // Replace this line - remove getUserApiKey() call and use direct key
      const apiKey = 'your_actual_gemini_api_key_here'; // Replace with your actual API key
      
      if (!apiKey || apiKey === 'AIzaSyD7LXu696YRn7A8497HUlULutNGo2ZxkOE') {
        throw new Error('Gemini API key not configured');
      }

      // Get platform-specific enhancement strategy
      const platformDetector = new PlatformDetector();
      const strategy = platformDetector.getEnhancementStrategy(platform);
      
      // Prepare the request
      const requestBody = this.buildRequestBody(originalPrompt, strategy, options);
      
      // Make the API call with retry logic
      const response = await this.makeApiCallWithRetry(apiKey, requestBody);
      
      // Process the response
      const enhancedPrompt = this.extractEnhancedPrompt(response);
      
      // Update usage statistics
      await this.storageManager.updateUsageStats(platform, true);
      
      console.log('✅ Prompt enhancement successful');
      return {
        success: true,
        originalPrompt,
        enhancedPrompt,
        platform,
        metadata: {
          timestamp: new Date().toISOString(),
          tokenCount: this.estimateTokenCount(enhancedPrompt),
          enhancementFactor: enhancedPrompt.length / originalPrompt.length
        }
      };
      
    } catch (error) {
      console.error('❌ Prompt enhancement failed:', error);
      
      // Update usage statistics with failure
      await this.storageManager.updateUsageStats(platform, false);
      
      return {
        success: false,
        error: error.message,
        originalPrompt,
        platform
      };
    }
  }

  /**
   * Build the request body for Gemini API
   * @param {string} originalPrompt - Original prompt
   * @param {Object} strategy - Enhancement strategy
   * @param {Object} options - Additional options
   * @returns {Object} Request body
   */
  buildRequestBody(originalPrompt, strategy, options) {
    const enhancementLevel = options.enhancementLevel || 'moderate';
    
    const levelInstructions = {
      basic: 'Make minimal improvements focusing on clarity and basic structure.',
      moderate: 'Enhance significantly with better structure, context, and specific instructions.',
      advanced: 'Completely transform into a highly effective, comprehensive prompt with examples and detailed guidance.'
    };

    const systemPrompt = `${strategy.systemPrompt}

Enhancement Level: ${enhancementLevel}
Instructions: ${levelInstructions[enhancementLevel]}

Rules:
1. Return ONLY the enhanced prompt, no explanations or meta-commentary
2. Preserve the user's core intent and meaning
3. Make the prompt more specific, actionable, and effective
4. Add relevant context and constraints
5. Use clear, professional language
6. If the original prompt is already well-structured, make subtle improvements

Original prompt to enhance:`;

    return {
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\n"${originalPrompt}"`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent results
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
  }

  /**
   * Make API call with retry logic
   * @param {string} apiKey - API key
   * @param {Object} requestBody - Request body
   * @returns {Promise<Object>} API response
   */
  async makeApiCallWithRetry(apiKey, requestBody) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 API attempt ${attempt}/${this.maxRetries}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        
        const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('✅ API call successful');
        return data;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ API attempt ${attempt} failed:`, error.message);
        
        // Don't retry on certain errors
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Invalid API key. Please check your Gemini API key.');
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
   * Extract enhanced prompt from API response
   * @param {Object} response - API response
   * @returns {string} Enhanced prompt
   */
  extractEnhancedPrompt(response) {
    try {
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in API response');
      }
      
      const content = candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error('No content in API response');
      }
      
      const enhancedPrompt = content.parts[0].text.trim();
      
      if (!enhancedPrompt) {
        throw new Error('Empty response from API');
      }
      
      return enhancedPrompt;
    } catch (error) {
      console.error('❌ Error extracting enhanced prompt:', error);
      throw new Error('Failed to process API response');
    }
  }

  /**
   * Estimate token count for a text
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokenCount(text) {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
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
   * Test API connection
   * @param {string} apiKey - API key to test
   * @returns {Promise<Object>} Test result
   */
  async testApiConnection(apiKey) {
    try {
      const testPrompt = 'Hello';
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: 'API connection successful',
        response: data
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get API usage information
   * @returns {Promise<Object>} Usage information
   */
  async getApiUsage() {
    try {
      const stats = await this.storageManager.getUsageStats();
      return {
        totalRequests: stats.total,
        successfulRequests: stats.successful,
        failureRate: stats.total > 0 ? ((stats.total - stats.successful) / stats.total * 100).toFixed(1) : 0,
        platformBreakdown: stats.platforms,
        lastUsed: stats.lastUsed
      };
    } catch (error) {
      console.error('❌ Error getting API usage:', error);
      return null;
    }
  }
}

// Make the class available globally
window.ApiManager = ApiManager; 