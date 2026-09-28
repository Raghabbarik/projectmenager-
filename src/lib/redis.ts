import { Redis } from '@upstash/redis';

// Load credentials from environment variables or custom runtime storage
const getStoredConfig = () => {
  if (typeof window === 'undefined') return { url: '', token: '' };
  try {
    const customUrl = localStorage.getItem('my_journey_redis_url');
    const customToken = localStorage.getItem('my_journey_redis_token');
    return {
      url: customUrl || '',
      token: customToken || '',
    };
  } catch {
    return { url: '', token: '' };
  }
};

const stored = getStoredConfig();

export const REDIS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REDIS_REST_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.UPSTASH_REDIS_REST_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_REDIS_REST_URL) ||
  stored.url ||
  '';

export const REDIS_TOKEN =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REDIS_REST_TOKEN) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.UPSTASH_REDIS_REST_TOKEN) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_REDIS_REST_TOKEN) ||
  stored.token ||
  '';

export const isRedisRemoteConfigured = (): boolean => {
  return Boolean(
    REDIS_URL &&
    REDIS_TOKEN &&
    REDIS_URL.startsWith('https://') &&
    !REDIS_URL.includes('your-upstash')
  );
};

// Create the remote Upstash Redis instance if configured
let remoteClient: Redis | null = null;

export function getRemoteRedisClient(): Redis | null {
  if (remoteClient) return remoteClient;

  const currentStored = getStoredConfig();
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REDIS_REST_URL) ||
    currentStored.url;
  const token =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REDIS_REST_TOKEN) ||
    currentStored.token;

  if (url && token && url.startsWith('https://')) {
    try {
      remoteClient = new Redis({ url, token });
      return remoteClient;
    } catch (err) {
      console.warn('Failed to initialize Upstash Redis client:', err);
      return null;
    }
  }
  return null;
}

export function resetRemoteRedisClient(url: string, token: string): Redis | null {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('my_journey_redis_url', url.trim());
    else localStorage.removeItem('my_journey_redis_url');

    if (token) localStorage.setItem('my_journey_redis_token', token.trim());
    else localStorage.removeItem('my_journey_redis_token');
  }

  if (url && token && url.startsWith('https://')) {
    remoteClient = new Redis({ url: url.trim(), token: token.trim() });
    return remoteClient;
  } else {
    remoteClient = null;
    return null;
  }
}
