// In-memory mock backend. Used when VITE_USE_MOCK=true.
// Mirrors the shape of the real services so swapping back is just a flag flip.

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

const fakeJwt = (payload) => {
  const head = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${head}.${body}.mock`;
};

const state = {
  users: [
    { id: 'u1', email: 'demo@example.com', password: 'demo', name: 'Demo User',
      bio: 'Conference enthusiast.', avatar_url: '', role: 'organizer' },
  ],
  events: [
    {
      id: 'e1', title: 'CloudConf 2026', description: 'Annual cloud-native conference with workshops and keynotes.',
      category: 'Conference', location: 'Berlin, DE',
      starts_at: '2026-06-12T09:00', ends_at: '2026-06-14T18:00',
      capacity: 500, seats_left: 142, organizer_id: 'u1',
    },
    {
      id: 'e2', title: 'React Performance Workshop', description: 'Hands-on session on profiling and optimizing React apps.',
      category: 'Workshop', location: 'Online',
      starts_at: '2026-05-20T15:00', ends_at: '2026-05-20T18:00',
      capacity: 60, seats_left: 8, organizer_id: 'u1',
    },
    {
      id: 'e3', title: 'Distributed Systems Seminar', description: 'Deep dive into consensus, CRDTs and event-sourcing.',
      category: 'Seminar', location: 'Amsterdam, NL',
      starts_at: '2026-07-02T10:00', ends_at: '2026-07-02T17:00',
      capacity: 120, seats_left: 0, organizer_id: 'u1',
    },
    {
      id: 'e4', title: 'Indie Hackers Meetup', description: 'Casual evening with lightning talks and pizza.',
      category: 'Meetup', location: 'Lisbon, PT',
      starts_at: '2026-05-30T19:00', ends_at: '2026-05-30T22:00',
      capacity: 80, seats_left: 53, organizer_id: 'u1',
    },
  ],
  bookings: [
    { id: 'b1', user_id: 'u1', event_id: 'e2', status: 'confirmed', created_at: '2026-04-30T12:00' },
  ],
  notifications: [
    { id: 'n1', routing_key: 'registration.created', created_at: '2026-04-30T12:00:01',
      payload: { user_id: 'u1', event_id: 'e2' } },
    { id: 'n2', routing_key: 'event.created', created_at: '2026-04-29T09:30:00',
      payload: { event_id: 'e4', title: 'Indie Hackers Meetup' } },
    { id: 'n3', routing_key: 'user.registered', created_at: '2026-04-28T10:15:00',
      payload: { user_id: 'u1', email: 'demo@example.com' } },
  ],
};

const requireAuth = (token) => {
  if (!token) throw new Error('Unauthorized');
  try {
    const claims = JSON.parse(atob(token.split('.')[1]));
    return state.users.find((u) => u.id === claims.sub) || { id: claims.sub };
  } catch { throw new Error('Invalid token'); }
};

export const mockApi = {
  async signup(body) {
    await delay();
    if (state.users.find((u) => u.email === body.email)) throw new Error('Email already in use');
    const u = { id: uid(), email: body.email, password: body.password, name: body.name || '', bio: '', avatar_url: '', role: 'attendee' };
    state.users.push(u);
    state.notifications.unshift({ id: uid(), routing_key: 'user.registered', created_at: new Date().toISOString(), payload: { user_id: u.id, email: u.email } });
    return { access_token: fakeJwt({ sub: u.id, role: u.role, exp: Date.now() + 3600_000 }) };
  },
  async login(body) {
    await delay();
    const u = state.users.find((x) => x.email === body.email && x.password === body.password);
    if (!u) throw new Error('Invalid credentials');
    return { access_token: fakeJwt({ sub: u.id, role: u.role, exp: Date.now() + 3600_000 }) };
  },
  async me(token) { await delay(); return requireAuth(token); },

  async getProfile(id) { await delay(); const u = state.users.find((x) => x.id === id); if (!u) throw new Error('Not found'); return u; },
  async getMyProfile(token) { await delay(); return requireAuth(token); },
  async updateProfile(id, body) { await delay(); const u = state.users.find((x) => x.id === id); if (!u) throw new Error('Not found'); Object.assign(u, body); return u; },

  async listEvents() { await delay(); return [...state.events]; },
  async getEvent(id) { await delay(); const e = state.events.find((x) => x.id === id); if (!e) throw new Error('Not found'); return e; },
  async createEvent(body, token) {
    await delay();
    const u = requireAuth(token);
    const e = { id: uid(), seats_left: Number(body.capacity) || 0, organizer_id: u.id, ...body, capacity: Number(body.capacity) || 0 };
    state.events.unshift(e);
    state.notifications.unshift({ id: uid(), routing_key: 'event.created', created_at: new Date().toISOString(), payload: { event_id: e.id, title: e.title } });
    return e;
  },
  async deleteEvent(id, token) {
    await delay(); requireAuth(token);
    const idx = state.events.findIndex((x) => x.id === id);
    if (idx >= 0) state.events.splice(idx, 1);
    state.notifications.unshift({ id: uid(), routing_key: 'event.cancelled', created_at: new Date().toISOString(), payload: { event_id: id } });
    return null;
  },
  async availability(id) { await delay(); const e = state.events.find((x) => x.id === id); return { seats_left: e?.seats_left ?? 0 }; },

  async book(event_id, token) {
    await delay();
    const u = requireAuth(token);
    const e = state.events.find((x) => x.id === event_id);
    if (!e) throw new Error('Event not found');
    if (e.seats_left <= 0) throw new Error('Sold out');
    e.seats_left -= 1;
    const b = { id: uid(), user_id: u.id, event_id, status: 'confirmed', created_at: new Date().toISOString() };
    state.bookings.unshift(b);
    state.notifications.unshift({ id: uid(), routing_key: 'registration.created', created_at: b.created_at, payload: { user_id: u.id, event_id } });
    return b;
  },
  async myBookings(token) {
    await delay();
    const u = requireAuth(token);
    return state.bookings.filter((b) => b.user_id === u.id);
  },
  async cancelBooking(id, token) {
    await delay();
    const u = requireAuth(token);
    const b = state.bookings.find((x) => x.id === id && x.user_id === u.id);
    if (!b) throw new Error('Not found');
    if (b.status !== 'cancelled') {
      b.status = 'cancelled';
      b.cancelled_at = new Date().toISOString();
      const e = state.events.find((x) => x.id === b.event_id);
      if (e) e.seats_left += 1;
      state.notifications.unshift({ id: uid(), routing_key: 'registration.cancelled', created_at: b.cancelled_at, payload: { user_id: u.id, event_id: b.event_id } });
    }
    return b;
  },

  async notifications() { await delay(); return [...state.notifications]; },
};
