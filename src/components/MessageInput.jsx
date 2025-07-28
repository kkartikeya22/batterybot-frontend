import React, { useState } from "react";
import { sendMessage } from "../api/messageApi";

const MessageInput = ({ chatId, onNewMessages }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await sendMessage(chatId, text);
      onNewMessages(res.data); // returns [userMsg, botMsg]
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center px-4 py-3 border-t border-gray-300 bg-[#f9fcfd]">
      <input
        type="text"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-4 py-2 rounded-xl border border-cyan-400/40 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
      />
      <button
        onClick={handleSend}
        disabled={loading}
        className={`ml-3 px-6 py-2 rounded-xl text-sm font-medium transition-all shadow-md ${
          loading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-[#00E0B8] to-[#1E90FF] text-[#0A0F2C] hover:scale-[1.03] hover:shadow-cyan-400/40"
        }`}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default MessageInput;
