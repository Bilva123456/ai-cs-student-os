import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear auth and redirect to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => client.post('/auth/signup', data).then((r) => r.data),
  login:  (data) => client.post('/auth/login',  data).then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  me:     ()     => client.get('/users/me').then((r) => r.data),
  update: (data) => client.patch('/users/me', data).then((r) => r.data),
};

// ── Plugins (Tracks) ──────────────────────────────────────────────────────────
export const pluginApi = {
  list:   ()     => client.get('/plugins').then((r) => r.data),
  add:    (data) => client.post('/plugins', data).then((r) => r.data),
  remove: (id)   => client.delete(`/plugins/${id}`).then((r) => r.data),
};

// ── Practice ──────────────────────────────────────────────────────────────────
export const practiceApi = {
  list: (params = {}) => client.get('/practice', { params }).then((r) => r.data),
  add:  (data)         => client.post('/practice', data).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/practice/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => client.delete(`/practice/${id}`).then((r) => r.data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  get: () => client.get('/analytics').then((r) => r.data),
};

// ── AI Planner ───────────────────────────────────────────────────────────────
export const plannerApi = {
  dailyPlan: () => client.get('/planner/daily-plan').then((r) => r.data),
};

// ── Integrations ─────────────────────────────────────────────────────────────
export const integrationApi = {
  github:   (username) => client.get(`/integrations/github/${username}`).then((r) => r.data),
  leetcode: (username) => client.get(`/integrations/leetcode/${username}`).then((r) => r.data),
};

// ── Projects ──────────────────────────────────────────────────────────────────
export const projectApi = {
  list:   ()           => client.get('/projects').then((r) => r.data),
  add:    (data)       => client.post('/projects', data).then((r) => r.data),
  update: (id, data)   => client.patch(`/projects/${id}`, data).then((r) => r.data),
  remove: (id)         => client.delete(`/projects/${id}`).then((r) => r.data),
};

export default client;
