import React, { useContext, useState, useRef, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import SheetPopup from "./SheetPopup";
import axios from "axios";
import "../index.css";
import { ChevronDown, ChevronUp } from "lucide-react";


const Typewriter = ({ text = "", className = "" }) => {
    const [visibleText, setVisibleText] = useState("");
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        if (!text || charIndex >= text.length) return;

        const timeout = setTimeout(() => {
            setVisibleText(text.slice(0, charIndex + 1));
            setCharIndex(prev => prev + 1);
        }, 15); // Typing speed in ms

        return () => clearTimeout(timeout);
    }, [charIndex, text]);

    const parseMarkdown = (input) => {
        return input
            .split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
            .filter(Boolean)
            .map((chunk, i) => {
                if (/^\*\*[^*]+\*\*$/.test(chunk)) {
                    return (
                        <strong key={i} className="font-semibold text-blue-800">
                            {chunk.slice(2, -2)}
                        </strong>
                    );
                }
                if (/^_[^_]+_$/.test(chunk)) {
                    return (
                        <em key={i} className="italic text-gray-700">
                            {chunk.slice(1, -1)}
                        </em>
                    );
                }
                return <span key={i}>{chunk}</span>;
            });
    };

    return (
        <p className={`whitespace-pre-wrap leading-relaxed ${className}`}>
            {parseMarkdown(visibleText)}
        </p>
    );
};

