import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import SheetPopup from "./SheetPopup";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useNavigate } from "react-router-dom";

const MainContent = () => {
  const { user } = useContext(AuthContext);
  const { activeChat } = useContext(ChatContext);
  const navigate = useNavigate();
  const [extended, setExtended] = useState(true);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="w-screen h-screen flex bg-gradient-to-br from-[#dffefc] via-[#e6f9ff] to-[#dcf9ee] text-gray-800 overflow-hidden font-[Inter]">
      
      {/* Sidebar */}
      <div
        className={`h-full transition-all duration-300 ease-in-out ${
          extended ? "w-[22%]" : "w-[5%]"
        } bg-[#f0fcff] border-r border-[#b2f2e9] shadow-inner`}
      >
        <ChatList extended={extended} setExtended={setExtended} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 h-full relative">
        <div className="absolute inset-0 bg-[#ffffffd9] backdrop-blur-[4px] rounded-l-3xl shadow-2xl p-4 border-l border-[#a2eee5]">
          {activeChat ? <ChatWindow /> : <SheetPopup />}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
