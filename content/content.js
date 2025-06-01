/**
 * Universal Prompt Enhancer - Content Script
 * Main script that runs on LLM websites to inject enhancement buttons
 */

class PromptEnhancer {
  constructor() {
    // Initialize utility classes
    this.platformDetector = new PlatformDetector();
    this.storageManager = new StorageManager();
    this.apiManager = new ApiManager();
    
    // Current platform and settings
    this.currentPlatform = null;
    this.settings = null;
    this.isInitialized = false;
    
    // Tracked textareas and their buttons
    this.trackedElements = new Map();
    
    // Debounce timer for DOM changes
    this.debounceTimer = null;
    
    console.log('🚀 Universal Prompt Enhancer initialized');
  }

  /**
   * Initialize the extension
   */
  async init() {
    try {
      // Detect current platform
      this.currentPlatform = this.platformDetector.detectPlatform();
      console.log('🔍 Detected platform:', this.currentPlatform);
      
      // Load user settings
      this.settings = await this.storageManager.getSettings();
      console.log('⚙️ Loaded settings:', this.settings);
      
      // Add platform class to body for CSS targeting
      document.body.classList.add(`upe-${this.currentPlatform}`);
      
      // Start monitoring for textareas
      this.startMonitoring();
      
      // Initial scan for existing textareas
      this.scanForTextareas();
      
      this.isInitialized = true;
      console.log('✅ Prompt enhancer ready');
      
    } catch (error) {
      console.error('❌ Error initializing prompt enhancer:', error);
    }
  }

  /**
   * Start monitoring for DOM changes
   */
  startMonitoring() {
    // Monitor for new textareas
    const observer = new MutationObserver((mutations) => {
      // Debounce DOM changes
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleDOMChanges(mutations);
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['contenteditable', 'class', 'style']
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.scanForTextareas();
      }
    });

