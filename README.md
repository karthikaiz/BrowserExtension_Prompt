# Universal Prompt Enhancer

🚀 **Transform your rough prompts into powerful, effective instructions for any LLM platform!**

Universal Prompt Enhancer is a Chrome extension that adds a magic ✨ button to LLM chatbot websites (ChatGPT, Claude, Gemini, etc.). When you click the button, it uses Google Gemini 2.0 Flash API to enhance your rough prompts with platform-specific optimizations.

![Extension Demo](https://via.placeholder.com/600x300/667eea/white?text=Extension+Demo+Screenshot)

## ✨ Features

### 🎯 **Smart Platform Detection**
- Automatically detects which LLM platform you're using
- Supports ChatGPT, Claude, Gemini, Microsoft Copilot, Grok, and DeepSeek
- Platform-specific enhancement strategies

### 🔧 **Intelligent Enhancement**
- **ChatGPT**: Adds role definitions, step-by-step structure, clear instructions
- **Claude**: Provides analytical frameworks, detailed reasoning, context
- **Gemini**: Includes fact-checking requests, research-oriented structure
- **Copilot**: Leverages productivity focus and enterprise scenarios
- **Grok**: Emphasizes real-time data and creative responses
- **DeepSeek**: Focuses on technical depth and scientific accuracy

### 🎨 **Beautiful User Interface**
- Modern gradient magic star button (✨)
- Non-intrusive design that adapts to each platform
- Loading animations and success indicators
- Responsive design for all screen sizes

### ⚙️ **Customizable Settings**
- Three enhancement levels: Basic, Moderate, Advanced
- Toggle success animations
- Usage analytics tracking
- Data export/import functionality

### 🔒 **Privacy & Security**
- API key stored securely using Chrome Extension Storage API
- No data sent to third parties (except Gemini API for enhancement)
- Complete control over your data

## 🚀 Quick Start

### Step 1: Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza`)

### Step 2: Install the Extension

#### Option A: Load Unpacked (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `prompt-enhancer-extension` folder
5. The extension should now appear in your extensions list

#### Option B: Chrome Web Store (Coming Soon)

*Extension will be available on Chrome Web Store after review*

### Step 3: Configure the Extension

1. Click the extension icon in your Chrome toolbar
2. Enter your Gemini API key in the popup
3. Click "Save API Key"
4. Click "Test" to verify your API key works
5. Adjust settings as desired

### Step 4: Start Enhancing!

1. Go to any supported LLM website:
   - [ChatGPT](https://chat.openai.com)
   - [Claude](https://claude.ai)
   - [Gemini](https://gemini.google.com)
   - [Microsoft Copilot](https://copilot.microsoft.com)
   - [Grok](https://grok.x.ai)
   - [DeepSeek](https://chat.deepseek.com)

2. Type your rough prompt in the text area
3. Look for the magic ✨ button in the top-right corner
4. Click the button and watch your prompt transform!

## 🛠️ Installation Guide

### Prerequisites

- Google Chrome browser (version 88+)
- Gemini API key from Google AI Studio
- Internet connection

### Detailed Installation Steps

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-username/universal-prompt-enhancer.git
   cd universal-prompt-enhancer
   ```

2. **Load in Chrome**
   - Open Chrome
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

3. **Verify Installation**
   - Look for the ✨ icon in your Chrome toolbar
   - Visit a supported LLM website
   - Check that the magic button appears in text areas

## 📖 Usage Guide

### Basic Usage

1. **Navigate to an LLM website**
2. **Enter your prompt** in the text area
3. **Click the ✨ button** when it appears
4. **Wait for enhancement** (loading indicator will show)
5. **Review the enhanced prompt** that replaces your original text

### Enhancement Levels

- **Basic**: Minimal improvements for clarity and structure
- **Moderate**: Significant enhancement with better context and instructions
- **Advanced**: Complete transformation with examples and detailed guidance

### Tips for Best Results

- ✅ **Do**: Write clear, specific rough prompts
- ✅ **Do**: Use complete sentences when possible
- ✅ **Do**: Include context about what you want to achieve
- ❌ **Don't**: Use extremely short prompts (less than 5 characters)
- ❌ **Don't**: Include sensitive personal information
- ❌ **Don't**: Expect perfect results from very vague requests

### Troubleshooting

#### Button Not Appearing
- Refresh the page
- Check if you're on a supported website
- Verify extension is enabled
- Check browser console for errors

#### Enhancement Fails
- Verify your API key is correct
- Check your internet connection
- Ensure you have sufficient API quota
- Try with a different prompt

#### Button Position Issues
- Try refreshing the page
- Check if website layout has changed
- Report issue on GitHub

## 🏗️ Technical Architecture

### File Structure
```
prompt-enhancer-extension/
├── manifest.json              # Extension manifest
├── content/                   # Content scripts
│   ├── content.js            # Main content script
│   └── content.css           # Button styles
├── background/               # Background scripts
│   └── background.js         # Service worker
├── popup/                    # Extension popup
│   ├── popup.html           # Popup interface
│   ├── popup.js             # Popup functionality
│   └── popup.css            # Popup styles
├── utils/                    # Utility modules
│   ├── api.js               # Gemini API integration
│   ├── storage.js           # Storage management
│   └── platform-detector.js # Platform detection
├── icons/                    # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md                 # This file
```

### Key Components

#### Platform Detector (`utils/platform-detector.js`)
- Detects current LLM platform using URL patterns and DOM selectors
- Provides platform-specific textarea selectors
- Returns enhancement strategies for each platform

#### API Manager (`utils/api.js`)
- Handles Gemini 2.0 Flash API integration
- Implements retry logic and error handling
- Manages request/response processing

#### Storage Manager (`utils/storage.js`)
- Manages Chrome Extension Storage API
- Handles API key storage and validation
- Tracks usage statistics

#### Content Script (`content/content.js`)
- Injects enhancement buttons into web pages
- Monitors DOM changes for new text areas
- Handles button interactions and enhancement flow

### API Integration

The extension uses Google Gemini 2.0 Flash API with the following configuration:

```javascript
{
  model: "gemini-2.0-flash-exp",
  temperature: 0.3,
  maxOutputTokens: 1024,
  safetySettings: [/* HARM_CATEGORY_* settings */]
}
```

## 🔧 Development

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/universal-prompt-enhancer.git
   cd universal-prompt-enhancer
   ```

2. **Load in Chrome for testing**
   - Follow installation steps above
   - Enable "Developer mode"
   - Use "Load unpacked"

3. **Make changes and test**
   - Edit files as needed
   - Click "Reload" button in `chrome://extensions/`
   - Test on supported websites

### Testing Checklist

#### Basic Functionality
- [ ] Extension loads without errors
- [ ] API key can be saved and tested
- [ ] Settings are persisted
- [ ] Button appears on all supported platforms

#### Enhancement Testing
- [ ] Basic enhancement level works
- [ ] Moderate enhancement level works
- [ ] Advanced enhancement level works
- [ ] Error handling works correctly
- [ ] Loading states display properly

#### Platform Testing
- [ ] ChatGPT integration works
- [ ] Claude integration works
- [ ] Gemini integration works
- [ ] Copilot integration works
- [ ] Grok integration works
- [ ] DeepSeek integration works

#### UI/UX Testing
- [ ] Button positioning is correct
- [ ] Animations work smoothly
- [ ] Responsive design works
- [ ] Dark mode support works
- [ ] Accessibility features work

### Code Style

- Use ES6+ features
- Follow JSDoc commenting conventions
- Use meaningful variable and function names
- Implement proper error handling
- Add console logging for debugging

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📊 Supported Platforms

| Platform | Status | URL Pattern | Notes |
|----------|--------|-------------|-------|
| ChatGPT | ✅ Full Support | `chat.openai.com/*` | Works with all chat interfaces |
| Claude | ✅ Full Support | `claude.ai/*` | Supports both free and pro versions |
| Gemini | ✅ Full Support | `gemini.google.com/*` | Works with Gemini web interface |
| Microsoft Copilot | ✅ Full Support | `copilot.microsoft.com/*` | Supports chat interface |
| Grok | ✅ Full Support | `grok.x.ai/*` | Works with X's Grok interface |
| DeepSeek | ✅ Full Support | `chat.deepseek.com/*` | Supports DeepSeek chat |

## 🔐 Privacy & Security

### Data Handling
- **API Key**: Stored locally using Chrome's secure storage API
- **User Prompts**: Sent only to Gemini API for enhancement
- **Usage Statistics**: Stored locally, never transmitted
- **No Tracking**: No analytics or tracking services used

### Permissions Explained
- `activeTab`: Access current tab to inject enhancement buttons
- `storage`: Store API key and settings securely
- `scripting`: Inject content scripts into supported websites
- `host_permissions`: Access specific LLM websites for functionality

### Security Best Practices
- API keys are never logged or transmitted to third parties
- All network requests use HTTPS
- Input validation prevents code injection
- Secure coding practices followed throughout

## 🆘 Support & Troubleshooting

### Common Issues

#### "API key not configured"
**Solution**: Enter your Gemini API key in the extension popup

#### "Enhancement failed"
**Possible causes**:
- Invalid API key
- Network connectivity issues
- API quota exceeded
- Prompt too short/invalid

**Solutions**:
- Test your API key in the popup
- Check internet connection
- Wait and try again (if quota exceeded)
- Use a longer, more specific prompt

#### Button not appearing
**Possible causes**:
- Website not supported
- Page not fully loaded
- Extension disabled
- DOM structure changed

**Solutions**:
- Refresh the page
- Verify website is supported
- Check extension is enabled
- Report issue if persistent

### Getting Help

1. **Check the FAQ** in this README
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Extension version
   - Browser version
   - Website where issue occurs
   - Steps to reproduce
   - Console error messages

### Feature Requests

We welcome feature requests! Please:
1. Check if the feature already exists
2. Search existing feature requests
3. Create a detailed issue describing:
   - What you want to achieve
   - Why it would be useful
   - How it should work

## 📈 Roadmap

### Version 1.1 (Planned)
- [ ] Support for more LLM platforms
- [ ] Custom prompt templates
- [ ] Prompt history and favorites
- [ ] Better error messages

### Version 1.2 (Future)
- [ ] Offline enhancement capabilities
- [ ] Team/organization features
- [ ] Advanced analytics dashboard
- [ ] Integration with other AI services

### Version 2.0 (Vision)
- [ ] Multi-language support
- [ ] Voice input integration
- [ ] AI-powered platform recommendations
- [ ] Advanced customization options

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini team for the excellent API
- Chrome Extensions team for the robust platform
- Open source community for inspiration and feedback
- Beta testers and early adopters

## 🔗 Links

- [Chrome Web Store](https://chrome.google.com/webstore) (Coming Soon)
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [GitHub Repository](https://github.com/your-username/universal-prompt-enhancer)
- [Issue Tracker](https://github.com/your-username/universal-prompt-enhancer/issues)
- [Documentation](https://github.com/your-username/universal-prompt-enhancer/wiki)

---

**Made with ❤️ for the AI community**

*Transform your prompts, transform your conversations!* 
=======
# BrowserExtension_Prompt
>>>>>>> 1b922ac0b7cf8ca5d6584bd25f644a6a3942fdc4
