/**
 * Platform Detection Utility
 * Detects which LLM platform the user is currently on
 */

class PlatformDetector {
  constructor() {
    this.platforms = {
      CHATGPT: 'chatgpt',
      CLAUDE: 'claude',
      GEMINI: 'gemini',
      COPILOT: 'copilot',
      GROK: 'grok',
      DEEPSEEK: 'deepseek',
      UNKNOWN: 'unknown'
    };
  }

  /**
   * Detect current platform based on URL and DOM characteristics
   * @returns {string} Platform identifier
   */
  detectPlatform() {
    const url = window.location.href;
    const hostname = window.location.hostname;

    // URL-based detection
    if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) {
      return this.platforms.CHATGPT;
    }
    if (hostname.includes('claude.ai')) {
      return this.platforms.CLAUDE;
    }
    if (hostname.includes('gemini.google.com')) {
      return this.platforms.GEMINI;
    }
    if (hostname.includes('copilot.microsoft.com')) {
      return this.platforms.COPILOT;
    }
    if (hostname.includes('grok.x.ai') || hostname.includes('grok.com') || 
        (hostname.includes('x.com') && url.includes('/i/grok'))) {
      return this.platforms.GROK;
    }
    if (hostname.includes('chat.deepseek.com')) {
      return this.platforms.DEEPSEEK;
    }

    // Fallback DOM-based detection
    const domIndicators = this.getDOMIndicators();
    for (const platform in domIndicators) {
      if (this.checkDOMIndicators(domIndicators[platform])) {
        return platform;
      }
    }

