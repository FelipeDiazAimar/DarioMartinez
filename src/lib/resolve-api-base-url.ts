export function resolveApiBaseUrl(apiBaseUrl: string) {
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '');

  if (!process.env.BACKEND_API_URL) {
    return normalizedApiBaseUrl;
  }

  if (normalizedApiBaseUrl.endsWith('/api/mysql')) {
    return normalizedApiBaseUrl;
  }

  return `${normalizedApiBaseUrl}/api/mysql`;
}
