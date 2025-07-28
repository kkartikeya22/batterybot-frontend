import axios from "axios";

const API = axios.create({ baseURL: "https://batterybot.onrender.com/api" }); // or your deployed URL

export const sendMessage = (chatId, text) =>
  API.post("/messages", { chatId, sender: "user", text });

export const getMessages = (chatId) =>
  API.get(`/messages/${chatId}`);
