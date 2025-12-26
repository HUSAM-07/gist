// Client-side API key storage utilities
const STORAGE_KEY = 'gist-openrouter-api-key';

/**
 * Get the stored API key
 */
export function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Save an API key to storage
 */
export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, key.trim());
}

/**
 * Remove the API key from storage
 */
export function clearApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if an API key is configured
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

/**
 * Mask an API key for display (show first 4 and last 4 chars)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
}

/**
 * Validate API key format (basic check for OpenRouter keys)
 */
export function isValidApiKeyFormat(key: string): boolean {
  // OpenRouter keys typically start with 'sk-or-'
  return key.trim().length > 10 && key.trim().startsWith('sk-');
}