    // Handle window focus
    window.addEventListener('focus', () => {
      this.scanForTextareas();
    });
  }

  /**
   * Handle DOM mutations
   * @param {Array} mutations - DOM mutations
   */
  handleDOMChanges(mutations) {
    let shouldRescan = false;

    for (const mutation of mutations) {
      // Check for added nodes
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (this.isTextElement(node) || node.querySelector('textarea, [contenteditable="true"]')) {
              shouldRescan = true;
              break;
            }
          }
        }
      }
      
      // Check for attribute changes
      if (mutation.type === 'attributes') {
        const element = mutation.target;
        if (this.isTextElement(element)) {
          shouldRescan = true;
        }
      }
    }

    if (shouldRescan) {
      this.scanForTextareas();
    }
  }

  /**
   * Scan for textareas and add enhancement buttons
   */
  scanForTextareas() {
    const selectors = this.platformDetector.getTextareaSelectors(this.currentPlatform);
    const foundElements = new Set();

    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (this.isValidTextElement(element)) {
            foundElements.add(element);
            this.processTextElement(element);
          }
        }
      } catch (error) {
        console.warn('⚠️ Invalid selector:', selector, error);
      }
    }

    // Clean up buttons for removed elements
    this.cleanupRemovedElements(foundElements);
  }

  /**
   * Check if element is a text input element
   * @param {Element} element - Element to check
   * @returns {boolean} True if it's a text element
   */
  isTextElement(element) {
    return element.tagName === 'TEXTAREA' || 
           element.getAttribute('contenteditable') === 'true' ||
           element.classList.contains('ProseMirror') ||
           element.classList.contains('ql-editor');
  }

  /**
   * Validate if text element should have enhancement button
   * @param {Element} element - Element to validate
   * @returns {boolean} True if valid
   */
  isValidTextElement(element) {
    // Skip if already processed
    if (this.trackedElements.has(element)) {
      return false;
    }

    // Skip if element is not visible or too small
    const rect = element.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 30) {
      return false;
    }

    // Skip if element is disabled or readonly
    if (element.disabled || element.readOnly) {
      return false;
    }

    // Skip if element is inside a button or other non-input elements
    const parent = element.closest('button, [role="button"], .upe-enhancement-btn');
    if (parent) {
      return false;
    }

    return true;
  }

  /**
   * Process a text element by adding enhancement button
   * @param {Element} element - Text element
   */
  processTextElement(element) {
    try {
      // Create wrapper if needed
      const wrapper = this.ensureWrapper(element);
      
      // Create enhancement button
      const button = this.createEnhancementButton(element);
      
      // Add button to wrapper
      wrapper.appendChild(button);
      
      // Track the element and button
      this.trackedElements.set(element, {
        wrapper,
        button,
        timestamp: Date.now()
      });

      console.log('✨ Added enhancement button to element');
      
    } catch (error) {
      console.error('❌ Error processing text element:', error);
    }
  }

  /**
   * Ensure element has a wrapper for positioning
   * @param {Element} element - Text element
   * @returns {Element} Wrapper element
   */
  ensureWrapper(element) {
    const parent = element.parentElement;
    
    // Check if parent already has relative positioning
    const computedStyle = window.getComputedStyle(parent);
    if (computedStyle.position === 'relative' || computedStyle.position === 'absolute') {
      return parent;
    }

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'upe-textarea-wrapper';
    
    // Insert wrapper
    parent.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    
    return wrapper;
  }

  /**
   * Create enhancement button
   * @param {Element} textElement - Associated text element
   * @returns {Element} Button element
   */
  createEnhancementButton(textElement) {
    const button = document.createElement('button');
    button.className = 'upe-enhancement-btn';
    button.setAttribute('title', 'Enhance prompt with AI');
    button.setAttribute('aria-label', 'Enhance prompt with AI');
    button.type = 'button';

    // Add icon and tooltip
    button.innerHTML = `
      <span class="upe-btn-icon">✨</span>
      <div class="upe-tooltip">Enhance with AI</div>
      <div class="upe-progress"></div>
    `;

    // Add click handler
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🌟 Magic button clicked!');
      console.log('📝 Original prompt:', textElement.value);
      console.log('🎯 Detected platform:', this.currentPlatform);
      
      const result = await this.apiManager.enhancePrompt(
        textElement.value, 
        this.currentPlatform,
        { enhancementLevel: this.settings.enhancementLevel }
      );
      
      console.log('📥 API Response:', result);
      
      if (result.success) {
        console.log('✅ Enhanced prompt:', result.enhancedPrompt);
        this.setTextContent(textElement, result.enhancedPrompt);
        this.setButtonState(button, 'success');
        setTimeout(() => {
          this.setButtonState(button, 'normal');
        }, 2000);
        
        if (this.settings.showSuccessAnimation) {
          this.showSuccessAnimation(textElement);
        }
      } else {
        console.log('❌ Enhancement failed:', result.error);
        this.showError(button, result.error || 'Enhancement failed');
      }
    });

    // Add keyboard support
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleEnhancementClick(textElement, button);
      }
    });

    return button;
  }

  /**
   * Get text content from element
   * @param {Element} element - Text element
   * @returns {string} Text content
   */
  getTextContent(element) {
    if (element.tagName === 'TEXTAREA') {
      return element.value;
    } else if (element.contentEditable === 'true') {
      return element.textContent || element.innerText;
    }
    return '';
  }

  /**
   * Set text content in element
   * @param {Element} element - Text element
   * @param {string} text - New text content
   */
  setTextContent(element, text) {
    if (element.tagName === 'TEXTAREA') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      element.textContent = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Focus the element
    element.focus();
    
    // Move cursor to end
    if (element.setSelectionRange) {
      element.setSelectionRange(text.length, text.length);
    }
  }

  /**
   * Set button state
   * @param {Element} button - Button element
   * @param {string} state - State (normal, loading, success, error)
   */
  setButtonState(button, state) {
    // Remove all state classes
    button.classList.remove('loading', 'success', 'error');
    
    // Add new state class
    if (state !== 'normal') {
      button.classList.add(state);
    }

    // Update icon and tooltip
    const icon = button.querySelector('.upe-btn-icon');
    const tooltip = button.querySelector('.upe-tooltip');
    
    switch (state) {
      case 'loading':
        icon.textContent = '';
        tooltip.textContent = 'Enhancing...';
        button.disabled = true;
        break;
      case 'success':
        icon.textContent = '✅';
        tooltip.textContent = 'Enhanced!';
        button.disabled = false;
        break;
      case 'error':
        icon.textContent = '❌';
        tooltip.textContent = 'Error - Click to retry';
        button.disabled = false;
        break;
      default:
        icon.textContent = '✨';
        tooltip.textContent = 'Enhance with AI';
        button.disabled = false;
    }
  }

  /**
   * Show error state
   * @param {Element} button - Button element
   * @param {string} message - Error message
   */
  showError(button, message) {
    this.setButtonState(button, 'error');
    
    // Update tooltip with error message
    const tooltip = button.querySelector('.upe-tooltip');
    tooltip.textContent = message;
    
    // Reset after delay
    setTimeout(() => {
      this.setButtonState(button, 'normal');
    }, 3000);
  }

  /**
   * Show success animation
   * @param {Element} element - Text element
   */
  showSuccessAnimation(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.3)';
    
    setTimeout(() => {
      element.style.boxShadow = '';
      element.style.transition = '';
    }, 1000);
  }

  /**
   * Clean up buttons for removed elements
   * @param {Set} currentElements - Currently found elements
   */
  cleanupRemovedElements(currentElements) {
    for (const [element, data] of this.trackedElements.entries()) {
      if (!currentElements.has(element) || !document.body.contains(element)) {
        // Remove button
        if (data.button && data.button.parentElement) {
          data.button.remove();
        }
        
        // Remove from tracking
        this.trackedElements.delete(element);
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const enhancer = new PromptEnhancer();
    enhancer.init();
  });
} else {
  const enhancer = new PromptEnhancer();
  enhancer.init();
} 