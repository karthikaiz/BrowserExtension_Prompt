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
    
    // ✅ NEW: Single button tracking approach
    this.currentTextarea = null;
    this.currentButton = null;
    this.lastTextContent = '';
    
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
      
      // ✅ NEW: Simple monitoring approach
      this.startSimpleMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Prompt enhancer ready');
      
    } catch (error) {
      console.error('❌ Error initializing prompt enhancer:', error);
    }
  }

  /**
   * ✅ NEW: Simple monitoring without aggressive scanning
   */
  startSimpleMonitoring() {
    // Monitor input events on textareas
    document.addEventListener('input', (e) => {
      if (this.isTextElement(e.target)) {
        this.handleTextInput(e.target);
      }
    });

    // Monitor focus events
    document.addEventListener('focusin', (e) => {
      if (this.isTextElement(e.target)) {
        this.handleTextareaFocus(e.target);
      }
    });

    // Monitor blur events  
    document.addEventListener('focusout', (e) => {
      if (this.isTextElement(e.target)) {
        this.handleTextareaBlur(e.target);
      }
    });

    // ✅ Only scan occasionally for new textareas
    setInterval(() => {
      this.findNewTextarea();
    }, 3000); // Check every 3 seconds, not constantly
  }

  /**
   * ✅ NEW: Handle text input events
   */
  handleTextInput(textarea) {
    const text = this.getTextContent(textarea);
    
    // ✅ Only show button if there's meaningful text
    if (text.trim().length >= 5) {
      this.showButton(textarea);
    } else {
      this.hideButton();
    }
  }

  /**
   * ✅ NEW: Handle textarea focus
   */
  handleTextareaFocus(textarea) {
    // Set as current textarea but don't show button yet
    this.currentTextarea = textarea;
    this.ensureWrapper(textarea);
    
    // Only show button if there's already text
    const text = this.getTextContent(textarea);
    if (text.trim().length >= 5) {
      this.showButton(textarea);
    }
  }

  /**
   * ✅ NEW: Handle textarea blur
   */
  handleTextareaBlur(textarea) {
    // Keep button if there's text, hide if empty
    const text = this.getTextContent(textarea);
    if (text.trim().length < 5) {
      setTimeout(() => {
        this.hideButton();
      }, 100); // Small delay to allow clicking button
    }
  }

  /**
   * ✅ NEW: Show button for specific textarea
   */
  showButton(textarea) {
    // If button already exists for this textarea, don't create another
    if (this.currentButton && this.currentTextarea === textarea) {
      return;
    }

    // Remove any existing button first
    this.hideButton();

    // Create new button
    this.currentTextarea = textarea;
    this.currentButton = this.createStableButton(textarea);
    
    // Add to textarea's wrapper
    const wrapper = this.ensureWrapper(textarea);
    wrapper.appendChild(this.currentButton);
    
    console.log('✨ Button shown for textarea');
  }

  /**
   * ✅ NEW: Hide current button
   */
  hideButton() {
    if (this.currentButton) {
      this.currentButton.remove();
      this.currentButton = null;
    }
  }

  /**
   * ✅ NEW: Create a stable button that doesn't get recreated
   */
  createStableButton(textElement) {
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

    // ✅ IMPROVED: Stable styles
    button.style.cssText = `
      position: absolute !important;
      top: 8px !important;
      right: 45px !important;
      width: 32px !important;
      height: 32px !important;
      border: none !important;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 16px !important;
      color: white !important;
      z-index: 99999 !important;
      transition: transform 0.2s ease !important;
    `;

    // Add click handler
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      await this.handleButtonClick(textElement, button);
    });

    // Prevent button from disappearing on hover
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    return button;
  }

  /**
   * ✅ NEW: Handle button click
   */
  async handleButtonClick(textElement, button) {
    console.log('🌟 Enhancement button clicked!');
    
    const originalText = this.getTextContent(textElement);
    console.log('📝 Original prompt:', originalText);
    
    if (!originalText || originalText.trim().length < 3) {
      this.showError(button, 'Please enter a prompt first');
      return;
    }
    
    // Show loading state
    this.setButtonState(button, 'loading');
    
    try {
      const result = await this.apiManager.enhancePrompt(
        originalText.trim(), 
        this.currentPlatform,
        { enhancementLevel: this.settings.enhancementLevel }
      );
      
      console.log('📥 API Response:', result);
      
      if (result.success) {
        console.log('✅ Enhanced prompt:', result.enhancedPrompt);
        
        // ✅ Clear and replace text
        this.replaceTextContent(textElement, result.enhancedPrompt);
        this.setButtonState(button, 'success');
        
        setTimeout(() => {
          this.setButtonState(button, 'normal');
        }, 2000);
        
      } else {
        console.log('❌ Enhancement failed:', result.error);
        this.showError(button, result.error || 'Enhancement failed');
      }
    } catch (error) {
      console.error('❌ Enhancement error:', error);
      this.showError(button, 'Enhancement failed');
    }
  }

  /**
   * ✅ NEW: Replace text content properly
   */
  replaceTextContent(element, newText) {
    console.log('🔄 Replacing text content...');
    
    if (element.tagName === 'TEXTAREA') {
      // Clear and set new value
      element.value = '';
      element.value = newText;
      
      // Trigger events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
    } else if (element.contentEditable === 'true') {
      // For contenteditable elements
      element.textContent = '';
      element.textContent = newText;
      
      // Trigger events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Focus and move cursor to end
    element.focus();
    if (element.setSelectionRange) {
      element.setSelectionRange(newText.length, newText.length);
    }
    
    console.log('✅ Text replaced successfully');
  }

  /**
   * Find new textareas (less aggressive)
   */
  findNewTextarea() {
    const selectors = this.platformDetector.getTextareaSelectors(this.currentPlatform);
    
    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (this.isTextElement(element) && element !== this.currentTextarea) {
            // Found a new textarea, but don't show button yet
            // It will show when user starts typing
            break;
          }
        }
      } catch (error) {
        // Ignore selector errors
      }
    }
  }

  /**
   * Check if element is a text input element
   */
  isTextElement(element) {
    return element.tagName === 'TEXTAREA' || 
           element.getAttribute('contenteditable') === 'true' ||
           element.classList.contains('ProseMirror') ||
           element.classList.contains('ql-editor');
  }

  /**
   * Ensure element has a wrapper for positioning
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
    wrapper.style.position = 'relative';
    
    // Insert wrapper
    parent.insertBefore(wrapper, element);
    wrapper.appendChild(element);
    
    return wrapper;
  }

  /**
   * Get text content from element
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
   * Set button state
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
        icon.textContent = '⏳';
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