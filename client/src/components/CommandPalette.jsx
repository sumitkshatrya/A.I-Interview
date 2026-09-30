import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaPlay,
  FaFileAlt,
  FaChartLine,
  FaRobot,
  FaUserCheck,
  FaHistory,
  FaTimes
} from 'react-icons/fa';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'start-interview',
      title: 'Start AI Mock Interview',
      desc: 'Adaptive voice/text interview with personality selection',
      icon: <FaPlay className="text-emerald-400" />,
      action: () => { navigate('/interview'); onClose(); }
    },
    {
      id: 'career-hub',
      title: 'Resume & JD Intelligence Hub',
      desc: 'Analyze resume, target JD, match score & bullet improver',
      icon: <FaFileAlt className="text-blue-400" />,
      action: () => { navigate('/career-hub'); onClose(); }
    },
    {
      id: 'skill-graph',
      title: 'Skill Graph & Mastery Tree',
      desc: 'Inspect weak and strong competencies over time',
      icon: <FaChartLine className="text-amber-400" />,
      action: () => { navigate('/career-hub?tab=skills'); onClose(); }
    },
    {
      id: 'ai-coach',
      title: 'Ask AI Career Coach',
      desc: 'Strategic career advice, 7-day preparation plans & insights',
      icon: <FaRobot className="text-purple-400" />,
      action: () => { navigate('/coach'); onClose(); }
    },
    {
      id: 'history',
      title: 'View Interview History',
      desc: 'Past reports, score trends & question breakdowns',
      icon: <FaHistory className="text-cyan-400" />,
      action: () => { navigate('/history'); onClose(); }
    },
    {
      id: 'recruiter',
      title: 'Recruiter Mode & Invites',
      desc: 'Issue candidate interview links & review evaluation reports',
      icon: <FaUserCheck className="text-emerald-400" />,
      action: () => { navigate('/recruiter'); onClose(); }
    }
  ];

  const filteredCommands = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden"
        >
          <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950">
            <FaSearch className="text-slate-500 mr-3" />
            <input
              type="text"
              placeholder="Search actions or command (Ctrl+K)..."
              className="w-full bg-transparent outline-none text-white text-sm sm:text-base placeholder-slate-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-500 hover:text-white rounded-lg"
            >
              <FaTimes />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filteredCommands.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No commands found matching "{query}".
              </div>
            ) : (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/80 transition text-left group border border-transparent hover:border-slate-700/80"
                >
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {cmd.title}
                    </p>
                    <p className="text-xs text-slate-400">{cmd.desc}</p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Tip: Use <kbd className="px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800 text-[10px]">Ctrl+K</kbd> to toggle</span>
            <span>ESC to close</span>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