const ChatWindow = () => {
    const { activeChat, messages, setMessages, setActiveChat } = useContext(ChatContext);
    const [showRefetchPopup, setShowRefetchPopup] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isFetchingChat, setIsFetchingChat] = useState(false);
    const [selectedSheetKey, setSelectedSheetKey] = useState(""); // NEW
    const [showThought, setShowThought] = useState({});

    const bottomRef = useRef(null);

    useEffect(() => {
        if (!activeChat?._id) return;

        const fetchFullChat = async () => {
            try {
                setIsFetchingChat(true);
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/api/chat/${activeChat._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const chat = res.data;

                setMessages(chat.messages || []);
                setActiveChat(chat);

                const firstKey = Object.keys(chat?.sheetData?.data || {})[0];
                setSelectedSheetKey(firstKey);
            } catch (err) {
                console.error("[fetchFullChat] Error:", err);
            } finally {
                setIsFetchingChat(false);
            }
        };

        fetchFullChat();
    }, [activeChat?._id]); // 🔁 Trigger on full activeChat object to re-fetch every time


    const handleRefetchSheet = async () => {
        if (!activeChat?._id) return;
        setIsRefetching(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/chat/${activeChat._id}/refetch-sheet`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data?.updatedSheetData) {
                setActiveChat((prev) => ({
                    ...prev,
                    sheetData: response.data.updatedSheetData,
                }));
                const keys = Object.keys(response.data.updatedSheetData?.data || {});
                setSelectedSheetKey(keys[0] || "");
            }
        } catch (error) {
            console.error("[handleRefetchSheet] Refetch failed:", error);
        } finally {
            setIsRefetching(false);
            setShowRefetchPopup(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeChat?._id) return;

        const userText = inputText;
        const selectedData = activeChat?.sheetData?.data?.[selectedSheetKey];


        setInputText("");
        setIsSending(true);

        const userMessage = {
            _id: `user-${Date.now()}`,
            text: userText,
            type: "user",
            sender: "user",
        };

        const tempMessage = {
            _id: "loading-bot",
            text: "Charging neutral cells to analyze the data...",
            type: "bot",
            sender: "assistant",
            temp: true,
        };

        setMessages((prev) => [...prev, userMessage, tempMessage]);

        try {
            const token = localStorage.getItem("token");

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/message/${activeChat._id}`,
                {
                    chatId: activeChat._id,
                    sender: "user",
                    text: userText,
                    type: "user",
                    sheetData: selectedData,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );


            const assistantMessages = res.data.filter(
                (msg) => msg.sender === "assistant"
            );


            const processedMessages = assistantMessages.map((msg) => {
                return {
                    _id: msg._id,
                    sender: msg.sender,
                    type: msg.type,
                    text: msg.text || msg.answer || "", // fallback
                    thought: msg.thought || null,
                    answer: msg.answer || null,
                };
            });


            setMessages((prev) => [...prev.slice(0, -1), ...processedMessages]);

        } catch (err) {
            console.error("[handleSendMessage] Error:", err);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                {
                    _id: "error-bot",
                    text: "⚠️ Error generating response from Battery Bot.",
                    type: "bot",
                    sender: "assistant",
                },
            ]);
        } finally {
            setIsSending(false);
        }
    };




    if (!activeChat) {
        return <div className="flex-1 bg-[#0f111a] flex items-center justify-center rounded-2xl"><p className="text-slate-500 italic text-base">Select a chat to begin</p></div>;
    }

    if (!activeChat.sheetData) {
        return <div className="flex-1 bg-[#0f111a] flex items-center justify-center rounded-2xl"><SheetPopup onClose={(sheetData) => {
            if (sheetData) {
                setActiveChat((prev) => ({ ...prev, sheetData }));
                const keys = Object.keys(sheetData?.data || {});
                setSelectedSheetKey(keys[0] || "");
            }
        }} /></div>;
    }


    const sheetKeys = Object.keys(activeChat.sheetData.data || {});

    return (
        <div className="bg-gradient-to-br from-[#e0fff4] via-[#e6f7ff] to-[#fdf2ff] text-gray-800 h-full flex flex-col p-4 font-nunito rounded-2xl shadow-2xl border border-[#c3f8f1] transition-all duration-300">

            <div className="rounded-2xl p-3 w-full max-w-full flex flex-col gap-3 bg-[#fefefe] border border-[#b2f2e5] shadow-xl">

                {/* Title + Refetch */}
                <div className="flex justify-between items-center px-3 py-2 bg-[#e6fff5] border border-[#00c49f] rounded-xl shadow-md">
                    <h2 className="text-sm sm:text-base font-extrabold text-[#007e5d] tracking-wide uppercase">
                        {activeChat.sheetData.title || "Untitled Sheet"}
                    </h2>

                    <button
                        onClick={() => setShowRefetchPopup(true)}
                        className="flex items-center gap-1 bg-[#ff6b6b] hover:bg-[#e63e3e] text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-md transition-transform duration-200 hover:scale-105"
                    >
                        <span>Refetch</span>
                        <span className="text-base">⟳</span>
                    </button>
                </div>

                {/* Sheet Selector */}
                <div className="flex items-center gap-2 px-3 py-2 bg-[#fff9e6] border border-[#ffc107] rounded-xl shadow-md">
                    <label
                        htmlFor="sheetSelector"
                        className="text-[#ff8f00] font-semibold text-xs"
                    >
                        Sheet:
                    </label>
                    <select
                        id="sheetSelector"
                        value={selectedSheetKey}
                        onChange={(e) => setSelectedSheetKey(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#ffa000] text-[#4a3f00] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa000] transition-all duration-200"
                    >
                        {sheetKeys.map((key) => (
                            <option
                                key={key}
                                value={key}
                                className="bg-white text-[#00b894] font-semibold"
                            >
                                {key}
                            </option>
                        ))}
                    </select>
                </div>

            </div>



            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-2 py-4 bg-white rounded-xl border border-[#c7f4ec] shadow-inner transition-all duration-300">
                {isFetchingChat ? (
                    <p className="text-center text-gray-400 italic mt-8">Loading chat...</p>
                ) : messages.length === 0 ? (
                    <div className="w-full px-4 sm:px-6 md:px-10 py-10 bg-[#e6fcff] rounded-2xl shadow-inner space-y-5 animate-in fade-in zoom-in-75">

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#00c49f] drop-shadow-sm">
                            Hello, it's BatteryBot
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg sm:text-xl font-semibold text-[#6f7faa]">
                            What do you want to know aboutthe sheet just injected
                        </p>

                        {/* Heads-up Box */}
                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm px-5 py-3 rounded-xl shadow-sm flex items-start gap-3 max-w-3xl">
                            <span className="text-base mt-0.5">⚠️</span>
                            <span>
                                <strong>Heads-up!</strong> This masterpiece looks <em>way</em> better on a bigger screen.
                                Mobile’s cool, but it might throw a tantrum or two. 😅
                            </span>
                        </div>

                    </div>
                ) : (
                    messages.map((msg, i) => {
                        if (msg.sender === "user") {
                            return (
                                <div key={i} className="self-end flex items-end gap-3 max-w-[85%] animate-in fade-in zoom-in-75">

                                    {/* Message Bubble */}
                                    <div className="px-5 py-3 bg-[#e6fff7] text-gray-800 rounded-2xl rounded-br-md shadow-md text-sm font-medium leading-relaxed tracking-wide border border-[#b3f5dc] backdrop-blur-sm">
                                        {msg.text}
                                    </div>

                                    {/* User Avatar */}
                                    <div className="w-9 h-9 flex items-center justify-center rounded-full shadow-lg border-2 border-[#b3f5dc] bg-white p-0.5">
                                        <img
                                            src="https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg"
                                            alt="User"
                                            className="w-6 h-6 object-cover rounded-full"
                                        />
                                    </div>
                                </div>
                            );
                        }



                        if (msg.sender === "assistant") {
                            const answer = msg.answer || msg.text || "";
                            const thought = msg.thought || "";
                            const sections = answer.split(/-{3,}/g).map(s => s.trim()).filter(Boolean);

                            return (
                                <div key={i} className="self-start flex items-start gap-3 max-w-[90%]">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full bg-white border border-[#86d6ff] shadow-md">
                                        <img
                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShNKrPA0VvZVr1vP3s_uPLoMNhFpPyK34Fbg&s"
                                            alt="Assistant Bot"
                                            className="w-6 h-6 object-contain rounded-full"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 w-full">
                                        {/* 💭 Thought Block */}
                                        {thought && (
                                            <div className="bg-gradient-to-br from-[#f8fafd] to-[#eef4ff] border border-[#c7dcf7] rounded-xl shadow-md transition-all">
                                                <div
                                                    onClick={() => setShowThought((prev) => ({ ...prev, [i]: !prev[i] }))}
                                                    className="w-full px-4 py-2 flex justify-between items-center cursor-pointer bg-[#e9f2ff] hover:bg-[#dfe9fa] rounded-t-xl border-b border-[#d4e4f7] text-[#1e3a5f] font-medium tracking-wide text-[15px] select-none"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">💭</span>
                                                        <span className="text-[15px]">AI's Thought (tap to {showThought?.[i] ? "hide" : "view"})</span>
                                                    </div>
                                                    <span className="text-[18px] text-[#4b6a88]">
                                                        {showThought?.[i] ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                                                    </span>

                                                </div>

                                                {/* Formatted Thought */}
                                                {showThought?.[i] && (
                                                    <div className="px-4 pb-4 pt-1 text-sm text-gray-700 leading-relaxed space-y-2">
                                                        {(() => {
                                                            const lines = thought.split("\n").map(l => l.trimEnd());
                                                            let buffer = [];
                                                            const elements = [];

                                                            const parseMarkdown = (text) =>
                                                                text
                                                                    .split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
                                                                    .filter(Boolean)
                                                                    .map((chunk, idx) => {
                                                                        if (/^\*\*[^*]+\*\*$/.test(chunk)) {
                                                                            return <strong key={idx} className="font-semibold text-[#0e4b7f]">{chunk.slice(2, -2)}</strong>;
                                                                        } else if (/^_[^_]+_$/.test(chunk)) {
                                                                            return <em key={idx} className="italic">{chunk.slice(1, -1)}</em>;
                                                                        }
                                                                        return chunk;
                                                                    });

                                                            const renderBufferedTable = () => {
                                                                const parsedRows = buffer
                                                                    .map(row =>
                                                                        row
                                                                            .split("|")
                                                                            .map(cell => cell.trim())
                                                                            .filter(cell => cell.length > 0)
                                                                    )
                                                                    .filter(row => row.length > 1);

                                                                if (parsedRows.length === 0) return null;

                                                                const maxCols = Math.max(...parsedRows.map(r => r.length));
                                                                return (
                                                                    <table className="w-full my-3 border border-[#addbff] rounded-md text-[14px] text-left overflow-hidden shadow-sm">
                                                                        <tbody>
                                                                            {parsedRows.map((row, rowIdx) => (
                                                                                <tr key={rowIdx} className="even:bg-[#ebf8ff]">
                                                                                    {Array.from({ length: maxCols }).map((_, colIdx) => (
                                                                                        <td key={colIdx} className="border border-[#d6ebfa] px-3 py-2 bg-white">
                                                                                            {parseMarkdown(row[colIdx] || "")}
                                                                                        </td>
                                                                                    ))}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                );
                                                            };

                                                            const getDynamicColorClass = (text) => {
                                                                const t = text.toLowerCase();

                                                                if (/summary|overview|synopsis|gist/.test(t)) return "text-[#6c63ff]"; // Calm Indigo (neutral summary)
                                                                if (/observation|trend|pattern|noted|seen/.test(t)) return "text-[#00bfa6]"; // Teal (cool analytical tone)
                                                                if (/issue|problem|error|bug|fault|concern/.test(t)) return "text-[#ff6b6b]"; // Soft Red (problem vibe)
                                                                if (/cause|reason|factor|root|source|origin/.test(t)) return "text-[#ffb347]"; // Warm Amber (explanatory)
                                                                if (/impact|effect|result|outcome|consequence/.test(t)) return "text-[#ab47bc]"; // Soft Purple (analytical)
                                                                if (/recommendation|action|suggestion|proposal|advice|next step/.test(t)) return "text-[#4caf50]"; // Green (positive/action)
                                                                if (/analysis|insight|breakdown|exploration|review/.test(t)) return "text-[#42a5f5]"; // Blue (neutral intellect)
                                                                if (/conclusion|final|closing|wrap-up|end/.test(t)) return "text-[#5c6bc0]"; // Calm Slate Blue
                                                                if (/note|important|alert|warning|attention/.test(t)) return "text-[#ffa726]"; // Soft Orange (alert tone)
                                                                if (/question|query|doubt/.test(t)) return "text-[#26c6da]"; // Light Blue (inquisitive tone)
                                                                if (/data|statistic|number|metric/.test(t)) return "text-[#789262]"; // Soft Olive (data heavy)
                                                                if (/goal|objective|target|aim/.test(t)) return "text-[#66bb6a]"; // Healthy Green (aim)

                                                                // ⬆️ Positive Changes → Soft Green
                                                                if (/increase|rise|growth|gain|improve|improvement/.test(t)) return "text-[#81c784]"; // Soft Green

                                                                // ⬇️ Negative Changes → Soft Red
                                                                if (/decrease|drop|decline|fall|loss|reduction/.test(t)) return "text-[#e57373]"; // Soft Red

                                                                // ⬄ Neutral Changes or Variability → Muted Purple
                                                                if (/fluctuation|change|variance|variation/.test(t)) return "text-[#ba68c8]"; // Soft Muted Purple

                                                                return "text-[#757575]"; // Default: Muted Gray
                                                            };




                                                            lines.forEach((line, idx) => {
                                                                const isBullet = /^[-*]\s+/.test(line);
                                                                const isHeader = /^[A-Z].+[:：]$/.test(line);
                                                                const isMarkdownHeader = /^(#{2,4})\s+/.test(line);
                                                                const isLikelyTableRow = /\|/.test(line) && line.split("|").filter(Boolean).length >= 2;
                                                                const isOnlyPipes = /^\|+\s*\|*$/.test(line);

                                                                if (isLikelyTableRow && !isOnlyPipes) {
                                                                    buffer.push(line);
                                                                    return;
                                                                }

                                                                if (buffer.length > 0) {
                                                                    elements.push(<div key={`table-${idx}`}>{renderBufferedTable()}</div>);
                                                                    buffer = [];
                                                                }

                                                                if (isHeader) {
                                                                    elements.push(
                                                                        <h4 key={idx} className={`${getDynamicColorClass(line)} font-semibold text-[15px]`}>
                                                                            {line}
                                                                        </h4>
                                                                    );
                                                                } else if (isMarkdownHeader) {
                                                                    const level = line.match(/^#{2,4}/)[0].length;
                                                                    const content = line.replace(/^#{2,4}/, "").trim();
                                                                    elements.push(
                                                                        React.createElement(
                                                                            `h${level}`,
                                                                            {
                                                                                key: idx,
                                                                                className: "text-[#0e4b7f] font-bold mt-3 mb-1 text-[15px]",
                                                                            },
                                                                            parseMarkdown(content)
                                                                        )
                                                                    );
                                                                } else if (isBullet) {
                                                                    elements.push(
                                                                        <li key={idx} className="ml-6 list-disc text-gray-700 text-[15px] leading-[1.75rem]">
                                                                            {parseMarkdown(line.replace(/^[-*]\s*/, ""))}
                                                                        </li>
                                                                    );
                                                                } else if (line.length > 0) {
                                                                    elements.push(
                                                                        <Typewriter
                                                                            key={idx}
                                                                            text={line}
                                                                            className="text-[15px] text-gray-700 leading-[1.75rem] text-justify"
                                                                        />
                                                                    );
                                                                }
                                                            });

                                                            if (buffer.length > 0) {
                                                                elements.push(<div key="table-end">{renderBufferedTable()}</div>);
                                                            }

                                                            return <div className="space-y-2">{elements}</div>;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* ✅ Final Answer Block */}
                                        <div className="px-5 py-4 bg-[#f4fbff] text-gray-800 rounded-2xl rounded-bl-md border border-[#c2e9ff] shadow-md text-[15px] leading-relaxed tracking-wide flex flex-col gap-5 font-[500]">
                                            {sections.map((sectionText, sectionIdx) => {
                                                const lines = sectionText.split("\n").map(l => l.trimEnd());
                                                let buffer = [];
                                                const elements = [];

                                                const parseMarkdown = (text) =>
                                                    text
                                                        .split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
                                                        .filter(Boolean)
                                                        .map((chunk, idx) => {
                                                            if (/^\*\*[^*]+\*\*$/.test(chunk)) {
                                                                return <strong key={idx} className="font-semibold text-[#0e4b7f]">{chunk.slice(2, -2)}</strong>;
                                                            } else if (/^_[^_]+_$/.test(chunk)) {
                                                                return <em key={idx} className="italic">{chunk.slice(1, -1)}</em>;
                                                            }
                                                            return chunk;
                                                        });

                                                const renderBufferedTable = () => {
                                                    const parsedRows = buffer
                                                        .map(row =>
                                                            row
                                                                .split("|")
                                                                .map(cell => cell.trim())
                                                                .filter(cell => cell.length > 0)
                                                        )
                                                        .filter(row => row.length > 1);

                                                    if (parsedRows.length === 0) return null;

                                                    const maxCols = Math.max(...parsedRows.map(r => r.length));
                                                    return (
                                                        <table className="w-full my-3 border border-[#addbff] rounded-md text-[14px] text-left overflow-hidden shadow-sm">
                                                            <tbody>
                                                                {parsedRows.map((row, rowIdx) => (
                                                                    <tr key={rowIdx} className="even:bg-[#ebf8ff]">
                                                                        {Array.from({ length: maxCols }).map((_, colIdx) => (
                                                                            <td key={colIdx} className="border border-[#d6ebfa] px-3 py-2 bg-white">
                                                                                {parseMarkdown(row[colIdx] || "")}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    );
                                                };

                                                const getDynamicColorClass = (text) => {
                                                    const t = text.toLowerCase();
                                                    if (/summary|overview/.test(t)) return "text-[#0e4b7f]";
                                                    if (/observation|trend/.test(t)) return "text-[#007bff]";
                                                    if (/issue|problem|error/.test(t)) return "text-[#e53935]";
                                                    if (/cause|reason|factor/.test(t)) return "text-[#ff9800]";
                                                    if (/impact|effect/.test(t)) return "text-[#9c27b0]";
                                                    if (/recommendation|action/.test(t)) return "text-[#2e7d32]";
                                                    if (/analysis|insight/.test(t)) return "text-[#6a1b9a]";
                                                    if (/conclusion|final/.test(t)) return "text-[#d81b60]";
                                                    if (/note|important|alert/.test(t)) return "text-[#f9a825]";
                                                    return "text-[#37474f]";
                                                };

                                                lines.forEach((line, lineIdx) => {
                                                    const isBullet = /^[-*]\s+/.test(line);
                                                    const isHeader = /^[A-Z].+[:：]$/.test(line);
                                                    const isMarkdownHeader = /^(#{2,4})\s+/.test(line);
                                                    const isLikelyTableRow = /\|/.test(line) && line.split("|").filter(Boolean).length >= 2;
                                                    const isOnlyPipes = /^\|+\s*\|*$/.test(line);

                                                    if (isLikelyTableRow && !isOnlyPipes) {
                                                        buffer.push(line);
                                                        return;
                                                    }

                                                    if (buffer.length > 0) {
                                                        elements.push(<div key={`table-${lineIdx}`}>{renderBufferedTable()}</div>);
                                                        buffer = [];
                                                    }

                                                    if (isHeader) {
                                                        const colorClass = getDynamicColorClass(line);
                                                        elements.push(
                                                            <h4 key={lineIdx} className={`${colorClass} font-semibold text-[16px] mb-1`}>
                                                                {line}
                                                            </h4>
                                                        );
                                                    } else if (isMarkdownHeader) {
                                                        const level = line.match(/^#{2,4}/)[0].length;
                                                        const content = line.replace(/^#{2,4}/, "").trim();
                                                        elements.push(
                                                            React.createElement(
                                                                `h${level}`,
                                                                {
                                                                    key: lineIdx,
                                                                    className: "text-[#0e4b7f] font-bold mt-3 mb-1 text-[16px]",
                                                                },
                                                                parseMarkdown(content)
                                                            )
                                                        );
                                                    } else if (isBullet) {
                                                        elements.push(
                                                            <li key={lineIdx} className="ml-6 list-disc text-gray-700 text-[15px] leading-[1.75rem]">
                                                                {parseMarkdown(line.replace(/^[-*]\s*/, ""))}
                                                            </li>
                                                        );
                                                    } else if (line.length > 0) {
                                                        elements.push(
                                                            <Typewriter
                                                                key={lineIdx}
                                                                text={line}
                                                                className="text-[15px] text-gray-700 leading-[1.75rem] text-justify"
                                                            />
                                                        );
                                                    }
                                                });

                                                if (buffer.length > 0) {
                                                    elements.push(<div key="table-end">{renderBufferedTable()}</div>);
                                                }

                                                return (
                                                    <div key={sectionIdx} className="mb-1">
                                                        {elements}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }







                        return null;
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Message Input */}
            <div className="flex mt-4 gap-3 items-center px-2 sm:px-4">
                {/* Input Field */}
                <input
                    type="text"
                    placeholder="Please ask Battery Bot your doubts..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isSending}
                    className="flex-1 px-5 py-3 text-base rounded-full border border-[#b2f2e5] bg-[#f6fefe] text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c49f] placeholder:text-[#aaa] transition-all duration-200"
                />

                {/* Send Button */}
                <button
                    onClick={handleSendMessage}
                    disabled={isSending}
                    title="Send message"
                    className="w-12 h-12 bg-[#00c49f] hover:bg-[#00a387] rounded-full shadow-md hover:shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <img
                        src="https://img.icons8.com/?size=100&id=115360&format=png&color=ffffff"
                        alt="Send"
                        className="w-full h-full object-contain p-0.2"
                    />
                </button>



            </div>



            {/* Refetch Popup */}
            {
                showRefetchPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
                        <div className="bg-white/95 border border-[#c2f5e6] rounded-3xl px-7 py-8 w-[330px] text-center shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-75">

                            {/* Title */}
                            <p className="mb-5 text-lg font-bold text-[#00a388] flex items-center justify-center gap-2">
                                <span className="text-2xl animate-bounce">🔄</span>
                                <span>Refetch Sheet Data?</span>
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-4 justify-center mt-2">
                                <button
                                    onClick={handleRefetchSheet}
                                    disabled={isRefetching}
                                    className={`px-6 py-2.5 rounded-full font-bold shadow-md transition-all duration-200 text-white text-sm tracking-wide
            ${isRefetching
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-[#00c49f] hover:bg-[#00a77b] active:scale-95"
                                        }`}
                                >
                                    {isRefetching ? "Fetching..." : "Yes, Refetch"}
                                </button>

                                <button
                                    onClick={() => setShowRefetchPopup(false)}
                                    className="bg-[#ffd6d6] hover:bg-[#ffbaba] text-[#444] px-6 py-2.5 rounded-full font-semibold text-sm shadow-sm transition-all duration-200 active:scale-95"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


        </div >
    );
};
export default ChatWindow;


