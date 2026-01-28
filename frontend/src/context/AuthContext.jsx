import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { refreshSocketAuth } from "../api/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // helper: attach/remove token to axios
  const setApiToken = (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  // Load user from token on refresh
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // ✅ ensure axios sends token before calling /auth/me
      setApiToken(token);

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("token");
        setApiToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    if (res.data?.requiresOtp) {
      return res.data;
    }

    const token = res.data.token;
    localStorage.setItem("token", token);

    // ✅ set header immediately after login
    setApiToken(token);

    setUser(res.data.user);
    refreshSocketAuth();
    return res.data;
  };

  const verifyOtp = async (email, code) => {
    const res = await api.post("/auth/verify-otp", { email, code });

    const token = res.data.token;
    localStorage.setItem("token", token);
    setApiToken(token);
    setUser(res.data.user);
    refreshSocketAuth();
    return res.data;
  };

  const requestPasswordReset = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  };

  const resetPassword = async (email, token, password) => {
    const res = await api.post("/auth/reset-password", { email, token, password });
    return res.data;
  };

  const register = async (name, email, password) => {
    // keep as-is (register does not log you in yet)
    return api.post("/auth/register", { name, email, password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setApiToken(null);
    setUser(null);
    refreshSocketAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOtp,
        register,
        requestPasswordReset,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
