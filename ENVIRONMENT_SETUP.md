# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Perplexity API Configuration
PERPLEXITY_API_KEY=your_actual_perplexity_api_key_here

# NextAuth Configuration  
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001
```

## How to Get API Keys

### Perplexity API Key
1. Go to [Perplexity AI](https://www.perplexity.ai/)
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Copy the key to your `.env.local` file

### NextAuth Secret
Generate a random secret for NextAuth:
```bash
openssl rand -base64 32
```

## Current Issues Fixed
- ✅ DOMParser error in SonarResearchAgent (now uses regex parsing)
- ✅ Added graceful handling for missing Perplexity API key
- ✅ Better error messages for configuration issues

## Testing the Setup
1. Add your API keys to `.env.local`
2. Restart the development server: `npm run dev`
3. Test the authentication flow at `http://localhost:3001/auth/signin`
4. Test the prediction system with a stock symbol 