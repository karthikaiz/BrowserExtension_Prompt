
# 🚀 Universal Prompt Enhancer

**Transform your rough prompts into powerful, effective instructions for any LLM platform with AI-powered enhancement!**

Universal Prompt Enhancer is a Chrome extension that adds a magic ✨ button to LLM chatbot websites. When you type 5+ characters, the button appears in the upper right corner of your text box. Click it to instantly enhance your rough prompts using our AI-powered backend with platform-specific optimizations.


## ✨ Why Use Universal Prompt Enhancer?

### 🤔 **The Problem**
- Writing effective prompts for different AI platforms is challenging
- Each LLM (ChatGPT, Claude, Gemini, etc.) responds better to different prompt styles
- Rough ideas often don't get the best AI responses
- Switching between platforms requires learning different prompting techniques

### 💡 **The Solution**
- **Smart Enhancement**: Transforms "write email to boss" into structured, effective prompts
- **Platform-Aware**: Automatically optimizes for the specific LLM you're using
- **Instant Results**: One click enhancement with real-time AI processing
- **No Setup Required**: Works immediately after installation - no API keys needed

## 🎯 Supported Platforms

| Platform | Status | URL Patterns | Special Features |
|----------|--------|--------------|------------------|
| **ChatGPT** | ✅ Full Support | `chat.openai.com/*`, `chatgpt.com/*` | Role definitions, structured instructions |
| **Claude** | ✅ Full Support | `claude.ai/*` | Analytical frameworks, detailed reasoning |
| **Gemini** | ✅ Full Support | `gemini.google.com/*` | Research focus, fact-checking requests |
| **Microsoft Copilot** | ✅ Full Support | `copilot.microsoft.com/*` | Productivity optimization |
| **Grok** | ✅ Full Support | `grok.x.ai/*`, `grok.com/*`, `x.com/i/grok` | Real-time data, creative responses |
| **DeepSeek** | ✅ Full Support | `chat.deepseek.com/*` | Technical depth, scientific accuracy |

## 🔧 How It Works

### 1. **Smart Detection**
- Automatically detects which LLM platform you're using
- Monitors text input in real-time
- Shows enhancement button after 5+ characters

### 2. **Platform-Specific Enhancement**
Each platform gets optimized prompts:

**ChatGPT Enhancement:**
```
Input: "write email to boss"
Output: "Acting as a professional email writer, please help me compose a formal email to my supervisor. Structure the email with:
1. Clear subject line
2. Professional greeting
3. Concise main message
4. Appropriate call-to-action
5. Professional closing
Please provide the email in a business-appropriate tone."
```

**Claude Enhancement:**
```
Input: "write email to boss"
Output: "I need to draft a professional email to my supervisor. Please help me create an effective message by:
- Analyzing the appropriate tone and formality level
- Structuring the content logically
- Ensuring clear communication objectives
- Considering the professional relationship context
Please provide both the email and brief reasoning for your approach."
```

### 3. **Instant Replacement**
- Enhanced prompt automatically replaces your original text
- Cursor positioned at the end for immediate sending
- Visual feedback with loading states and animations

## 🚀 Installation & Setup

### Step 1: Install the Extension

#### Development Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the extension folder
6. Extension icon (✨) should appear in your toolbar

#### Chrome Web Store (Coming Soon)
*Extension will be available on Chrome Web Store after review*

### Step 2: Start Enhancing!

1. Visit any supported LLM website
2. Start typing in the chat text box (5+ characters)
3. Click the ✨ button that appears in the chatbox
4. Watch your prompt transform instantly!

**No configuration needed** - the extension works immediately after installation!

## 🎨 Features

### ⚡ **Smart Button Behavior**
- **Appears**: Only when you type 5+ characters
- **Positioning**: Fixed in upper right corner of text box
- **Size**: Professional 32px button with gradient design
- **States**: Loading (⏳), Success (✅), Error (❌)

### 🧠 **Intelligent Enhancement**
- **Platform Detection**: Automatically recognizes which LLM you're using
- **Context-Aware**: Different strategies for different platforms
- **Quality Focus**: Transforms rough ideas into structured, effective prompts
- **No Setup**: Works immediately - no API keys or configuration required

### 🎛️ **Customizable Settings**
- **Enhancement Levels**: Basic, Moderate, Advanced
- **Success Animations**: Toggle on/off
- **Usage Analytics**: Track your enhancement statistics
- **Data Management**: Export/import settings and usage data

### 🌙 **Modern Design**
- **Dark Mode**: Full support for dark theme browsers
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Clean**: No intrusive tooltips or overlay elements

## 📁 Extension Architecture

```
Universal Prompt Enhancer/
├── manifest.json                 # Chrome extension configuration
├── content/                     # Injected into websites
│   ├── content.js              # Main enhancement logic
│   └── content.css             # Button styling
├── background/                  # Service worker
│   └── background.js           # Extension lifecycle management
├── popup/                      # Extension settings
│   ├── popup.html             # Settings interface
│   ├── popup.js               # Settings functionality
│   └── popup.css              # Settings styling (dark mode)
├── utils/                      # Core utilities
│   ├── platform-detector.js   # Platform identification
│   ├── storage.js             # Chrome storage management
│   └── api.js                 # Backend API integration
├── backend/                    # Enhancement service
│   ├── server.js              # Express.js API server
│   └── api/                   # API endpoints
├── icons/                      # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md                   # This file
```

