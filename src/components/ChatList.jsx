import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { FaPlus, FaMessage } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";

const ChatList = ({ extended, setExtended }) => {
  const { chats, setActiveChat, activeChat } = useContext(ChatContext);
  const isLoading = !chats || chats.length === 0;

  return (
    <div
      className={`relative h-full w-full p-4 flex flex-col font-nunito transition-all duration-500 ease-in-out
      bg-gradient-to-br from-[#f1f7ff] to-[#e3fdf5] text-gray-800 border-r border-gray-200 shadow-inner overflow-hidden`}
    >
      {/* Accent Blobs */}
      <div className="absolute -top-24 -left-24 w-[250px] h-[250px] bg-[#00E0B8] opacity-30 rounded-full blur-[120px] -z-10" />
      <div className="absolute -bottom-24 -right-24 w-[250px] h-[250px] bg-[#1E90FF] opacity-30 rounded-full blur-[120px] -z-10" />

      {/* Sidebar Toggle */}
      <div
        className="flex justify-end mb-6 cursor-pointer"
        onClick={() => setExtended((prev) => !prev)}
        title="Toggle Sidebar"
      >
        <IoMenu className="text-gray-500 text-2xl hover:text-[#7D5FFF] transition-transform hover:scale-110" />
      </div>

      {/* Start New Chat */}
      <div
        className="flex items-center justify-center px-4 py-3 mb-6 rounded-xl bg-[#1E90FF] text-white font-semibold cursor-pointer shadow-md hover:scale-[1.05] hover:bg-[#007BFF] transition-all"
        onClick={() => setActiveChat(null)}
        title="Start New Chat"
      >
        <FaPlus className="text-lg" />
        {extended && (
          <span className="ml-2 text-sm whitespace-nowrap transition-opacity duration-300">
            Start New Chat
          </span>
        )}
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-[#00E0B8]/60 scrollbar-track-white/40">
        {isLoading ? (
          <div className="w-10 h-10 border-4 border-transparent border-t-[#00E0B8] border-b-[#7D5FFF] rounded-full animate-spin mx-auto" />
        ) : (
          chats.map((chat, index) => {
            const isActive = activeChat?._id === chat._id;
            const title = chat.sheetData?.title || "Untitled Sheet";

            return (
              <div
                key={chat._id}
                className={`relative flex items-center px-4 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#d4f5ee] text-[#00695C] shadow-[0_0_8px_rgba(0,224,184,0.4)]"
                    : "bg-white text-gray-700 hover:bg-[#f0fbfa]"
                }`}
                onClick={() => setActiveChat(chat)}
                title={title}
              >
                <FaMessage
                  className={`text-lg ${
                    isActive ? "text-[#00BFA6]" : "text-[#7D5FFF]"
                  }`}
                />
                {extended && (
                  <div className="ml-2 overflow-hidden whitespace-nowrap text-ellipsis">
                    {title}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Logout */}
      <div
        className="mt-auto flex items-center justify-center px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#D32F2F] font-semibold cursor-pointer shadow hover:bg-[#FFD6D6] transition-all"
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
        title="Logout"
      >
        <FiLogOut className="text-lg" />
        {extended && (
          <span className="ml-2 text-sm transition-opacity duration-300">
            Logout
          </span>
        )}
      </div>

      <style>{`
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ChatList;
