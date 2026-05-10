const URLS = {
  user: import.meta.env.VITE_USER_URL || 'http://localhost:8001',
  event: import.meta.env.VITE_EVENT_URL || 'http://localhost:8002',
  reg: import.meta.env.VITE_REG_URL || 'http://localhost:8003',
  notif: import.meta.env.VITE_NOTIF_URL || 'http://localhost:8004',
};

async function request(base, path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${URLS[base]}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const msg = data?.detail || data?.message || res.statusText;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export const api = {
  signup: (body) => request('reg', '/auth/register', { method: 'POST', body }),
  login: (body) => request('reg', '/auth/login', { method: 'POST', body }),
  me: (token) => request('reg', '/auth/profile/me', { token }),
  updateProfile: (body, token) => request('reg', '/auth/profile/me', { method: 'PUT', body, token }),

  listEvents: () => request('event', '/events'),
  getEvent: (id) => request('event', `/events/${id}`),
  createEvent: (body, token) => request('event', '/events', { method: 'POST', body, token }),
  updateEvent: (id, body, token) => request('event', `/events/${id}`, { method: 'PATCH', body, token }),
  deleteEvent: (id, token) => request('event', `/events/${id}`, { method: 'DELETE', token }),
  availability: (id) => request('event', `/events/${id}/availability`),

  book: (body, token) => request('user', '/users/bookings', { method: 'POST', body, token }),
  myBookings: (token) => request('user', '/users/bookings/me', { token }),
  cancelBooking: (id, token) => request('user', `/users/bookings/${id}/cancel`, { method: 'PATCH', token }),

  notifications: (userId) => request('notif', `/notifications/user/${userId}`),
};
