import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" }); // or your deployed URL

export const sendMessage = (chatId, text) =>
  API.post("/messages", { chatId, sender: "user", text });

export const getMessages = (chatId) =>
  API.get(`/messages/${chatId}`);
