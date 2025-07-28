import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/LoginForm";
import Register from "./components/Auth/RegisterForm";
import MainContent from "./components/MainContent";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import './index.css';

const AppRoutes = () => {
  const { checkingAuth, user } = useContext(AuthContext);


  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen text-cyan-300 text-lg font-semibold tracking-wide">
        Loading authentication...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainContent />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

const App = () => {

  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#0f111a] to-[#1c1f2b] text-white">
            <AppRoutes />
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
