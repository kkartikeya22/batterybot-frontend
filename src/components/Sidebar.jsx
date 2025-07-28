import React, { useContext, useState } from "react"
import { IoMenu, IoSettings } from "react-icons/io5"
import { FaMessage, FaPlus, FaQuestion } from "react-icons/fa6"
import { MdHistory } from "react-icons/md"
import { Context } from "../context/Context"

const Sidebar = () => {
  const [extended, setExtended] = useState(true)
  const {
    prevPrompt,
    setRecentPrompt,
    setShowResult,
    conversation,
  } = useContext(Context)

  // 🧠 Only show the conversation that contains this prompt
  const loadPrompt = (prompt) => {
    setRecentPrompt(prompt)
    setShowResult(true)

    // (Optional) You could scroll to that conversation block if you implement refs
    // For now, this just brings up the chat section with loaded context
  }

  return (
    <div
      className={`
        h-screen transition-all duration-500 ease-in-out
        flex flex-col justify-between font-[Nunito]
        ${extended ? "w-64" : "w-20"}
        bg-white/40 backdrop-blur-xl border-r border-slate-200/20
        shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        rounded-r-2xl
      `}
    >
      {/* Top Section */}
      <div className="p-4">
        {/* Toggle Button */}
        <div
          className="flex justify-end mb-4 text-slate-500 hover:text-cyan-700 transition cursor-pointer"
          onClick={() => setExtended(!extended)}
        >
          <IoMenu className="text-xl" />
        </div>

        {/* New Chat Button */}
        <div
          onClick={() => window.location.reload()} // 🔄 OR call newChat() from context if desired
          className="flex items-center px-4 py-2 mb-6 rounded-xl
            bg-gradient-to-r from-cyan-500/80 to-emerald-400/70
            text-white font-semibold
            shadow-[inset_0_0_1px_rgba(255,255,255,0.2),0_4px_16px_rgba(56,189,248,0.25)]
            hover:shadow-[0_6px_20px_rgba(45,212,191,0.3)]
            hover:ring-1 hover:ring-cyan-300
            hover:scale-[1.02] transition-all duration-300
            cursor-pointer"
        >
          <FaPlus className="text-sm" />
          <span
            className={`text-sm font-bold whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
              ${extended ? "opacity-100 ml-3 max-w-[160px]" : "opacity-0 ml-0 max-w-0"}
            `}
          >
            New Chat
          </span>
        </div>

        {/* Recent Prompts (from conversation) */}
        <div className="overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-blue-200 pr-1">
          {[...new Set(conversation.map((c) => c.prompt))].map((prompt, index) => (
            <div
              key={index}
              onClick={() => loadPrompt(prompt)}
              className="flex items-center px-4 py-2 mb-2 rounded-xl
                text-cyan-800 bg-white/70 border border-transparent
                hover:border-cyan-100 hover:bg-cyan-50 hover:text-cyan-700
                hover:shadow-md transition-all duration-300 cursor-pointer
              "
            >
              <FaMessage className="text-sm" />
              <span
                className={`text-sm truncate font-medium whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
                  ${extended ? "opacity-100 ml-3 max-w-[160px]" : "opacity-0 ml-0 max-w-0"}
                `}
              >
                {prompt.slice(0, 22)}...
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 pb-6 flex flex-col gap-3">
        {/* Help */}
        <div className="flex items-center px-4 py-2 rounded-xl text-slate-400 bg-white/60 border border-slate-100/40 hover:bg-teal-50 hover:text-teal-600 cursor-not-allowed transition-all">
          <FaQuestion className="text-sm" />
          <span
            className={`text-sm italic whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
              ${extended ? "opacity-100 ml-3 max-w-[160px]" : "opacity-0 ml-0 max-w-0"}
            `}
          >
            Help
          </span>
        </div>

        {/* Activity */}
        <div className="flex items-center px-4 py-2 rounded-xl text-slate-400 bg-white/60 border border-slate-100/40 hover:bg-teal-50 hover:text-teal-600 cursor-not-allowed transition-all">
          <MdHistory className="text-sm" />
          <span
            className={`text-sm italic whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
              ${extended ? "opacity-100 ml-3 max-w-[160px]" : "opacity-0 ml-0 max-w-0"}
            `}
          >
            Activity
          </span>
        </div>

        {/* Settings */}
        <div className="flex items-center px-4 py-2 rounded-xl text-slate-400 bg-white/60 border border-slate-100/40 hover:bg-teal-50 hover:text-teal-600 cursor-not-allowed transition-all">
          <IoSettings className="text-sm" />
          <span
            className={`text-sm italic whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden
              ${extended ? "opacity-100 ml-3 max-w-[160px]" : "opacity-0 ml-0 max-w-0"}
            `}
          >
            Settings
          </span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
