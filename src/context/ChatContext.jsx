import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { fetchSheetData } from "../utils/sheetUtils";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const extractSheetName = (url) => {
    try {
      const parts = url.split("/d/")[1]?.split("/");
      return parts?.[0] || "Untitled Sheet";
    } catch (err) {
      console.warn("[extractSheetName] Failed to extract name from URL:", url);
      return "Untitled Sheet";
    }
  };

  const fetchChats = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user?._id) return;

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/chat?userId=${user._id}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(res.data);
    } catch (err) {
      console.error("[fetchChats] Error:", err?.response?.data || err.message);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/message/${chatId}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("[fetchMessages] Error:", err?.response?.data || err.message);
    }
  };

  const handleSetActiveChat = (chat) => {
    setActiveChat(chat);
    if (chat?._id) {
      fetchMessages(chat._id);
    } else {
      setMessages([]);
    }
  };

  const createChat = async (sheetUrl) => {
    if (!user) return;

    const token = localStorage.getItem("token");

    try {
      const sheetData = await fetchSheetData(sheetUrl);
      if (!sheetUrl || !sheetData || Object.keys(sheetData).length === 0) return;

      const sheetName = sheetData.title || extractSheetName(sheetUrl);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/create`,
        {
          userId: user._id,
          sheetUrl,
          sheetData,
          sheetName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newChat = response.data.chat || response.data;
      setChats((prev) => [newChat, ...prev]);
      handleSetActiveChat(newChat);
    } catch (error) {
      console.error("[createChat] Error:", error?.response?.data || error.message);
    }
  };

  const triggerGeminiAnalysis = async (chatId) => {
    if (!chatId) return;

    setGeminiLoading(true);
    setGeminiResponse(null);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gemini/response/${chatId}`
      );

      setGeminiResponse(res.data?.response || "No response received.");
    } catch (error) {
      console.error("[GeminiAnalysis] Error:", error?.response?.data || error.message);
      setGeminiResponse("Error: Failed to fetch Gemini response.");
    } finally {
      setGeminiLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) fetchChats();
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        activeChat,
        setActiveChat: handleSetActiveChat,
        createChat,
        messages,
        setMessages,
        geminiResponse,
        geminiLoading,
        triggerGeminiAnalysis,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
