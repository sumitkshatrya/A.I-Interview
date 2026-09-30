import { BsRobot } from 'react-icons/bs';
import { IoSparkles } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { motion as Motion } from 'framer-motion';
import { auth, provider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

const Auth = ({ isModel = false, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider);
      const user = response.user;

      const result = await axios.post(
        ServerUrl + '/api/auth/google-login',
        {
          name: user.displayName,
          email: user.email,
        },
        { withCredentials: true }
      );

      const userObj = result.data?.data || result.data?.user || result.data;
      dispatch(setUserData(userObj));

      if (isModel && onClose) {
        onClose();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.log("Google Login Error:", error);
      dispatch(setUserData(null));
    }
  };

  return (
    <div className={`w-full ${isModel ? '' : 'min-h-screen bg-[#0B0F17] flex items-center justify-center px-4 py-12'}`}>
      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`w-full ${
          isModel ? 'max-w-md p-6 sm:p-8' : 'max-w-md p-8 sm:p-10'
        } rounded-3xl bg-slate-900/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl text-center space-y-6`}
      >
        {/* Brand Icon Header */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <BsRobot size={22} />
          </div>
          <h1 className="font-extrabold text-lg tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              SK
            </span>
            <span className="text-white"> Interview </span>
            <span className="text-emerald-400">AI</span>
          </h1>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <IoSparkles size={14} className="text-emerald-400 animate-pulse" />
            <span>AI Smart Interview Platform</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
            Welcome to Your AI Career Coach
          </h2>
        </div>

        {/* Subtitle Description */}
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
          Sign in to practice real-time AI mock interviews, get instant feedback, and accelerate your prep.
        </p>

        {/* Google Authentication Button */}
        <div className="pt-2">
          <Motion.button
            onClick={handleGoogleAuth}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-xl text-xs sm:text-sm cursor-pointer border border-slate-200"
          >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </Motion.button>
        </div>

        <p className="text-[10px] text-slate-500 pt-1">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </Motion.div>
    </div>
  );
};

export default Auth;
