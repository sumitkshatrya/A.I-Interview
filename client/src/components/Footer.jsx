import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { BsRobot, BsArrowUp, BsBriefcase, BsChatDots, BsClockHistory, BsBuilding, BsShieldCheck } from 'react-icons/bs';
import AuthModel from './AuthModel';

const Footer = () => {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleLinkClick = (path) => {
    if (!userData && path !== '/' && path !== '/pricing') {
      setShowAuth(true);
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0F17] border-t border-slate-800/80 pt-14 pb-10 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Main Grid Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <BsRobot size={20} />
              </div>
              <div className="flex items-center select-none font-black text-lg tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  SK
                </span>
                <span className="text-white ml-1 font-extrabold">Interview</span>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent ml-1 font-bold">
                  AI
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-center md:justify-start gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                All AI Evaluation Engines Operational
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto md:mx-0">
              Autonomous AI Career Intelligence & Bar Raiser Mock Interview platform engineered for US tech market compensation standards ($150k–$350k+).
            </p>
          </div>

          {/* Quick Navigation Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            
            {/* Column 1: Platform Suite */}
            <div className="space-y-3">
              <h4 className="font-extrabold uppercase tracking-wider text-white text-[11px]">
                Career Suite
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => handleLinkClick('/career-hub')} className="hover:text-emerald-400 transition text-left">
                    Career Hub & ATS
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/coach')} className="hover:text-purple-400 transition text-left">
                    AI Coach Workspace
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/history')} className="hover:text-amber-400 transition text-left">
                    Interview History
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/resume-template')} className="hover:text-cyan-400 transition text-left">
                    ATS Resume Template
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Interview Formats */}
            <div className="space-y-3">
              <h4 className="font-extrabold uppercase tracking-wider text-white text-[11px]">
                Practice Modes
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => handleLinkClick('/interview')} className="hover:text-emerald-400 transition text-left">
                    System Architecture
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/interview')} className="hover:text-emerald-400 transition text-left">
                    STAR Behavioral
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/interview')} className="hover:text-emerald-400 transition text-left">
                    DSA Coding Speed Run
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/interview')} className="hover:text-emerald-400 transition text-left">
                    7 AI Personalities
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Enterprise & Access */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h4 className="font-extrabold uppercase tracking-wider text-white text-[11px]">
                Enterprise & Pricing
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => handleLinkClick('/recruiter')} className="hover:text-emerald-400 transition text-left">
                    Recruiter Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick('/pricing')} className="hover:text-emerald-400 transition text-left">
                    Credit Packages
                  </button>
                </li>
                <li>
                  <span className="text-slate-500 block">FAANG Bar-Raiser</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Legal & Scroll to Top Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} SK Interview AI Inc. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 font-bold cursor-pointer"
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <BsArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </footer>
  );
};

export default Footer;
