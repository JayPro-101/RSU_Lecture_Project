
const DEFAULT_API_URL = 'http://localhost:3000';

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export const env = {
  apiUrl: normalizeUrl(
    import.meta.env.VITE_API_URL || DEFAULT_API_URL
  ),

  appName: 'RSU Lecture Portal',

  appEnvironment: import.meta.env.MODE,

  isDevelopment: import.meta.env.DEV,

  isProduction: import.meta.env.PROD,
};
