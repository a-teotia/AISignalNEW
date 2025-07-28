// Global type declarations for client-side APIs
interface Window {
  fetch: typeof fetch;
}

declare global {
  const fetch: typeof globalThis.fetch;
} 