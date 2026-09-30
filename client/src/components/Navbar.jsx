import { motion as Motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { BsRobot, BsCoin, BsSearch, BsBriefcase, BsChatDots, BsBuilding, BsClockHistory } from 'react-icons/bs';
import { HiOutlineLogout, HiSparkles } from 'react-icons/hi';
import { FaUserAstronaut } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { ServerUrl } from '../App';
import AuthModel from './AuthModel';
import CommandPalette from './CommandPalette';

const Navbar = () => {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowCreditPopup(false);
        setShowUserPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + '/api/auth/logout', { withCredentials: true });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex justify-center">
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl flex justify-between items-center relative"
      >
        {/* Brand & Nav */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
            aria-label="Go to home"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              <BsRobot size={20} />
            </div>
            <div className="text-left hidden sm:block">

            <h1 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                <span className="blue-gradient-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  SK
                </span>

                  <span className="text-white">
                    Interview
                  </span>

                  <span className="text-emerald-400">
                    AI
                  </span>
              </h1>


              <span className="text-[10px] font-mono text-emerald-400 block -mt-1 uppercase tracking-wider">
                Career Intelligence
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            {[
              { path: '/career-hub', label: 'Career Hub', icon: <BsBriefcase className="text-blue-400" /> },
              { path: '/coach', label: 'AI Coach', icon: <BsChatDots className="text-purple-400" /> },
              { path: '/history', label: 'History', icon: <BsClockHistory className="text-amber-400" /> },
              { path: '/recruiter', label: 'Recruiter Mode', icon: <BsBuilding className="text-emerald-400" /> }
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  if (!userData && link.path !== '/') setShowAuth(true);
                  else navigate(link.path);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition ${
                  isActive(link.path)
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div ref={popupRef} className="flex items-center gap-3 relative">
          {/* Command Palette Button */}
          <button
            onClick={() => setShowPalette(true)}
            className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 text-xs px-3.5 py-2 rounded-xl transition"
            title="Open Command Palette (Ctrl+K)"
          >
            <BsSearch size={13} />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 bg-slate-950 text-slate-500 rounded border border-slate-800 text-[10px] font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Credits Badge */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-amber-500/40 px-3.5 py-2 rounded-xl text-xs hover:bg-slate-800 transition font-bold text-slate-200"
              aria-label="Open credits menu"
            >
              <BsCoin size={16} className="text-amber-400" />
              <span>{userData?.credits || 0}</span>
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-900 shadow-2xl border border-slate-800 rounded-2xl p-5 z-50 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Need additional credits for high-tier FAANG mock interviews?
                </p>
                <button
                  onClick={() => {
                    setShowCreditPopup(false);
                    navigate('/pricing');
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition shadow-md"
                >
                  Buy More Credits
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-emerald-400 hover:border-emerald-500 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition"
              aria-label="Open account menu"
            >
              {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUserAstronaut size={16} />}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-64 bg-slate-900 shadow-2xl border border-slate-800 rounded-2xl p-4 z-50 space-y-2">
                <div className="border-b border-slate-800 pb-3">
                  <p className="text-sm font-extrabold text-white truncate">{userData?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{userData?.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate('/career-hub');
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition text-left flex items-center gap-2 border border-slate-800"
                >
                  <BsBriefcase className="text-blue-400" /> Career Hub
                </button>

                <button
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate('/history');
                  }}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs transition text-left flex items-center gap-2 border border-slate-800"
                >
                  <BsClockHistory className="text-amber-400" /> Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-2 px-3 rounded-xl text-xs transition text-center flex items-center gap-2 justify-center border border-red-500/20 mt-2"
                >
                  <HiOutlineLogout size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </Motion.div>
    </header>

    {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} />
  </>
);
};

export default Navbar;
