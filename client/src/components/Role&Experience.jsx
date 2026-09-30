import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FaBriefcase,
  FaFileUpload,
  FaUserTie,
  FaRobot,
  FaBullseye,
  FaUserCheck,
  FaLayerGroup,
  FaChalkboardTeacher,
  FaSpinner,
  FaMagic
} from 'react-icons/fa';
import { BsArrowLeft, BsFileEarmarkPdf, BsInfoCircle, BsLightningChargeFill } from 'react-icons/bs';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const personalityOptions = [
  { value: "Friendly Coach", desc: "Supportive, encouraging, constructive feedback & teaching" },
  { value: "Professional Recruiter", desc: "HR-style behavioral and culture evaluation" },
  { value: "Technical Expert", desc: "Deep technical questions and practical implementation" },
  { value: "Strict Interviewer", desc: "Demanding bar-raiser, direct and concise" },
  { value: "Hiring Manager", desc: "Focuses on ownership, business impact & trade-offs" },
  { value: "Startup Interviewer", desc: "Fast-paced, building experience & resourcefulness" },
  { value: "Senior Technical Panel", desc: "Architecture, scalability & distributed systems" }
];

const interviewTypeOptions = [
  "Technical", "HR", "Behavioral", "Coding", "System Design",
  "Managerial", "Product", "Sales", "Customer Support", "Leadership",
  "Situational", "Case Study", "Mixed Interview", "Resume-Based", "Job Description-Based"
];

