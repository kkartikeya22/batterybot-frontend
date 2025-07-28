import React, { useState } from "react";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

const ChatPage = ({ chatId }) => {
  const [triggerReload, setTriggerReload] = useState(false);

  const handleNewMessages = () => {
    setTriggerReload((prev) => !prev);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#f5f6fa] text-gray-800 font-nunito">
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto shadow-inner bg-white border-b border-gray-200 rounded-b-none rounded-t-2xl p-4 sm:p-6 md:p-8">
        <ChatWindow key={triggerReload} chatId={chatId} />
      </div>

      {/* Message Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-md rounded-t-none rounded-b-2xl">
        <MessageInput chatId={chatId} onNewMessages={handleNewMessages} />
      </div>
    </div>
  );
};

export default ChatPage;
