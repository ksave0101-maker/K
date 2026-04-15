# AI Features Documentation

## Overview

Korea Management System now includes comprehensive AI-powered features using OpenAI's GPT models:

1. **AI Chatbot Assistant** - Intelligent assistant for system navigation and help
2. **AI Document Analyzer** - Extract insights from documents automatically
3. **AI-Enhanced Translation** - Higher quality translation using GPT-4
4. **AI Analytics** - Generate business insights from data
5. **Chat Assistant** - Help with branch communications

## Installation

### 1. Install Dependencies

All required packages are already installed:
```bash
npm install openai
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com
2. Sign in or create an account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key (starts with `sk-proj-` or `sk-`)

### 3. Configure Environment

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API key:
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 4. Restart Server

```bash
npm run dev
```

## Features

### 🤖 AI Chatbot Assistant

**Location:** `/ai-assistant`

An intelligent chatbot that helps users navigate the system, find information, and answer questions.

**Features:**
- Natural language understanding
- System navigation help
- Department information
- Feature guidance
- Context-aware responses

**API Endpoint:** `POST /api/ai/chatbot`

**Request:**
```json
{
  "message": "How do I access the HR department?",
  "context": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "To access the HR department, click on the 'HR & Accounting Department' card on the home page...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 80,
    "totalTokens": 230
  }
}
```

### 📄 AI Document Analyzer

Analyze documents and extract key information automatically.

**API Endpoint:** `POST /api/ai/analyze-document`

**Analysis Types:**
- `summary` - Generate concise summaries
- `extract` - Extract key information (dates, people, numbers, actions)
- `categorize` - Classify and categorize documents

**Request:**
```json
{
  "text": "Document text content here...",
  "analysisType": "summary"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": "Key points:\n- Point 1\n- Point 2\n- Point 3",
  "analysisType": "summary",
  "wordCount": 1250,
  "usage": {
    "promptTokens": 1300,
    "completionTokens": 150,
    "totalTokens": 1450
  }
}
```

**Limits:**
- Maximum 4000 words per document
- Approximately 16,000 characters

### 🌐 AI-Enhanced Translation

GPT-4 powered translation for higher quality results.

**Location:** File translator now supports AI translation option

**How to Use:**
1. Go to `/translator`
2. Upload your file (TXT, PDF, or Image)
3. Select target language
4. Check "Use AI Translation" for better quality
5. File will be translated and downloaded automatically

**API Parameter:** Add `useAI=true` to form data when calling `/api/translate-file`

**Benefits over Google Translate:**
- Better context understanding
- More natural phrasing
- Better handling of idioms and expressions
- More accurate technical translations

### 📊 AI Analytics

Generate business insights from data automatically.

**API Endpoint:** `POST /api/ai/analytics`

**Request:**
```json
{
  "dataDescription": "Q4 2024 sales data for all branches",
  "dataPoints": [
    { "branch": "Korea", "sales": 42180000000, "month": "Oct" },
    { "branch": "Thailand", "sales": 67320000, "month": "Oct" },
    { "branch": "Vietnam", "sales": 62230000000, "month": "Oct" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "insights": "Key trends:\n1. Korea shows strongest performance...\n2. Thailand experiencing growth...\n\nRecommendations:\n- Focus on...",
  "dataPointsAnalyzed": 3,
  "usage": {
    "promptTokens": 800,
    "completionTokens": 300,
    "totalTokens": 1100
  }
}
```

**Limits:**
- Maximum 50 data points per request
- Will be truncated if more provided

## Architecture

### File Structure

```
lib/
├── ai-config.ts          # AI configuration, prompts, models
└── ai-utils.ts           # Helper functions for AI operations

app/api/ai/
├── chatbot/route.ts      # Chatbot API endpoint
├── analyze-document/     # Document analyzer endpoint
│   └── route.ts
└── analytics/route.ts    # Analytics endpoint

app/
└── ai-assistant/         # AI Chatbot UI
    └── page.tsx
```

### AI Configuration

**Location:** `lib/ai-config.ts`

**Available Models:**
- `gpt-4-turbo-preview` - Most capable, best for complex tasks
- `gpt-4-turbo` - Fast GPT-4 model
- `gpt-3.5-turbo` - Fast and cost-effective (default)
- `gpt-3.5-turbo-16k` - Extended context window

**Temperature Settings:**
- Chatbot: 0.7 (creative, friendly)
- Document Analysis: 0.3 (factual, precise)
- Translation: 0.3 (accurate, consistent)
- Chat Assistant: 0.5 (balanced)
- Analytics: 0.5 (balanced)

**Token Limits:**
- Chatbot: 500 tokens
- Document Analysis: 1000 tokens
- Translation: 2000 tokens
- Chat Assistant: 400 tokens
- Analytics: 800 tokens

### System Prompts

Each AI feature has a specialized system prompt:

1. **Chatbot:** Friendly assistant for system navigation
2. **Document Analyzer:** Professional document analysis
3. **Translation:** Context-aware translation expert
4. **Chat Assistant:** Branch communication helper
5. **Analytics:** Business intelligence analyst

## Cost Estimation

OpenAI API pricing (as of 2024):

### GPT-4 Turbo
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

### GPT-3.5 Turbo
- Input: $0.50 / 1M tokens
- Output: $1.50 / 1M tokens

### Example Usage Costs

**AI Chatbot** (default: GPT-3.5):
- Average conversation: 200-300 tokens
- 1,000 conversations ≈ $0.30

**Document Analysis** (GPT-3.5):
- 1,000-word document: ~1,500 tokens
- 100 documents ≈ $0.20

**AI Translation** (GPT-3.5):
- 500-word translation: ~2,000 tokens
- 100 translations ≈ $0.40

**Monthly Estimates:**
- Light use (10-20 users): $5-15/month
- Medium use (50-100 users): $25-75/month
- Heavy use (200+ users): $100-300/month

## Best Practices

### 1. Use Appropriate Models

- Use GPT-3.5 for simple tasks (faster, cheaper)
- Use GPT-4 for complex analysis (better quality)

### 2. Optimize Prompts

- Keep system prompts concise
- Provide clear context
- Set appropriate temperature

### 3. Handle Errors

All AI endpoints return proper error responses:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### 4. Monitor Usage

- Track token usage in responses
- Set usage limits if needed
- Monitor costs in OpenAI dashboard

### 5. Context Management

- Limit conversation history to last 10 messages
- Truncate long documents if needed
- Batch process when possible

## Troubleshooting

### AI Features Not Working

**Problem:** "AI Assistant is not configured"

**Solutions:**
1. Check `.env.local` has `OPENAI_API_KEY`
2. Ensure key is valid (starts with `sk-`)
3. Restart development server: `npm run dev`
4. Check OpenAI account has credits

### API Rate Limits

**Problem:** Getting rate limit errors

**Solutions:**
1. Implement request throttling
2. Add exponential backoff retry logic
3. Upgrade OpenAI plan if needed
4. Use GPT-3.5 instead of GPT-4

### High Costs

**Problem:** Unexpected high API bills

**Solutions:**
1. Switch to GPT-3.5 for non-critical features
2. Reduce max_tokens settings
3. Implement usage quotas per user
4. Cache common responses
5. Monitor usage in OpenAI dashboard

### Translation Quality

**Problem:** Translations not accurate

**Solutions:**
1. Use AI translation instead of Google Translate
2. Increase max_tokens for longer texts
3. Provide more context in prompts
4. Use GPT-4 for critical translations

## Security

### API Key Protection

- ✅ Never commit `.env.local` to git
- ✅ Use environment variables only
- ✅ Rotate keys regularly
- ✅ Set spending limits in OpenAI dashboard

### Rate Limiting

Consider implementing:
- Per-user rate limits
- Per-API-endpoint limits
- Daily/monthly quotas
- IP-based throttling

## Future Enhancements

### Planned Features

1. **Streaming Responses** - Real-time chat streaming
2. **Document Upload in UI** - Direct upload for analysis
3. **Translation History** - Save and reuse translations
4. **Custom AI Agents** - Department-specific assistants
5. **Voice Input** - Speech-to-text integration
6. **Multi-language Chatbot** - Auto-detect user language
7. **Email Integration** - AI-powered email responses
8. **Report Generation** - Automated report writing

### Integration Opportunities

- Slack/Teams bot
- Email assistant
- Automated report generation
- Predictive analytics
- Document classification
- Smart notifications

## Support

For issues or questions:

1. Check this documentation
2. Review API endpoint health checks:
   - `GET /api/ai/chatbot`
   - `GET /api/ai/analyze-document`
   - `GET /api/ai/analytics`
3. Check OpenAI status: https://status.openai.com
4. Review server logs for errors

## References

- OpenAI API Documentation: https://platform.openai.com/docs
- OpenAI Pricing: https://openai.com/pricing
- API Status: https://status.openai.com
- Usage Dashboard: https://platform.openai.com/usage

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**License:** Proprietary - K Energy Save Co., Ltd
