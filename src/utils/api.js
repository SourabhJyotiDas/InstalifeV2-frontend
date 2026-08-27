// API utility with base URL support, credentials support, and safe response parsing

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiFetch = async (url, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  const fullUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const config = {
    ...options,
    credentials: options.credentials || 'include',
    cache: 'no-store',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const res = await fetch(fullUrl, config);

  if (res.status === 401 && !url.includes('/api/auth/me')) {
    // Session expired
    window.location.href = '/login';
  }

  return res;
};

/**
 * Safely parse JSON response from fetch.
 * If the response is HTML or non-JSON (e.g. 404/500 page from host/Vercel/CDN),
 * throws a clear error message instead of SyntaxError: Unexpected token 'T'.
 */
export const safeJson = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (err) {
      throw new Error(`Invalid JSON format: ${err.message}`);
    }
  }

  const text = await res.text();
  const trimmed = text.trim();
  if (trimmed.startsWith('<') || trimmed.includes('<!DOCTYPE') || trimmed.toLowerCase().includes('the page')) {
    throw new Error(
      `API request returned HTML (${res.status} ${res.statusText}) instead of JSON. Ensure your backend server URL (VITE_API_URL) is configured correctly.`
    );
  }

  throw new Error(trimmed || `Server error (${res.status} ${res.statusText})`);
};

