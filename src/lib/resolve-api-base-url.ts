export function resolveApiBaseUrl(apiBaseUrl: string) {
  const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '');
  return normalizedApiBaseUrl;
}