## 🔐 Privacy & Security

### 🛡️ **Data Protection**
- **No API Keys Required**: Service provided through our secure backend
- **Prompts**: Only sent to our enhancement service for processing
- **Usage Stats**: Stored locally, never transmitted
- **No Personal Data**: We don't store or track personal information
- **Temporary Processing**: Prompts are processed and immediately discarded

### 🔒 **Required Permissions**
- `activeTab`: Access current tab to inject enhancement buttons
- `storage`: Store settings and usage statistics locally
- `scripting`: Inject content scripts into supported websites
- `host_permissions`: Access specific LLM websites

### ⚖️ **Service Architecture**
- Secure backend API handles all AI processing
- HTTPS encryption for all data transmission
- No user authentication or tracking required
- Stateless processing - no data retention

## 🛠️ Technical Details

### 🎯 **Platform Detection**
```javascript
// Detects platform using URL patterns and DOM selectors
const supportedPlatforms = {
  chatgpt: ['chat.openai.com', 'chatgpt.com'],
  claude: ['claude.ai'],
  gemini: ['gemini.google.com'],
  copilot: ['copilot.microsoft.com'],
  grok: ['grok.x.ai', 'grok.com', 'x.com/i/grok'],
  deepseek: ['chat.deepseek.com']
};
```

### 🤖 **Enhancement Strategies**
Each platform gets specialized system prompts:

- **ChatGPT**: Role-based, structured instructions
- **Claude**: Analytical thinking, detailed reasoning
- **Gemini**: Research-oriented, fact-checking focused
- **Copilot**: Productivity and business scenarios
- **Grok**: Real-time data, creative responses
- **DeepSeek**: Technical depth, scientific accuracy

### ⚙️ **Backend Integration**
```javascript
// Extension communicates with our enhancement service
const enhancePrompt = async (originalText, platform, options) => {
  const response = await fetch('/api/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      text: originalText, 
      platform: platform,
      level: options.enhancementLevel 
    })
  });
  return response.json();
};
```

## 🐛 Troubleshooting

### ❌ **Button Not Appearing**
- ✅ Refresh the page
- ✅ Type at least 5 characters
- ✅ Verify you're on a supported website
- ✅ Check extension is enabled in `chrome://extensions/`

### ⚠️ **Enhancement Fails**
- ✅ Check internet connection
- ✅ Try refreshing the page
- ✅ Try with a different, longer prompt
- ✅ Check if service is temporarily unavailable

### 🌙 **Dark Mode Issues**
- ✅ Extension popup now fully supports dark mode
- ✅ Button visibility optimized for all themes
- ✅ Refresh browser if switching themes

### 🔧 **Service Connectivity**
- ✅ Ensure stable internet connection
- ✅ Check browser's network permissions
- ✅ Try disabling ad blockers temporarily
- ✅ Refresh page and try again

## 📊 Usage Analytics

Track your enhancement activity locally:
- **Total Enhancements**: Count of successful prompt improvements
- **Success Rate**: Percentage of successful enhancement requests
- **Platform Usage**: Which LLMs you enhance most frequently
- **Export Data**: Download your usage statistics

*All analytics are stored locally and never transmitted*

## 🚀 Development

### 🔨 **Local Development**
1. Clone repository
2. Install backend dependencies: `cd backend && npm install`
3. Start backend server: `npm start`
4. Load unpacked extension in Chrome
5. Test on supported platforms

### 🧪 **Testing Checklist**
- [ ] Button appears on all platforms
- [ ] Enhancement works for each LLM
- [ ] Dark mode popup displays correctly
- [ ] Settings persist correctly
- [ ] Error handling displays properly
- [ ] Backend connectivity works

### 📝 **Code Style**
- ES6+ JavaScript with classes
- Chrome Manifest V3 compliance
- JSDoc comments for functions
- CSS custom properties for theming
- Semantic HTML structure

## 🛣️ Roadmap

### 🎯 **Version 1.1** (Next)
- [ ] Custom enhancement templates
- [ ] Prompt history and favorites  
- [ ] More LLM platform support
- [ ] Advanced error handling

### 🚀 **Version 1.2** (Future)
- [ ] Offline enhancement mode
- [ ] Multi-language prompt support
- [ ] Team collaboration features
- [ ] Enhanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

### 💬 **Get Help**
- Check this README for common solutions
- Search existing GitHub issues
- Create new issue with detailed reproduction steps

### 🐞 **Bug Reports**
Include:
- Extension version
- Chrome version  
- Website where issue occurs
- Console error messages
- Steps to reproduce

**Made with ❤️ for the AI community**

*One click to better prompts, better conversations, better results!* ✨
