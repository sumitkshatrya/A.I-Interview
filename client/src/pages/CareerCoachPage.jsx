import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot,
  FaPaperPlane,
  FaLightbulb,
  FaCheckCircle,
  FaBullseye,
  FaTasks,
  FaRocket,
  FaPlus,
  FaSearch,
  FaTrash,
  FaComments,
  FaChevronRight,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { ServerUrl } from '../App';

// Custom UI Formatter for AI Coach Messages (Dark Glassmorphism Theme)
const FormattedCoachMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedBlocks = [];
  let currentList = [];
  let blockKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      renderedBlocks.push(
        <div key={`list-${blockKey++}`} className="space-y-2 my-3">
          {currentList.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-sm">
              <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5 text-xs" />
              <span className="text-xs text-slate-200 leading-relaxed">
                {parseInlineBold(item)}
              </span>
            </div>
          ))}
        </div>
      );
      currentList = [];
    }
  };

  const parseInlineBold = (content) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('#')) {
      flushList();
      const headerText = trimmed.replace(/^#+\s*/, '');
      const isMain = trimmed.startsWith('# ') || trimmed.startsWith('## ');

      renderedBlocks.push(
        <div key={`header-${blockKey++}`} className={`mt-4 mb-2 ${isMain ? 'pt-2' : ''}`}>
          <div className="flex items-center gap-2">
            {isMain ? (
              <span className="p-1.5 bg-purple-600 text-white rounded-lg text-xs">
                <FaBullseye />
              </span>
            ) : (
              <span className="p-1 bg-purple-500/20 text-purple-300 rounded text-[10px] border border-purple-500/30">
                <FaTasks />
              </span>
            )}
            <h3 className={`font-bold ${isMain ? 'text-base text-white' : 'text-sm text-purple-300'}`}>
              {headerText}
            </h3>
          </div>
        </div>
      );
    }
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const itemContent = trimmed.replace(/^([-*]|\d+\.)\s*/, '');
      currentList.push(itemContent);
    }
    else if (trimmed === '---') {
      flushList();
      renderedBlocks.push(
        <hr key={`hr-${blockKey++}`} className="my-4 border-slate-800" />
      );
    }
    else if (trimmed.toLowerCase().includes('encouragement') || trimmed.toLowerCase().includes('next steps') || trimmed.toLowerCase().includes('action step')) {
      flushList();
      renderedBlocks.push(
        <div key={`callout-${blockKey++}`} className="my-3 p-3.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 text-white rounded-xl shadow-md space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <FaRocket className="text-amber-300" />
            <span>{trimmed.replace(/^#+\s*/, '')}</span>
          </div>
        </div>
      );
    }
    else {
      flushList();
      renderedBlocks.push(
        <p key={`p-${blockKey++}`} className="text-xs text-slate-300 leading-relaxed my-2">
          {parseInlineBold(trimmed)}
        </p>
      );
    }
  });

  flushList();
  return <div className="space-y-1">{renderedBlocks}</div>;
};

const CareerCoachPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  const shortcutPrompts = [
    "What should I practice today?",
    "Why am I weak in system design?",
    "Analyze my last mock interviews",
    "Create a 7-day preparation plan for Senior Full Stack role",
    "How can I improve my behavioral answers using STAR?"
  ];

  const startNewChatState = () => {
    setActiveConversationId(null);
    setMessages([
      {
        sender: 'coach',
        text: `Hello! I am your AI Career Coach & Mentor. I've reviewed your target role, resume, and mock interview history. How can I help accelerate your prep today?`
      }
    ]);
  };

  // Load specific thread messages
  const loadConversationHistory = useCallback(async (convId) => {
    try {
      const res = await axios.get(`${ServerUrl}/api/career/coach/conversation/${convId}`, { withCredentials: true });
      if (res.data.success && res.data.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load conversation history:", err.message);
    }
  }, []);

  // Fetch all user sessions
  const fetchConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const res = await axios.get(ServerUrl + '/api/career/coach/conversations', { withCredentials: true });
      if (res.data.success && res.data.data) {
        setConversations(res.data.data);
        if (res.data.data.length > 0) {
          // Default to most recent session
          const newestId = res.data.data[0]._id;
          setActiveConversationId(newestId);
          loadConversationHistory(newestId);
        } else {
          startNewChatState();
        }
      }
    } catch (err) {
      console.warn("Failed to load conversations:", err.message);
      startNewChatState();
    } finally {
      setConversationsLoading(false);
    }
  }, [loadConversationHistory]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new session via API
  const handleNewChat = async () => {
    try {
      const res = await axios.post(ServerUrl + '/api/career/coach/new', {}, { withCredentials: true });
      if (res.data.success && res.data.data) {
        const newSession = res.data.data;
        setConversations((prev) => [newSession, ...prev]);
        setActiveConversationId(newSession._id);
        setMessages([
          {
            sender: 'coach',
            text: `Hello! I am your AI Career Coach & Mentor. Ask me any question to kick off this strategy session.`
          }
        ]);
        setSidebarOpen(false);
      }
    } catch {
      startNewChatState();
      setSidebarOpen(false);
    }
  };

  // Switch session handler
  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    loadConversationHistory(convId);
    setSidebarOpen(false);
  };

  // Delete session handler
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      const res = await axios.delete(`${ServerUrl}/api/career/coach/conversation/${convId}`, { withCredentials: true });
      if (res.data.success) {
        const updatedList = conversations.filter((c) => c._id !== convId);
        setConversations(updatedList);
        if (activeConversationId === convId) {
          if (updatedList.length > 0) {
            setActiveConversationId(updatedList[0]._id);
            loadConversationHistory(updatedList[0]._id);
          } else {
            startNewChatState();
          }
        }
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
    }
  };

  // Send user message
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await axios.post(
        ServerUrl + '/api/career/coach/chat',
        { message: text, conversationId: activeConversationId },
        { withCredentials: true }
      );

      const replyText = res.data.data.reply;
      const returnedConvId = res.data.data.conversationId;
      const returnedTitle = res.data.data.title;

      const coachReply = { sender: 'coach', text: replyText };
      setMessages((prev) => [...prev, coachReply]);

      if (returnedConvId) {
        setActiveConversationId(returnedConvId);
        // Refresh conversations list to update title / list order
        setConversations((prev) => {
          const exists = prev.some((c) => c._id === returnedConvId);
          if (exists) {
            return prev.map((c) =>
              c._id === returnedConvId ? { ...c, title: returnedTitle || c.title, updatedAt: new Date() } : c
            );
          } else {
            return [{ _id: returnedConvId, title: returnedTitle || 'New Coaching Session', updatedAt: new Date() }, ...prev];
          }
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'coach', text: 'Sorry, I ran into a temporary issue fetching insights. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || 'Untitled Session').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl">
              <FaRobot size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Career Coach</h2>
              <p className="text-[10px] text-purple-400 font-medium">
                {conversations.find((c) => c._id === activeConversationId)?.title || 'Strategy Workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition"
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {/* Main Grid Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* Left Sidebar: Session Search & Chat History */}
          <div
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } lg:block lg:col-span-4 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 flex flex-col h-[650px] shadow-2xl relative backdrop-blur-md`}
          >
            {/* Top action: New Chat button */}
            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mb-4 group text-sm"
            >
              <FaPlus className="text-xs group-hover:rotate-90 transition-transform duration-300" />
              <span>New Strategy Chat</span>
            </button>

            {/* Search Input Bar */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search coach chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 outline-none focus:border-purple-500/60 transition placeholder-slate-500"
              />
            </div>

            {/* Conversations List Header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FaComments className="text-purple-400 text-xs" />
                Saved Sessions ({filteredConversations.length})
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {conversationsLoading ? (
                <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
                  Loading saved sessions...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4 text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-2xl">
                  {searchQuery ? 'No matching chat found.' : 'No sessions yet. Click "New Strategy Chat" to start!'}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv._id === activeConversationId;
                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id)}
                      className={`group p-3 rounded-2xl cursor-pointer transition border flex items-center justify-between gap-2 ${
                        isActive
                          ? 'bg-purple-950/40 border-purple-500/40 shadow-inner'
                          : 'bg-slate-950/50 hover:bg-slate-800/50 border-slate-800/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`p-2 rounded-xl text-xs shrink-0 ${
                            isActive ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          <FaRobot />
                        </div>
                        <div className="overflow-hidden">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isActive ? 'text-purple-200' : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {conv.title || 'Untitled Session'}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </p>
                        </div>
                      </div>

                      {/* Trash Delete button */}
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete Session"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Panel: Active Chat Thread */}
          <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl p-4 sm:p-6 backdrop-blur-md justify-between">
            {/* Top Workspace Bar */}
            <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg">
                  <FaRobot size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Strategic Intelligence Workspace
                  </span>
                  <h1 className="text-lg font-extrabold text-white leading-tight">
                    {conversations.find((c) => c._id === activeConversationId)?.title || 'AI Career Coach & Mentor'}
                  </h1>
                </div>
              </div>
            </div>

            {/* Quick Prompts Carousel */}
            <div className="flex gap-2 overflow-x-auto py-2 my-2 no-scrollbar">
              {shortcutPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="bg-slate-950 hover:bg-slate-800 text-purple-300 border border-slate-800 hover:border-purple-500/40 text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <FaLightbulb className="text-amber-400 text-[10px]" />
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar my-2">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <Motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[85%] p-4 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold rounded-br-none text-xs sm:text-sm shadow-md'
                          : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p className="text-xs sm:text-sm font-bold">{msg.text}</p>
                      ) : (
                        <FormattedCoachMessage text={msg.text} />
                      )}
                    </div>
                  </Motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-purple-500/30 text-purple-300 p-3.5 rounded-2xl text-xs font-semibold animate-pulse flex items-center gap-2">
                    <FaRobot className="text-purple-400" />
                    AI Coach is analyzing your request & preparing insights...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask your coach anything (e.g. 'How should I practice today?')..."
                className="flex-1 bg-slate-950 p-3.5 rounded-2xl text-xs sm:text-sm outline-none border border-slate-800 focus:border-purple-500/80 transition text-white placeholder-slate-500 shadow-inner"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-3.5 rounded-2xl transition shadow-lg disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerCoachPage;
