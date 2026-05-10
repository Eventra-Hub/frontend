import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthCtx = createContext(null);
const KEY = 'auth';

function decode(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { sub: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}

function normalizeRole(r) {
  return String(r || '').trim().toLowerCase();
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) localStorage.setItem(KEY, JSON.stringify(auth));
    else localStorage.removeItem(KEY);
  }, [auth]);

  const loginWithToken = async (token) => {
    const claims = decode(token) || {};
    setLoading(true);
    try {
      const profile = await api.me(token);
      setAuth({
        token,
        id: profile.id || claims.sub,
        email: profile.email,
        name: profile.name,
        role: normalizeRole(profile.role),
        exp: claims.exp,
      });
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    if (!auth?.token) return;
    try {
      const profile = await api.me(auth.token);
      setAuth((a) => a && { ...a, ...profile, role: normalizeRole(profile.role) });
    } catch {
      setAuth(null);
    }
  };

  const logout = () => setAuth(null);

  return (
    <AuthCtx.Provider value={{ auth, loginWithToken, logout, refresh, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