    console.log('🔍 Platform detection: Unknown platform for', url);
    return this.platforms.UNKNOWN;
  }

  /**
   * Get DOM indicators for each platform
   * @returns {Object} Platform-specific DOM selectors
   */
  getDOMIndicators() {
    return {
      [this.platforms.CHATGPT]: [
        '[data-testid="send-button"]',
        '#prompt-textarea',
        '.composer-parent'
      ],
      [this.platforms.CLAUDE]: [
        '[data-testid="send-button"]',
        '.ProseMirror',
        '[contenteditable="true"]'
      ],
      [this.platforms.GEMINI]: [
        '[aria-label="Send message"]',
        '.ql-editor',
        'rich-textarea'
      ],
      [this.platforms.COPILOT]: [
        '[aria-label="Ask me anything"]',
        '.cib-serp-main'
      ],
      [this.platforms.GROK]: [
        'textarea[placeholder*="Ask"]',
        '.grok-chat'
      ],
      [this.platforms.DEEPSEEK]: [
        'textarea[placeholder*="输入"]',
        '.chat-input'
      ]
    };
  }

  /**
   * Check if DOM indicators exist for a platform
   * @param {Array} indicators - Array of CSS selectors
   * @returns {boolean} True if any indicator is found
   */
  checkDOMIndicators(indicators) {
    return indicators.some(selector => {
      try {
        return document.querySelector(selector) !== null;
      } catch (e) {
        console.warn('🔍 Invalid selector:', selector, e);
        return false;
      }
    });
  }

  /**
   * Get platform-specific textarea selectors
   * @param {string} platform - Platform identifier
   * @returns {Array} Array of textarea selectors for the platform
   */
  getTextareaSelectors(platform) {
    const selectors = {
      [this.platforms.CHATGPT]: [
        '#prompt-textarea',
        'textarea[data-id="root"]',
        'textarea[placeholder*="Message"]',
        '.ProseMirror'
      ],
      [this.platforms.CLAUDE]: [
        '.ProseMirror',
        '[contenteditable="true"][data-testid*="chat"]',
        'div[contenteditable="true"]',
        'textarea'
      ],
      [this.platforms.GEMINI]: [
        '.ql-editor',
        'rich-textarea textarea',
        'textarea[aria-label*="Enter"]',
        'div[contenteditable="true"]'
      ],
      [this.platforms.COPILOT]: [
        'textarea[aria-label*="Ask"]',
        '#searchbox textarea',
        '.cib-text-input textarea'
      ],
      [this.platforms.GROK]: [
        'textarea[placeholder*="Ask"]',
        'textarea[placeholder*="anything"]',
        '.chat-input textarea',
        'textarea'
      ],
      [this.platforms.DEEPSEEK]: [
        'textarea[placeholder*="输入"]',
        '.chat-input textarea',
        'textarea'
      ]
    };

    return selectors[platform] || ['textarea', '[contenteditable="true"]'];
  }

  /**
   * Get platform display name
   * @param {string} platform - Platform identifier
   * @returns {string} Human-readable platform name
   */
  getPlatformDisplayName(platform) {
    const names = {
      [this.platforms.CHATGPT]: 'ChatGPT',
      [this.platforms.CLAUDE]: 'Claude',
      [this.platforms.GEMINI]: 'Gemini',
      [this.platforms.COPILOT]: 'Microsoft Copilot',
      [this.platforms.GROK]: 'Grok',
      [this.platforms.DEEPSEEK]: 'DeepSeek',
      [this.platforms.UNKNOWN]: 'Unknown Platform'
    };

    return names[platform] || 'Unknown Platform';
  }

  /**
   * Get enhancement strategies for each platform
   * @param {string} platform - Platform identifier
   * @returns {Object} Enhancement configuration
   */
  getEnhancementStrategy(platform) {
    const strategies = {
      [this.platforms.CHATGPT]: {
        systemPrompt: `You are a ChatGPT prompt optimization expert. Transform the user's rough prompt into a well-structured, effective ChatGPT prompt that:
- Defines clear roles and context
- Uses step-by-step instructions
- Includes specific formatting requests
- Adds relevant constraints and examples
- Optimizes for ChatGPT's strengths in reasoning and detailed responses`,
        focus: 'structure and clarity'
      },
      [this.platforms.CLAUDE]: {
        systemPrompt: `You are a Claude prompt optimization expert. Transform the user's rough prompt into an effective Claude prompt that:
- Provides analytical frameworks and thinking processes
- Encourages detailed reasoning and context consideration
- Uses clear, conversational language
- Includes relevant background information
- Optimizes for Claude's strengths in analysis and nuanced understanding`,
        focus: 'analysis and reasoning'
      },
      [this.platforms.GEMINI]: {
        systemPrompt: `You are a Gemini prompt optimization expert. Transform the user's rough prompt into an effective Gemini prompt that:
- Includes fact-checking and research requests
- Structures information hierarchically
- Asks for sources and verification
- Uses research-oriented approaches
- Optimizes for Gemini's strengths in information synthesis and multimodal understanding`,
        focus: 'research and verification'
      },
      [this.platforms.COPILOT]: {
        systemPrompt: `You are a Microsoft Copilot prompt optimization expert. Transform the user's rough prompt into an effective Copilot prompt that:
- Leverages integration with Microsoft services
- Includes productivity-focused outcomes
- Uses professional, business-oriented language
- Asks for actionable insights and recommendations
- Optimizes for Copilot's strengths in productivity and enterprise scenarios`,
        focus: 'productivity and integration'
      },
      [this.platforms.GROK]: {
        systemPrompt: `You are a Grok prompt optimization expert. Transform the user's rough prompt into an effective Grok prompt that:
- Includes real-time information requests
- Uses engaging, conversational tone
- Asks for current events and trending topics
- Encourages creative and unconventional thinking
- Optimizes for Grok's strengths in real-time data and creative responses`,
        focus: 'real-time and creativity'
      },
      [this.platforms.DEEPSEEK]: {
        systemPrompt: `You are a DeepSeek prompt optimization expert. Transform the user's rough prompt into an effective DeepSeek prompt that:
- Emphasizes technical depth and accuracy
- Includes programming and technical contexts
- Uses precise, scientific language
- Asks for detailed explanations and examples
- Optimizes for DeepSeek's strengths in technical and scientific domains`,
        focus: 'technical depth'
      }
    };

    return strategies[platform] || {
      systemPrompt: `You are a general AI prompt optimization expert. Transform the user's rough prompt into a clear, effective prompt that:
- Uses specific, actionable language
- Includes clear context and constraints
- Asks for detailed, helpful responses
- Provides examples when relevant
- Optimizes for clarity and effectiveness`,
      focus: 'general enhancement'
    };
  }
}

// Make the class available globally
window.PlatformDetector = PlatformDetector; 