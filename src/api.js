import { mockApi } from './mock.js';

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false';

const URLS = {
  user: import.meta.env.VITE_USER_URL || 'http://localhost:8001',
  event: import.meta.env.VITE_EVENT_URL || 'http://localhost:8002',
  reg: import.meta.env.VITE_REG_URL || 'http://localhost:8003',
  notif: import.meta.env.VITE_NOTIF_URL || 'http://localhost:8004',
};

async function request(base, path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${URLS[base]}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.detail || data?.message || res.statusText;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

const liveApi = {
  signup: (body) => request('reg', '/auth/signup', { method: 'POST', body }),
  login: (body) => request('reg', '/auth/login', { method: 'POST', body }),
  me: (token) => request('reg', '/auth/me', { token }),

  getProfile: (id, token) => request('user', `/users/${id}`, { token }),
  getMyProfile: (token) => request('user', '/users/me', { token }),
  updateProfile: (id, body, token) => request('user', `/users/${id}`, { method: 'PATCH', body, token }),

  listEvents: () => request('event', '/events'),
  getEvent: (id) => request('event', `/events/${id}`),
  createEvent: (body, token) => request('event', '/events', { method: 'POST', body, token }),
  deleteEvent: (id, token) => request('event', `/events/${id}`, { method: 'DELETE', token }),
  availability: (id) => request('event', `/events/${id}/availability`),

  book: (event_id, token) => request('reg', '/registrations', { method: 'POST', body: { event_id }, token }),
  myBookings: (token) => request('reg', '/registrations/me', { token }),
  cancelBooking: (id, token) => request('reg', `/registrations/${id}`, { method: 'DELETE', token }),

  notifications: () => request('notif', '/notifications'),
};

export const api = USE_MOCK ? mockApi : liveApi;
export const isMock = USE_MOCK;
