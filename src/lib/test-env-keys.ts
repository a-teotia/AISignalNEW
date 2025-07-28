import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔑 Testing Environment Variables...\n');

// Test Perplexity API Key
const perplexityKey = process.env.PERPLEXITY_API_KEY;
console.log('📡 Perplexity API Key:');
console.log(`   Configured: ${perplexityKey ? '✅ YES' : '❌ NO'}`);
console.log(`   Length: ${perplexityKey ? perplexityKey.length : 0} characters`);
console.log(`   Starts with: ${perplexityKey ? perplexityKey.substring(0, 10) + '...' : 'N/A'}`);
console.log(`   Is default: ${perplexityKey === 'your_perplexity_api_key_here' ? '⚠️ YES' : '✅ NO'}`);

// Test OpenAI API Key
const openaiKey = process.env.OPENAI_API_KEY;
console.log('\n🤖 OpenAI API Key:');
console.log(`   Configured: ${openaiKey ? '✅ YES' : '❌ NO'}`);
console.log(`   Length: ${openaiKey ? openaiKey.length : 0} characters`);
console.log(`   Starts with: ${openaiKey ? openaiKey.substring(0, 10) + '...' : 'N/A'}`);

// Test NextAuth
const nextauthUrl = process.env.NEXTAUTH_URL;
const nextauthSecret = process.env.NEXTAUTH_SECRET;
console.log('\n🔐 NextAuth:');
console.log(`   URL: ${nextauthUrl || '❌ NOT SET'}`);
console.log(`   Secret: ${nextauthSecret ? '✅ SET' : '❌ NOT SET'}`);

// Test if keys are actually usable
async function testAPIKeys() {
  console.log('\n🧪 Testing API Key Validity...');

  if (perplexityKey && perplexityKey !== 'your_perplexity_api_key_here') {
    console.log('📡 Testing Perplexity API...');
    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${perplexityKey}`,
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "user",
              content: "Hello, this is a test message. Please respond with 'API working' if you receive this."
            }
          ],
        }),
      });

      const text = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${text.substring(0, 100)}...`);
      
      if (response.ok) {
        console.log('   ✅ Perplexity API is working!');
      } else {
        console.log('   ❌ Perplexity API returned error');
      }
    } catch (error) {
      console.log(`   ❌ Perplexity API error: ${error}`);
    }
  } else {
    console.log('   ⚠️  Perplexity API key not properly configured');
  }

  if (openaiKey) {
    console.log('\n🤖 Testing OpenAI API...');
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: "Hello, this is a test message. Please respond with 'API working' if you receive this."
            }
          ],
          max_tokens: 50,
        }),
      });

      const text = await response.text();
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${text.substring(0, 100)}...`);
      
      if (response.ok) {
        console.log('   ✅ OpenAI API is working!');
      } else {
        console.log('   ❌ OpenAI API returned error');
      }
    } catch (error) {
      console.log(`   ❌ OpenAI API error: ${error}`);
    }
  } else {
    console.log('   ⚠️  OpenAI API key not configured');
  }

  console.log('\n✅ Environment variable test complete!');
}

// Run the test
testAPIKeys().catch(console.error); 