const RoleAndExperience = ({ onStart }) => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const prepTask = location.state?.prepTask;

  const [role, setRole] = useState(prepTask?.title || 'Full Stack Engineer');
  const [experience, setExperience] = useState('Senior Level (4+ yrs)');
  const [personality, setPersonality] = useState(prepTask ? 'Friendly Coach' : 'Technical Expert');
  const [interviewType, setInterviewType] = useState(prepTask?.category || 'Technical');
  const [jobDescriptionText, setJobDescriptionText] = useState(
    prepTask
      ? `Day ${prepTask.day} Strategy Session: ${prepTask.title}. ${prepTask.description}. Coaching Goal: Teach candidate key concepts if they struggle and help them score high on this strategy.`
      : ''
  );
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState('');
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prepTask) {
      setRole(prepTask.title || 'Full Stack Engineer');
      setInterviewType(prepTask.category || 'Technical');
      setPersonality('Friendly Coach');
      setJobDescriptionText(
        `Day ${prepTask.day} Strategy Session: ${prepTask.title}. ${prepTask.description}. Coaching Goal: Teach candidate key concepts if they struggle and help them score high on this strategy.`
      );
    }
  }, [prepTask]);

  const credits = userData?.credits || 0;
  const canStart = Boolean(role.trim() && experience.trim() && !loading);

  const handleFileChange = (file) => {
    setError('');
    setAnalysisDone(false);
    if (!file) {
      setResumeFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF resume only.');
      return;
    }
    setResumeFile(file);
  };

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);
    setError('');

    const formdata = new FormData();
    formdata.append('resume', resumeFile);

    try {
      const result = await axios.post(ServerUrl + '/api/interview/resume', formdata, { withCredentials: true });
      if (result.data.role && !prepTask) setRole(result.data.role);
      if (result.data.experience) setExperience(result.data.experience);
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumeText || '');
      setAnalysisDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Resume analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (!canStart) return;
    setLoading(true);
    setError('');

    try {
      const result = await axios.post(
        ServerUrl + '/api/interview/generate-questions',
        {
          role,
          experience,
          mode: interviewType,
          personality,
          interviewType,
          resumeText,
          jobDescriptionText,
          projects,
          skills
        },
        { withCredentials: true }
      );

      if (userData && result.data.data?.creditsLeft !== undefined) {
        dispatch(setUserData({ ...userData, credits: result.data.data.creditsLeft }));
      }

      onStart(result.data.data || result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start interview session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0B0F17] text-slate-100 px-4 py-6 sm:py-10 relative"
    >
      <div className="mx-auto w-full max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-md"
        >
          <BsArrowLeft size={16} />
          Back
        </button>

        {prepTask && (
          <div className="mb-6 p-4 bg-purple-950/60 border border-purple-500/40 rounded-2xl text-purple-200 font-bold text-xs flex items-center justify-between shadow-xl">
            <span className="flex items-center gap-2">
              <FaChalkboardTeacher size={18} className="text-purple-400" />
              Day {prepTask.day} Strategy Session: {prepTask.title} (Coaching & Teaching Mode Active)
            </span>
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider">
              Guided Practice
            </span>
          </div>
        )}

        <div className="grid overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left Sidebar */}
          <aside className="relative flex flex-col justify-between bg-slate-950 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                <BsInfoCircle size={14} />
                50 credits per dynamic interview
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight text-white">
                {prepTask ? `Day ${prepTask.day} Strategy Session` : 'Adaptive AI Mock Interview Setup'}
              </h1>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
                {prepTask
                  ? `Focusing on ${prepTask.title}. The AI coach evaluates turn-by-turn responses and teaches key concepts if score falls under 7/10.`
                  : 'Select from 7 AI personalities and 15 specialized interview formats. Evaluates technical depth, STAR methodology, and communication.'}
              </p>

              <div className="mt-8 space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FaRobot size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Dynamic AI Bar Raiser</p>
                    <p className="text-slate-400">Listens, probes follow-up edge cases turn-by-turn.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <BsLightningChargeFill size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">In-Interview AI Teaching</p>
                    <p className="text-slate-400">Teaches key concepts dynamically on screen when scores drop.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-semibold text-slate-400">Available Account Credits</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-3xl font-black text-white">{credits}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${credits >= 50 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {credits >= 50 ? 'Ready' : 'Need Credits'}
                </span>
              </div>
            </div>
          </aside>

          {/* Right Setup Form */}
          <section className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Adaptive Setup</span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Configure Mock Interview</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Target Role / Specialty</label>
                <div className="relative">
                  <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-emerald-500 transition"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-300">Experience Seniority</label>
                <div className="relative">
                  <FaBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white outline-none focus:border-emerald-500 transition"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* AI Personality Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FaUserCheck className="text-emerald-400" /> AI Interviewer Personality
              </label>
              <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
                {personalityOptions.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPersonality(p.value)}
                    className={`p-3 rounded-xl border text-left transition text-xs ${
                      personality === p.value
                        ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold shadow-sm'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <p className="text-white">{p.value}</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Type Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FaLayerGroup className="text-purple-400" /> Interview Format / Mode
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {interviewTypeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      interviewType === type
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Description Optional Text */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300">Strategy & Focus Instructions (Optional)</label>
              <textarea
                rows={2}
                placeholder="Paste key responsibilities or target job specs..."
                className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-emerald-500 transition"
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-300">Resume PDF (Optional)</label>
              <div
                onClick={() => document.getElementById('resumeUpload').click()}
                className="rounded-xl border-2 border-dashed border-slate-800 bg-slate-950 p-4 transition hover:border-emerald-500 cursor-pointer"
              >
                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                {!resumeFile ? (
                  <div className="text-center">
                    <FaFileUpload className="mx-auto text-2xl text-emerald-400 mb-1" />
                    <p className="text-xs font-bold text-slate-300">Click to upload Resume PDF</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-white truncate max-w-[180px]">{resumeFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleUploadResume(); }}
                      disabled={analyzing}
                      className="bg-emerald-500 text-slate-950 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-400 transition"
                    >
                      {analyzing ? 'Extracting...' : analysisDone ? 'Parsed' : 'Extract Skills'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs font-semibold text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 text-sm font-extrabold shadow-lg transition disabled:bg-slate-800 disabled:text-slate-500"
            >
              {loading ? 'Generating Adaptive Questions...' : 'Start Strategy Session'}
            </button>
          </section>
        </div>
      </div>

      {/* FULL PAGE QUESTION GENERATION OVERLAY */}
      <AnimatePresence>
        {loading && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0F17]/90 backdrop-blur-xl text-white p-6 text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
              <FaRobot className="text-emerald-400 text-4xl animate-pulse" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-white">
              Generating Adaptive AI Interview Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-8">
              Analyzing candidate background, target role competencies, and configuring dynamic AI interviewer agent...
            </p>

            <div className="space-y-3 text-xs text-left max-w-xs w-full bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <FaSpinner className="animate-spin text-sm" />
                <span>Extracting Skill & Resume Context...</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-400">
                <FaSpinner className="animate-spin text-sm" />
                <span>Configuring "{personality}" Personality...</span>
              </div>
              <div className="flex items-center gap-2.5 text-emerald-400">
                <FaSpinner className="animate-spin text-sm" />
                <span>Crafting Adaptive Turn-by-Turn Engine...</span>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
};

export default RoleAndExperience;
