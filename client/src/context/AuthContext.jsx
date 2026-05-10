import { createContext, useEffect, useMemo, useState } from "react";
import api, { setUnauthorizedHandler } from "../lib/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("devsync_token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("devsync_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("devsync_token")));
  const [error, setError] = useState(null);

  const persistAuth = (nextToken, nextUser) => {
    console.log("[AUTH] Persisting auth", { userId: nextUser?.id });
    setToken(nextToken);
    setUser(nextUser);
    setError(null);
    localStorage.setItem("devsync_token", nextToken);
    localStorage.setItem("devsync_user", JSON.stringify(nextUser));
  };

  const logout = () => {
    console.log("[AUTH] Logging out");
    setToken("");
    setUser(null);
    setError(null);
    localStorage.removeItem("devsync_token");
    localStorage.removeItem("devsync_user");
  };

  const register = async (payload) => {
    console.log("[AUTH] Starting registration", { email: payload.email });
    try {
      if (!payload.email || !payload.password || !payload.name) {
        throw new Error("Email, password, and name are required");
      }

      const { data } = await api.post("/auth/register", payload);
      console.log("[AUTH] Registration successful");
      persistAuth(data.token, data.user);
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Registration failed";
      console.error("[AUTH] Registration error", { message });
      setError(message);
      throw err;
    }
  };

  const login = async (payload) => {
    console.log("[AUTH] Starting login", { email: payload.email });
    try {
      if (!payload.email || !payload.password) {
        throw new Error("Email and password are required");
      }

      const { data } = await api.post("/auth/login", payload);
      console.log("[AUTH] Login successful");
      persistAuth(data.token, data.user);
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Login failed. Please try again.";
      console.error("[AUTH] Login error", { message });
      setError(message);
      throw err;
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        console.log("[AUTH] No token, skipping bootstrap");
        setLoading(false);
        return;
      }

      try {
        console.log("[AUTH] Bootstrapping user profile");
        const { data } = await api.get("/user/profile");
        console.log("[AUTH] User profile fetched", { userId: data.user?.id });
        setUser(data.user);
      } catch (err) {
        console.error("[AUTH] Bootstrap error, logging out", { message: err.message });
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token]);

  const updateUser = (updatedUserData) => {
    const nextUser = { ...user, ...updatedUserData };
    setUser(nextUser);
    localStorage.setItem("devsync_user", JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      loading,
      error,
      setError,
      register,
      login,
      logout,
      updateUser,
    }),
    [token, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
