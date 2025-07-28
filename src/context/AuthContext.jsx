import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🔧 Set or remove token from axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    } else {
      delete axios.defaults.headers.common["Authorization"];

    }
  };

  // 🔐 Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("https://batterybot.onrender.com/api/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setAuthToken(token);
      setUser(user);

      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Login failed";
      console.error("❌ Login error:", errorMsg);
      setAuthError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✍️ Register
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post("https://batterybot.onrender.com/api/auth/register", {
        username,
        email,
        password,
      });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "Registration failed";
      console.error("❌ Registration error:", errorMsg);
      setAuthError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setAuthToken(null);
  };

  // 🕵️ Initial check on app load
  const checkLoggedIn = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("⚠️ No token found in localStorage");
      setCheckingAuth(false);
      return;
    }

    setAuthToken(token);

    try {
      const res = await axios.get("https://batterybot.onrender.com/api/auth/profile");

      if (res.data && res.data._id) {
        setUser(res.data);
      } else {
        console.warn("⚠️ Invalid user data in profile response:", res.data);
        logout();
      }
    } catch (err) {
      console.error("❌ Profile fetch error:", err.response?.data || err.message);
      logout();
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authError,
        loading,
        checkingAuth,
        login,
        register,
        logout,
      }}
    >
      {checkingAuth ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#e6fcff] via-[#d7e9ff] to-[#e4e9ff] text-center px-4">
          {/* Cute spinner */}
          <div className="w-14 h-14 border-8 border-white/30 border-t-[#00c49f] rounded-full animate-spin shadow-md"></div>

          {/* Cute text */}
          <p className="mt-6 text-xl sm:text-2xl font-semibold text-[#1b2d57] animate-pulse tracking-wide">
            🔋 BatteryBot is verifying your identity...
          </p>

          {/* Optional helper */}
          <p className="mt-1 text-sm text-[#5b6c94] opacity-80 italic">
            Hang tight, charging up the dashboard ⚡
          </p>
        </div>
      ) : children}


    </AuthContext.Provider>
  );
};
const styles = {
  authCheckContainer: {
    height: "100vh",
    width: "100vw",
    background: "radial-gradient(circle at 30% 30%, #1e1e3f, #0c0c1f)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    color: "#fff",
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
    textAlign: "center",
    position: "fixed",
    top: 0,
    left: 0,
  },

  checkingText: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#D6D6FF",
    letterSpacing: "1px",
    marginTop: "1rem",
    animation: "glowText 2s ease-in-out infinite",
  },

  spinner: {
    width: "3.5rem",
    height: "3.5rem",
    border: "6px solid rgba(255, 255, 255, 0.1)",
    borderTop: "6px solid #6C63FF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes glowText {
  0%, 100% { color: #D6D6FF; text-shadow: 0 0 10px #6C63FF; }
  50% { color: #ffffff; text-shadow: 0 0 20px #9e8bff; }
}
`;

const styleTag = document.createElement("style");
styleTag.appendChild(document.createTextNode(keyframes));
document.head.appendChild(styleTag);
