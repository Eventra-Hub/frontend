import { createContext, useContext, useEffect, useState } from 'react';

const AuthCtx = createContext(null);
const KEY = 'auth';

function decode(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.sub, role: payload.role, exp: payload.exp };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (auth) localStorage.setItem(KEY, JSON.stringify(auth));
    else localStorage.removeItem(KEY);
  }, [auth]);

  const login = (token) => {
    const claims = decode(token);
    setAuth({ token, ...claims });
  };
  const logout = () => setAuth(null);

  return <AuthCtx.Provider value={{ auth, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
