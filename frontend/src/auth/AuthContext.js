import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, AUTH_LOST_EVENT } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("examEvalUser");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);
  const sessionGen = useRef(0);
  const restoreController = useRef(null);

  const clearSession = () => {
    localStorage.removeItem("examEvalToken");
    localStorage.removeItem("examEvalUser");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("examEvalToken");
    if (!token) {
      setReady(true);
      return undefined;
    }
    const gen = sessionGen.current;
    const controller = new AbortController();
    restoreController.current = controller;
    api("/api/auth/me", { signal: controller.signal })
      .then((data) => {
        if (gen !== sessionGen.current) return;
        setUser(data.user);
        localStorage.setItem("examEvalUser", JSON.stringify(data.user));
      })
      .catch((error) => {
        if (gen !== sessionGen.current || error?.name === "AbortError") return;
        clearSession();
      })
      .finally(() => {
        if (gen === sessionGen.current) setReady(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onAuthLost = () => {
      sessionGen.current += 1;
      restoreController.current?.abort();
      setUser(null);
      setReady(true);
    };
    window.addEventListener(AUTH_LOST_EVENT, onAuthLost);
    return () => window.removeEventListener(AUTH_LOST_EVENT, onAuthLost);
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    async login(email, password, role) {
      sessionGen.current += 1;
      restoreController.current?.abort();
      const gen = sessionGen.current;
      const data = await api("/api/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password, role })
      });
      if (gen !== sessionGen.current) return data.user;
      localStorage.setItem("examEvalToken", data.token);
      localStorage.setItem("examEvalUser", JSON.stringify(data.user));
      setUser(data.user);
      setReady(true);
      return data.user;
    },
    logout() {
      sessionGen.current += 1;
      restoreController.current?.abort();
      clearSession();
      setReady(true);
    }
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
