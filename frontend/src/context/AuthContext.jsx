import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

function readUser() {
  try {
    const raw = localStorage.getItem("evalia-user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const value = useMemo(
    () => ({
      user,
      async login(email, password) {
        const result = await api.login(email, password);
        localStorage.setItem("evalia-token", result.token);
        localStorage.setItem("evalia-user", JSON.stringify(result.user));
        setUser(result.user);
        return result.user;
      },
      logout() {
        localStorage.removeItem("evalia-token");
        localStorage.removeItem("evalia-user");
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
