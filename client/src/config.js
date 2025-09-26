// Centralized API base configuration for Vite
// Usage: set VITE_API_BASE_URL in your .env (without trailing /api)
// Example: VITE_API_BASE_URL=https://api.example.com

const base = (import.meta.env?.VITE_API_BASE_URL ).replace(/\/$/, '');

export const API_BASE = `${base}/api`;

export const apiUrl = (path = '') => {
  const p = String(path || '');
  return p.startsWith('/') ? `${API_BASE}${p}` : `${API_BASE}/${p}`;
};
