import React, { useState, useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";

const SheetPopup = () => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTypingText, setShowTypingText] = useState(true);

  const { createChat } = useContext(ChatContext);

  useEffect(() => {
    const timeout = setTimeout(() => setShowTypingText(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sheetUrl) return;
    setLoading(true);
    try {
      await createChat(sheetUrl);
      window.location.reload();
    } catch (err) {
      console.error("⚠️ Failed to start chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  if (isCollapsed) {
    return (
      <div
        className="fixed bottom-8 right-8 bg-[#00C49F] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-3 animate-float cursor-pointer font-nunito"
        onClick={toggleCollapse}
      >
        <span className="text-sm font-semibold animate-blink whitespace-nowrap overflow-hidden">
          ⚡ Start new chat with Battery Bot
        </span>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#00C49F] text-xl shadow-inner">
          🔋
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm font-nunito">
      {/* Branded Background Blobs */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(0,196,159,0.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(30,144,255,0.2),transparent_60%),radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.15),transparent_40%)]" />

      <div className="relative bg-white text-gray-800 p-8 rounded-[2rem] max-w-md w-[90%] shadow-2xl border border-[#C2F5E6] animate-pop">
        <button
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 text-xl transition-all"
          onClick={toggleCollapse}
        >
          ❌
        </button>

        <h2
          className={`text-2xl font-bold text-center mb-6 ${
            showTypingText
              ? "whitespace-nowrap overflow-hidden border-r-2 border-[#00C49F] animate-typewriter"
              : "animate-floatText"
          }`}
        >
          🔋 Inject Sheet & Energize!
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="sheet-url" className="text-sm text-gray-600 font-medium">
            Paste your Google Sheet link below
          </label>
          <input
            type="text"
            id="sheet-url"
            required
            value={sheetUrl}
            disabled={loading}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/..."
            className="p-3 rounded-xl bg-[#F1FAFF] border border-[#00C49F]/40 placeholder:text-gray-400 text-gray-800 focus:ring-2 focus:ring-[#00C49F] outline-none transition"
          />
          <button
            type="submit"
            disabled={loading}
            className={`py-3 rounded-xl text-center font-semibold transition-all shadow-md ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-[#00C49F] text-white hover:bg-[#00a97c] hover:scale-[1.03]"
            }`}
          >
            {loading ? "⏳ Fetching Sheet..." : "⚡ Start the Chat"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-pop { animation: pop 0.3s ease-out; }
        .animate-float { animation: float 2s ease-in-out infinite; }
        .animate-floatText { animation: float 2.5s ease-in-out infinite; }
        .animate-typewriter {
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          animation: typewriter 2s steps(30) 1 normal both;
        }
        .animate-blink { animation: blink 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default SheetPopup;
