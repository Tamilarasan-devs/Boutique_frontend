export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('boutique_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  const authHeader = getAuthHeader();
  if (authHeader.Authorization) {
    headers.set('Authorization', authHeader.Authorization);
  }
  return fetch(input, { ...init, headers });
};
