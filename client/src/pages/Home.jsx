import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModel from "../components/AuthModel";
import { motion as Motion } from "framer-motion";
import {
  BsPlayFill,
  BsFileEarmarkText,
  BsRobot,
  BsArrowRight,
  BsBarChartLine,
  BsShieldCheck,
  BsLightningChargeFill,
  BsCpuFill,
  BsGraphUpArrow,
  BsStarFill,
  BsCheck2Circle,
  BsFillCheckCircleFill
} from "react-icons/bs";
import { HiSparkles, HiOutlineTerminal } from "react-icons/hi";
import { FaRocket, FaBuilding, FaUserCheck, FaGraduationCap } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const companyLogos = [
  { name: "Google", role: "Software Engineer L5" },
  { name: "Amazon", role: "Senior SDE" },
  { name: "Meta", role: "E5 Technical Panel" },
  { name: "Microsoft", role: "Staff Engineer" },
  { name: "Netflix", role: "Distributed Systems" },
  { name: "Apple", role: "ICT4 Architecture" },
  { name: "Stripe", role: "Full Stack Engineer" },
  { name: "Uber", role: "Backend Infrastructure" }
];

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const [showAuth, setShowAuth] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [skillGraph, setSkillGraph] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const [matchRes, skillRes, interviewRes] = await Promise.all([
        axios.get(ServerUrl + '/api/career/match/latest', { withCredentials: true }),
        axios.get(ServerUrl + '/api/career/skill-graph', { withCredentials: true }),
        axios.get(ServerUrl + '/api/interview/get-interviews', { withCredentials: true })
      ]);

      if (matchRes.data.data) setMatchData(matchRes.data.data);
      if (skillRes.data.data) setSkillGraph(skillRes.data.data);
      if (interviewRes.data.interviews || interviewRes.data.data?.interviews) {
        setRecentInterviews(interviewRes.data.interviews || interviewRes.data.data.interviews);
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard metrics:", err.message);
    }
  }, []);

  useEffect(() => {
    if (userData) {
      void Promise.resolve().then(fetchDashboardMetrics);
    }
  }, [userData, fetchDashboardMetrics]);

  const weakSkill = skillGraph.find(s => s.masteryLevel === 'Weak' || s.masteryLevel === 'Developing')?.skillName || "System Architecture";
  const strongSkill = skillGraph.find(s => s.masteryLevel === 'Mastered' || s.masteryLevel === 'Strong')?.skillName || "Full Stack Engineering";

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Navbar />

      {/* HERO SECTION - MARKET LEVEL US TECH SAAS */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-800/80">
        {/* Glowing Background Mesh Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-137.5 bg-linear-to-tr from-emerald-500/15 via-purple-500/10 to-cyan-500/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-emerald-500/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-purple-500/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <Motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 text-center md:text-left"
          >
            {/* Live Status Badge */}
            <Motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-slate-300">
                AI Career Intelligence Platform • <span className="text-emerald-400 font-bold">FAANG & US Tech Standards</span>
              </span>
              <HiSparkles className="text-amber-400 text-sm ml-0.5" />
            </Motion.div>

            {/* Main Hero Headline */}
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <Motion.div variants={itemVariants} className="md:col-span-7 space-y-6">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                  Master Your Tech Interviews. <br className="hidden sm:inline" />
                  <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Land Your $150k–$350k Target Role.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto md:mx-0">
                  Stop guessing what interviewers want. SK Interview AI evaluates your responses in real time, repairs your ATS resume against target job descriptions, and continuously coaches you to interview mastery.
                </p>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <button
                    onClick={() => {
                      if (!userData) setShowAuth(true);
                      else navigate('/interview');
                    }}
                    className="relative group overflow-hidden bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center gap-2.5 cursor-pointer"
                  >
                    <BsPlayFill size={22} className="group-hover:scale-110 transition-transform" />
                    <span>Start AI Mock Interview</span>
                  </button>

                  <button
                    onClick={() => navigate('/career-hub')}
                    className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <BsFileEarmarkText className="text-emerald-400" />
                    <span>Career & ATS Hub</span>
                    <BsArrowRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Metric Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-slate-400 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <BsShieldCheck className="text-emerald-400 text-base" />
                    <span><strong>94% ATS</strong> Parsing Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BsStarFill className="text-amber-400 text-sm" />
                    <span><strong>4.9/5</strong> Candidate Rating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BsLightningChargeFill className="text-cyan-400 text-sm" />
                    <span><strong>7 AI Personalities</strong></span>
                  </div>
                </div>
              </Motion.div>

              {/* Floating Interactive Hero Glassmorphism Widget */}
              <Motion.div variants={itemVariants} className="md:col-span-5 relative">
                <div className="relative mx-auto max-w-sm rounded-3xl p-6 bg-linear-to-b from-slate-900/95 to-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <BsRobot size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Adaptive AI Bar Raiser</h4>
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          LIVE EVALUATION ENGINE
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      FAANG Level
                    </span>
                  </div>

                  {/* Simulated Audio Waveform Bar Visualizer */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>Real-time Voice Analysis</span>
                      <span className="text-emerald-400 font-mono">STAR Format Detected</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 h-6 py-1">
                      {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 40, 75, 50, 85].map((h, i) => (
                        <span
                          key={i}
                          style={{ blockSize: `${h}%` }}
                          className="w-1 bg-linear-to-t from-emerald-500 to-teal-300 rounded-full animate-pulse"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Candidate Quick Stats Widget */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Preparation Match</span>
                      <span className="text-sm font-extrabold text-emerald-400">{matchData?.matchScore || 84}%</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Strongest Competency</span>
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {strongSkill}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-medium">Recommended Focus</span>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {weakSkill}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => navigate('/coach')}
                      className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <HiSparkles /> Consult AI Career Coach
                    </button>
                  </div>
                </div>
              </Motion.div>
            </div>
          </Motion.div>
        </div>
      </section>

      {/* TARGET COMPANY BADGES TICKER */}
      <section className="py-8 bg-slate-950/80 border-b border-slate-800/80 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            Engineered for Candidates Targeting Top US Companies & FAANG Bar Raisers
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-1">
            {companyLogos.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 group cursor-default"
              >
                <span className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({item.role})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIONABLE DASHBOARD INTELLIGENCE SECTION */}
      <section className="py-12 bg-[#0B0F17] border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Actionable Intelligence</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Candidate Dashboard & Performance
              </h2>
            </div>

            {userData && (
              <span className="text-xs text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
                Signed in as <strong className="text-white">{userData.name}</strong>
              </span>
            )}
          </div>

          <Motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Match Score Card */}
            <Motion.div variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl space-y-4 group">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prep Match Score</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Target Role Fit
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  {matchData?.matchScore || 82}%
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <BsGraphUpArrow /> High Competency
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                {matchData?.summary || "Strong technical foundation. Recommended to practice System Architecture & Caching."}
              </p>

              <button
                onClick={() => navigate('/career-hub')}
                className="w-full text-xs font-bold text-emerald-400 hover:text-emerald-300 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Inspect ATS Keyword Gaps <BsArrowRight />
              </button>
            </Motion.div>

            {/* Skill Graph Card */}
            <Motion.div variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl space-y-4 group">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Skill Graph Mastery</span>
                <span className="text-xs font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  Adaptive
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-medium">Strongest Competency</span>
                  <span className="font-bold text-emerald-400">{strongSkill}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 font-medium">Priority Target</span>
                  <span className="font-bold text-amber-400">{weakSkill}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/career-hub?tab=skills')}
                className="w-full text-xs font-bold text-purple-400 hover:text-purple-300 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View Skill Graph Hierarchy <BsArrowRight />
              </button>
            </Motion.div>

            {/* Targeted Session CTA */}
            <Motion.div variants={itemVariants} className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Recommended Daily Focus
                </span>
                <h3 className="text-lg font-bold text-white mt-3">{weakSkill} Masterclass</h3>
                <p className="text-xs text-slate-400 mt-1">20-minute targeted adaptive mock interview session</p>
              </div>

              <button
                onClick={() => {
                  if (!userData) setShowAuth(true);
                  else navigate('/interview');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <BsPlayFill size={18} /> START TARGETED SESSION
              </button>
            </Motion.div>
          </Motion.div>
        </div>
      </section>

      {/* FAANG & US TECH INTERVIEW SUITE */}
      <section className="py-16 bg-[#0B0F17] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">FAANG & US Enterprise Suite</span>
            <h2 className="text-3xl font-extrabold text-white">
              End-to-End Career Acceleration Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed specifically for senior developers, engineering managers, and technical specialists targeting top US compensation packages.
            </p>
          </div>

          <Motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: <BsCpuFill className="text-cyan-400" size={24} />,
                title: "System Architecture",
                desc: "Distributed systems, caching strategies, microservices, and database partitioning.",
                badge: "High Seniority",
                route: "/interview"
              },
              {
                icon: <HiOutlineTerminal className="text-emerald-400" size={24} />,
                title: "DSA & Speed Run",
                desc: "Algorithm optimizations, Time/Space complexity explanations, and live coding speed runs.",
                badge: "Core Engineering",
                route: "/interview"
              },
              {
                icon: <FaUserCheck className="text-purple-400" size={24} />,
                title: "STAR Behavioral",
                desc: "FAANG Bar Raiser behavioral scenarios focusing on leadership, conflict, and impact metrics.",
                badge: "Bar Raiser",
                route: "/interview"
              },
              {
                icon: <BsFileEarmarkText className="text-amber-400" size={24} />,
                title: "ATS Resume Tailoring",
                desc: "Auto-identify missing keywords and export 100% ATS-optimized PDF & Word resumes.",
                badge: "1-Click PDF/Word",
                route: "/career-hub"
              }
            ].map((card, idx) => (
              <Motion.div
                key={idx}
                variants={itemVariants}
                onClick={() => navigate(card.route)}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 shadow-lg cursor-pointer space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Launch Module</span> <BsArrowRight />
                </div>
              </Motion.div>
            ))}
          </Motion.div>
        </div>
      </section>

      {/* AI CAREER COACH BANNER */}
      <section className="py-10 bg-slate-950 border-t border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-purple-600 text-white rounded-2xl shadow-lg shrink-0 mt-1">
                <BsRobot size={26} />
              </div>
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">AI Career Coach Intelligence</h3>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30 uppercase">
                    Active Mentor
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Your technical scores are consistently strong! To reach top-tier FAANG offer thresholds, emphasize quantifiable business impact in your STAR responses and clarify architectural trade-offs."
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/coach')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-lg transition whitespace-nowrap self-end md:self-auto flex items-center gap-2 cursor-pointer"
            >
              <HiSparkles /> Consult AI Coach
            </button>
          </div>
        </div>
      </section>

      {/* RECENT MOCK INTERVIEWS */}
      <section className="py-12 bg-[#0B0F17]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5">
              <BsBarChartLine className="text-emerald-400" /> Recent Mock Interview Performance
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition cursor-pointer"
            >
              View Full History →
            </button>
          </div>

          {recentInterviews.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 space-y-3">
              <p>No mock interviews completed yet. Start your first session to build your Skill Graph!</p>
              <button
                onClick={() => {
                  if (!userData) setShowAuth(true);
                  else navigate('/interview');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition cursor-pointer"
              >
                Start First Mock Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInterviews.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/report/${item._id}`)}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition duration-200 cursor-pointer flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{item.role}</p>
                    <p className="text-xs text-slate-400">
                      Mode: <span className="text-slate-300 font-semibold">{item.mode || 'Technical'}</span> • Date: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-400 block">
                      Score: {item.finalScore}/10
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 hover:underline">View Comprehensive Report →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  );
};

export default Home;
