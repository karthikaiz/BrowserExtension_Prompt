import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting state (simple in-memory for demo)
const requestCounts = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple rate limiting (IP-based)
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    if (!requestCounts.has(clientIP)) {
      requestCounts.set(clientIP, []);
    }
    
    const requests = requestCounts.get(clientIP);
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= 100) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.'
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(clientIP, recentRequests);

    const { prompt, platform, enhancementLevel } = req.body;
    
    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a string'
      });
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be at least 3 characters long'
      });
    }

    if (trimmedPrompt.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long. Maximum 2000 characters allowed.'
      });
    }

    // Validate platform
    const validPlatforms = ['chatgpt', 'claude', 'gemini', 'copilot', 'grok', 'deepseek'];
    const targetPlatform = validPlatforms.includes(platform) ? platform : 'chatgpt';

    // Validate enhancement level
    const validLevels = ['basic', 'moderate', 'advanced'];
    const targetLevel = validLevels.includes(enhancementLevel) ? enhancementLevel : 'moderate';

    console.log(`🚀 Enhancing prompt for ${targetPlatform} (${targetLevel}): "${trimmedPrompt.substring(0, 50)}..."`);

    const enhancedPrompt = await enhanceWithGemini(trimmedPrompt, targetPlatform, targetLevel);
    
    const result = {
      success: true,
      originalPrompt: trimmedPrompt,
      enhancedPrompt,
      platform: targetPlatform,
      enhancementLevel: targetLevel,
      timestamp: new Date().toISOString(),
      metadata: {
        originalLength: trimmedPrompt.length,
        enhancedLength: enhancedPrompt.length,
        enhancementFactor: enhancedPrompt.length / trimmedPrompt.length
      }
    };

    console.log(`✅ Enhancement successful. Original: ${trimmedPrompt.length} chars → Enhanced: ${enhancedPrompt.length} chars`);
    res.json(result);
    
  } catch (error) {
    console.error('❌ Enhancement error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Enhancement failed. Please try again.';
    
    if (error.message.includes('API key')) {
      statusCode = 503;
      errorMessage = 'Enhancement service temporarily unavailable.';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      statusCode = 429;
      errorMessage = 'Service temporarily overloaded. Please try again later.';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Enhancement request timed out. Please try again.';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}

// Gemini API integration function
async function enhanceWithGemini(prompt, platform, enhancementLevel) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Use stable model for production
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        topP: 0.95,
        topK: 40
      }
    });
    
    const systemPrompt = getPlatformSystemPrompt(platform, enhancementLevel);
    const fullPrompt = `${systemPrompt}\n\nOriginal prompt to enhance:\n"${prompt}"`;

    console.log('🤖 Sending request to Gemini API...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const enhancedPrompt = response.text().trim();

    if (!enhancedPrompt) {
      throw new Error('Empty response from Gemini API');
    }

    return enhancedPrompt;
    
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    
    if (error.message.includes('API key')) {
      throw new Error('Gemini API key configuration error');
    } else if (error.message.includes('quota')) {
      throw new Error('Gemini API quota exceeded');
    } else if (error.message.includes('timeout')) {
      throw new Error('Gemini API request timeout');
    } else {
      throw new Error('Gemini API service temporarily unavailable');
    }
  }
}

// Platform-specific system prompts (same as your current server.js)
function getPlatformSystemPrompt(platform, enhancementLevel) {
  const levelInstructions = {
    basic: 'Make minimal improvements focusing on clarity and basic structure.',
    moderate: 'Enhance significantly with better structure, context, and specific instructions.',
    advanced: 'Completely transform into a highly effective, comprehensive prompt with examples and detailed guidance.'
  };

  const platformStrategies = {
    chatgpt: `You are an expert prompt engineer specializing in ChatGPT optimization. Transform user prompts to maximize ChatGPT's capabilities.

Optimization Strategy:
- Use clear, specific instructions
- Add relevant context and constraints
- Structure requests for better reasoning
- Leverage ChatGPT's strengths in analysis, creativity, and problem-solving
- Include examples when helpful
- Specify desired output format`,

    claude: `You are an expert prompt engineer specializing in Claude (Anthropic) optimization. Transform user prompts to leverage Claude's analytical strengths.

Optimization Strategy:
- Structure prompts for step-by-step reasoning
- Add analytical frameworks
- Encourage thorough exploration of topics
- Leverage Claude's strength in nuanced analysis
- Include context for better understanding
- Frame requests to encourage detailed responses`,

    gemini: `You are an expert prompt engineer specializing in Google Gemini optimization. Transform user prompts to leverage Gemini's multimodal and research capabilities.

Optimization Strategy:
- Structure for factual accuracy and research
- Encourage comprehensive analysis
- Leverage Gemini's real-time information access
- Add specific requirements for sources
- Frame for detailed, well-researched responses
- Include verification requests when appropriate`,

    copilot: `You are an expert prompt engineer specializing in Microsoft Copilot optimization. Transform user prompts for productivity and business contexts.

Optimization Strategy:
- Focus on productivity and efficiency
- Structure for business/professional contexts
- Leverage Microsoft ecosystem integration
- Add specific deliverable requirements
- Include formatting specifications
- Frame for actionable outcomes`,

    grok: `You are an expert prompt engineer specializing in Grok optimization. Transform user prompts to leverage Grok's real-time and creative capabilities.

Optimization Strategy:
- Leverage real-time information access
- Encourage creative and unconventional thinking
- Add context for current events when relevant
- Structure for engaging, conversational responses
- Include humor and personality when appropriate
- Frame for up-to-date, relevant information`,

    deepseek: `You are an expert prompt engineer specializing in DeepSeek optimization. Transform user prompts for technical depth and accuracy.

Optimization Strategy:
- Focus on technical precision and depth
- Structure for detailed analysis
- Encourage step-by-step reasoning
- Add requirements for technical accuracy
- Include specific technical context
- Frame for comprehensive, detailed responses`
  };

  return `${platformStrategies[platform] || platformStrategies.chatgpt}

Enhancement Level: ${enhancementLevel}
Instructions: ${levelInstructions[enhancementLevel]}

Rules:
1. Return ONLY the enhanced prompt, no explanations or meta-commentary
2. Preserve the user's core intent and meaning
3. Make the prompt more specific, actionable, and effective
4. Add relevant context and constraints
5. Use clear, professional language
6. If the original prompt is already well-structured, make subtle improvements`;
}
