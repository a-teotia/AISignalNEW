import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get base URL for server-side API calls
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return '';
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
}

/**
 * Utility function to log large objects without truncation
 * @param label - The label for the log
 * @param data - The data to log
 * @param maxDepth - Maximum depth to log (default: 10)
 */
export function logLargeObject(label: string, data: any, maxDepth: number = 10): void {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📋 ${label}`);
  console.log(`${'='.repeat(50)}`);
  
  try {
    const jsonString = JSON.stringify(data, null, 2);
    
    // If the string is too long, split it into chunks
    const maxChunkSize = 10000; // 10KB chunks
    if (jsonString.length > maxChunkSize) {
      const chunks = Math.ceil(jsonString.length / maxChunkSize);
      console.log(`📄 Large object split into ${chunks} chunks:`);
      
      for (let i = 0; i < chunks; i++) {
        const start = i * maxChunkSize;
        const end = start + maxChunkSize;
        const chunk = jsonString.slice(start, end);
        console.log(`\n--- Chunk ${i + 1}/${chunks} ---`);
        console.log(chunk);
      }
    } else {
      console.log(jsonString);
    }
  } catch (error) {
    console.log('❌ Error stringifying object:', error);
    console.log('📄 Object keys:', Object.keys(data));
    console.log('📄 Object type:', typeof data);
  }
  
  console.log(`${'='.repeat(50)}\n`);
}

/**
 * Utility function to log agent results in a clean format
 * @param agentName - Name of the agent
 * @param result - Agent result object
 */
export function logAgentResult(agentName: string, result: any): void {
  console.log(`\n🔬 ${agentName} Result:`);
  console.log(`   Confidence: ${result.confidence || 'N/A'}%`);
  console.log(`   Quality: ${result.quality?.overallQuality || 'N/A'}/100`);
  console.log(`   Validation: ${result.validation?.passed ? '✅ PASSED' : '❌ FAILED'} (${result.validation?.score || 'N/A'}/100)`);
  
  if (result.data?.direction) {
    console.log(`   Direction: ${result.data.direction}`);
  }
  
  if (result.quality?.warnings?.length > 0) {
    console.log(`   ⚠️  Warnings: ${result.quality.warnings.join(', ')}`);
  }
  
  // Log full data if needed
  if (process.env.NODE_ENV === 'development') {
    console.log(`   📄 Full data:`, JSON.stringify(result, null, 2));
  }
}
