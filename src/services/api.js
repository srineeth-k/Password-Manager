const API_BASE = 'http://localhost:3000/api';

/**
 * Get stored JWT token
 */
const getToken = () => localStorage.getItem('passop_token');

/**
 * Make an authenticated API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

// ── Auth API ──────────────────────────────────────────────

export const authAPI = {
  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiRequest('/auth/me'),
};

// ── Passwords API ─────────────────────────────────────────

export const passwordsAPI = {
  getAll: () => apiRequest('/passwords'),

  getOne: (id) => apiRequest(`/passwords/${id}`),

  create: (site, username, password) =>
    apiRequest('/passwords', {
      method: 'POST',
      body: JSON.stringify({ site, username, password }),
    }),

  update: (id, data) =>
    apiRequest(`/passwords/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/passwords/${id}`, {
      method: 'DELETE',
    }),
};
