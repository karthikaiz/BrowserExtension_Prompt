# Prompt Enhancement API

Backend API server for the Universal Prompt Enhancer Chrome Extension.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
GEMINI_API_KEY=AIzaSyDC7TmvBFvj7hJ5KNbziJ4uxeX6e4vF_uI
PORT=3000
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```bash
GET /api/health
```

### Enhance Prompt
```bash
POST /api/enhance
Content-Type: application/json

{
  "prompt": "write a blog post about AI",
  "platform": "chatgpt",
  "enhancementLevel": "moderate"
}
```

## Testing

Test the API with curl:
```bash
curl -X POST http://localhost:3000/api/enhance \
  -H "Content-Type: application/json" \
  -d '{"prompt":"write an email","platform":"chatgpt","enhancementLevel":"moderate"}'
```

## Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Railway
1. Connect your GitHub repo
2. Add environment variables
3. Deploy automatically

### Render
1. Connect your GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Automatically returns 429 status when exceeded

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
``` 