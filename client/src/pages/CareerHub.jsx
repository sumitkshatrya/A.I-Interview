import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion as Motion } from 'framer-motion';
import {
  FaFileUpload,
  FaFileAlt,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaMagic,
  FaPlay,
  FaTrash,
  FaDownload,
  FaFilePdf,
  FaFileWord
} from 'react-icons/fa';
import { BsListCheck } from 'react-icons/bs';
import axios from 'axios';
import { ServerUrl } from '../App';
import { exportAtsResumePdf, exportAtsResumeDocx } from '../utils/atsResumeExporter';

const CareerHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resume-jd');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jobData, setJobData] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [skillGraph, setSkillGraph] = useState([]);
  const [prepPlan, setPrepPlan] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingJob, setLoadingJob] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [error, setError] = useState('');
  const latestMatchRequest = useRef(null);
  const latestOptimizedResumeRequest = useRef(null);

  // Bullet Improver Modal state
  const [showImprover, setShowImprover] = useState(false);
  const [selectedBullet, setSelectedBullet] = useState('');
  const [improverGoal, setImproverGoal] = useState('Make ATS friendly & impactful');
  const [userMetrics, setUserMetrics] = useState('');
  const [improvedResult, setImprovedResult] = useState(null);
  const [improverLoading, setImproverLoading] = useState(false);

  // ATS Resume Optimization Modal state
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [loadingOptimize, setLoadingOptimize] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState(null);

  const fetchSkillGraph = useCallback(async () => {
    try {
      const res = await axios.get(ServerUrl + '/api/career/skill-graph', { withCredentials: true });
      setSkillGraph(res.data.data || []);
    } catch (err) {
      console.warn("Failed to fetch skill graph:", err.message);
    }
  }, []);

  const fetchPrepPlan = useCallback(async () => {
    try {
      const res = await axios.get(ServerUrl + '/api/career/prep-plan', { withCredentials: true });
      setPrepPlan(res.data.data || null);
    } catch (err) {
      console.warn("Failed to fetch prep plan:", err.message);
    }
  }, []);

  const fetchLatestMatch = useCallback(async () => {
    latestMatchRequest.current?.abort();
    const controller = new AbortController();
    latestMatchRequest.current = controller;

    try {
      const res = await axios.get(ServerUrl + '/api/career/match/latest', {
        withCredentials: true,
        signal: controller.signal,
      });
      if (!controller.signal.aborted && res.data.data) {
        setMatchData(res.data.data);
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.warn("Failed to fetch latest match:", err.message);
      }
    } finally {
      if (latestMatchRequest.current === controller) {
        latestMatchRequest.current = null;
      }
    }
  }, []);

  const fetchLatestOptimizedResume = useCallback(async () => {
    latestOptimizedResumeRequest.current?.abort();
    const controller = new AbortController();
    latestOptimizedResumeRequest.current = controller;

    try {
      const res = await axios.get(ServerUrl + '/api/career/optimized-resume', {
        withCredentials: true,
        signal: controller.signal,
      });
      if (!controller.signal.aborted && res.data.data) {
        setOptimizedResume(res.data.data);
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.warn("Failed to fetch optimized resume:", err.message);
      }
    } finally {
      if (latestOptimizedResumeRequest.current === controller) {
        latestOptimizedResumeRequest.current = null;
      }
    }
  }, []);

  useEffect(() => {
    fetchSkillGraph();
    fetchPrepPlan();
    fetchLatestMatch();
    fetchLatestOptimizedResume();

    return () => {
      latestMatchRequest.current?.abort();
      latestOptimizedResumeRequest.current?.abort();
    };
  }, [fetchSkillGraph, fetchPrepPlan, fetchLatestMatch, fetchLatestOptimizedResume]);

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setLoadingResume(true);
    setError('');

    // Clear stored target job description, previous match, and previous optimized resume
    latestMatchRequest.current?.abort();
    latestOptimizedResumeRequest.current?.abort();
    setJobData(null);
    setJdText('');
    setMatchData(null);
    setOptimizedResume(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await axios.post(ServerUrl + '/api/interview/resume', formData, { withCredentials: true });
      setResumeData(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Resume parsing failed.');
    } finally {
      setLoadingResume(false);
    }
  };

  const handleJobAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoadingJob(true);
    setError('');

    try {
      const res = await axios.post(ServerUrl + '/api/career/analyze-job', { rawText: jdText }, { withCredentials: true });
      setJobData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Job analysis failed.');
    } finally {
      setLoadingJob(false);
    }
  };

  const handleRunMatch = async () => {
    setLoadingMatch(true);
    setError('');

    try {
      const res = await axios.post(ServerUrl + '/api/career/match', {
        resumeId: resumeData?.resumeId,
        jobId: jobData?.jobId
      }, { withCredentials: true });
      setMatchData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Matching score computation failed.');
    } finally {
      setLoadingMatch(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to delete the uploaded resume?")) return;
    try {
      const id = resumeData?.resumeId || 'latest';
      await axios.delete(ServerUrl + `/api/career/resume/${id}`, { withCredentials: true });
      setResumeData(null);
      setResumeFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume.');
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm("Are you sure you want to delete the job description analysis?")) return;
    try {
      const id = jobData?.jobId || 'latest';
      await axios.delete(ServerUrl + `/api/career/job/${id}`, { withCredentials: true });
      setJobData(null);
      setJdText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job description.');
    }
  };

  const handleDeleteMatch = async () => {
    if (!window.confirm("Are you sure you want to delete this match analysis?")) return;
    try {
      const id = matchData?._id || 'latest';
      await axios.delete(ServerUrl + `/api/career/match/${id}`, { withCredentials: true });
      setMatchData(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete match analysis.');
    }
  };

  const handleOptimizeResume = async () => {
    setLoadingOptimize(true);
    setError('');

    try {
      const res = await axios.post(ServerUrl + '/api/career/optimize-resume', {
        resumeId: resumeData?.resumeId,
        jobId: jobData?.jobId
      }, { withCredentials: true });
      setOptimizedResume(res.data.data);
      setShowAtsModal(true);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate ATS optimized resume.');
    } finally {
      setLoadingOptimize(false);
    }
  };

  const handleToggleTask = async (planId, taskId) => {
    try {
      const res = await axios.post(ServerUrl + '/api/career/prep-plan/toggle', { planId, taskId }, { withCredentials: true });
      setPrepPlan(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleImproveBulletSubmit = async () => {
    if (!selectedBullet) return;
    setImproverLoading(true);

    try {
      const res = await axios.post(ServerUrl + '/api/career/improve-bullet', {
        bullet: selectedBullet,
        goal: improverGoal,
        userMetrics
      }, { withCredentials: true });
      setImprovedResult(res.data.data);
    } catch (e) {
      console.log(e);
    } finally {
      setImproverLoading(false);
    }
  };

  const startDayStrategySession = (task) => {
    navigate('/interview', {
      state: {
        prepTask: task,
        targetRole: task.title,
        interviewType: task.category || "Technical",
        personality: "Friendly Coach"
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Top Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Career Intelligence Engine</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Career Intelligence Hub</h1>
          <p className="text-slate-400 text-sm mt-1">
            Resume ATS analysis, Job Description matching, Skill Graph mastery, and Personalized 7-Day Preparation Plans.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-800 mb-8 overflow-x-auto">
          {[
            { id: 'resume-jd', label: 'Resume & Job Matcher', icon: <FaFileAlt /> },
            { id: 'skills', label: 'Skill Graph Mastery', icon: <FaChartLine /> },
            { id: 'prep-plan', label: '7-Day Preparation Plan', icon: <BsListCheck /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900 rounded-t-xl font-bold'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-950'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold text-xs">Dismiss</button>
          </div>
        )}

        {/* TAB 1: RESUME & JOB MATCHER */}
        {activeTab === 'resume-jd' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Resume Section */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between relative">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <FaFileAlt className="text-blue-600" />
                      1. Upload Resume PDF
                    </h2>
                    <div className="flex items-center gap-2">
                      {resumeData && (
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                          ATS Score: {resumeData.atsScore || 80}/100
                        </span>
                      )}
                      {(resumeData || resumeFile) && (
                        <button
                          onClick={handleDeleteResume}
                          title="Delete Resume"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-gray-50 hover:bg-gray-100 transition">
                    <input
                      type="file"
                      accept="application/pdf"
                      id="resumeFile"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files[0])}
                    />
                    <label htmlFor="resumeFile" className="cursor-pointer block">
                      <FaFileUpload className="mx-auto text-3xl text-blue-600 mb-2" />
                      <span className="font-semibold text-sm text-gray-800 block">
                        {resumeFile ? resumeFile.name : 'Click to select PDF resume'}
                      </span>
                      <span className="text-xs text-gray-400">PDF formats only</span>
                    </label>
                  </div>

                  {resumeFile && (
                    <button
                      onClick={handleResumeUpload}
                      disabled={loadingResume}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm disabled:bg-gray-400"
                    >
                      {loadingResume ? 'Analyzing Resume...' : 'Analyze Resume Intelligence'}
                    </button>
                  )}

                  {resumeData && (
                    <div className="mt-4 space-y-2 text-xs text-gray-600 bg-blue-50 p-4 rounded-xl">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-blue-900">Extracted Background:</p>
                        <button
                          onClick={handleDeleteResume}
                          className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <FaTrash size={10} /> Delete
                        </button>
                      </div>
                      <p><strong>Role:</strong> {resumeData.role}</p>
                      <p><strong>Skills:</strong> {(resumeData.skills || []).slice(0, 6).join(', ')}</p>
                      <button
                        onClick={() => setShowImprover(true)}
                        className="mt-2 inline-flex items-center gap-1.5 text-blue-700 font-bold hover:underline"
                      >
                        <FaMagic /> Open Bullet Point Improver Agent
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* JD Section */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <FaFileAlt className="text-purple-600" />
                      2. Paste Target Job Description
                    </h2>
                    <div className="flex items-center gap-2">
                      {jobData && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                          {jobData.seniority}
                        </span>
                      )}
                      {(jobData || jdText) && (
                        <button
                          onClick={handleDeleteJob}
                          title="Delete Job Description"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    rows={5}
                    placeholder="Paste job title, responsibilities, and key requirements..."
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500 transition shadow-inner"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />

                  <button
                    onClick={handleJobAnalyze}
                    disabled={loadingJob || !jdText.trim()}
                    className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm disabled:bg-gray-400"
                  >
                    {loadingJob ? 'Analyzing Job Description...' : 'Extract Job Requirements'}
                  </button>

                  {jobData && (
                    <div className="mt-4 space-y-2 text-xs text-gray-600 bg-purple-50 p-4 rounded-xl">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-purple-900">Extracted Job Requirements:</p>
                        <button
                          onClick={handleDeleteJob}
                          className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <FaTrash size={10} /> Delete
                        </button>
                      </div>
                      <p><strong>Required Skills:</strong> {(jobData.requiredSkills || []).join(', ')}</p>
                      <p><strong>Focus Areas:</strong> {(jobData.interviewFocusAreas || []).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleRunMatch}
                disabled={loadingMatch}
                className="bg-black hover:opacity-90 text-white font-bold px-8 py-3.5 rounded-full text-base shadow-lg transition disabled:bg-gray-400"
              >
                {loadingMatch ? 'Computing Match Matrix...' : 'Generate Resume ↔ Job Match Matrix'}
              </button>

              <button
                onClick={handleOptimizeResume}
                disabled={loadingOptimize}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-full text-base shadow-lg transition flex items-center gap-2 disabled:bg-gray-400"
              >
                <FaMagic className="text-amber-300" />
                {loadingOptimize ? 'Fixing Mistakes & Generating ATS Resume...' : 'Fix Errors & Generate High-ATS Resume'}
              </button>

              {optimizedResume && !loadingOptimize && (
                <button
                  onClick={() => setShowAtsModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-full text-sm shadow-md transition flex items-center gap-2"
                >
                  <FaFileAlt /> View Optimized ATS Resume
                </button>
              )}
            </div>

            {/* Match Matrix Result */}
            {matchData && (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6 relative"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600">Transparent Match Analysis</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">Preparation Match Score</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-extrabold text-green-600">
                      {matchData.matchScore}%
                    </div>
                    <button
                      onClick={handleDeleteMatch}
                      title="Delete Match Analysis"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {matchData.summary}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" /> Matching Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(matchData.matchingSkills || []).map((s, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaExclamationTriangle className="text-amber-600" /> Skill & Keyword Gaps (Resume Mistakes)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(matchData.missingRequiredSkills || []).concat(matchData.keywordGaps || []).map((s, idx) => (
                        <span key={idx} className="bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {matchData.preparationPriorities && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FaLightbulb className="text-blue-600" /> Recommended Preparation Priorities
                    </h4>
                    <div className="space-y-3">
                      {matchData.preparationPriorities.map((item, idx) => (
                        <div key={idx} className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-bold text-blue-900">
                            <span>Priority #{item.priority}: {item.topic}</span>
                          </div>
                          <p className="text-blue-800"><strong>Why:</strong> {item.reason}</p>
                          <p className="text-blue-700"><strong>Action:</strong> {item.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Motion.div>
            )}
          </div>
        )}

        {/* TAB 2: SKILL GRAPH MASTERY */}
        {activeTab === 'skills' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Skill Graph Mastery Hierarchy</h2>
              <p className="text-xs text-gray-500 mt-1">
                Your skills adapt automatically based on performance in mock interviews.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {skillGraph.map((skill, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-gray-900">{skill.skillName}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      skill.masteryLevel === 'Mastered' ? 'bg-purple-100 text-purple-800' :
                      skill.masteryLevel === 'Strong' ? 'bg-green-100 text-green-800' :
                      skill.masteryLevel === 'Good' ? 'bg-blue-100 text-blue-800' :
                      skill.masteryLevel === 'Developing' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {skill.masteryLevel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Average Score: <strong>{skill.averageScore}/10</strong></p>
                    <p>Attempts: <strong>{skill.attemptsCount}</strong></p>
                    {skill.scoreTrend && <p>Trend: <strong className="text-green-600">{skill.scoreTrend}</strong></p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 7-DAY PREPARATION PLAN */}
        {activeTab === 'prep-plan' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personalized 7-Day Strategy</h2>
              <p className="text-xs text-gray-500 mt-1">
                Click "Start Day Strategy Session" on any task to launch a guided AI coaching session for that specific day and topic!
              </p>
            </div>

            {prepPlan && (
              <div className="space-y-4">
                {prepPlan.tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      task.completed
                        ? 'bg-green-50/60 border-green-200 text-green-950'
                        : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => handleToggleTask(prepPlan._id, task._id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer shrink-0 mt-0.5 ${
                          task.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Click to toggle completion"
                      >
                        {task.day}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-bold ${task.completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                            {task.title}
                          </h3>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {task.category || 'Strategy'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{task.description}</p>
                        <span className="text-[11px] font-semibold text-gray-400 mt-1 block">Est. duration: {task.estimatedMinutes} mins</span>
                      </div>
                    </div>

                    <button
                      onClick={() => startDayStrategySession(task)}
                      className="bg-black hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2 shrink-0 self-end sm:self-auto"
                    >
                      <FaPlay size={10} className="text-green-400" /> Start Day {task.day} Session
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATS OPTIMIZED RESUME MODAL */}
      {showAtsModal && optimizedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-4xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Target Job Tailored Resume
                </span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2">100% ATS-Optimized Resume</h2>
                <p className="text-xs text-gray-500">Target Role: <strong>{optimizedResume.targetRole}</strong></p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">Predicted ATS Score</span>
                  <span className="text-3xl font-black text-emerald-600">{optimizedResume.predictedAtsScore || 96}%</span>
                </div>
                <button
                  onClick={() => setShowAtsModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Improvements Summary Box */}
            {optimizedResume.atsImprovementsMade && optimizedResume.atsImprovementsMade.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-2">
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-600" /> Resume Mistakes Identified & Fixed by AI:
                </h4>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                  {optimizedResume.atsImprovementsMade.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-600 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Export Download Bar */}
            <div className="flex flex-wrap gap-3 bg-gray-900 text-white p-4 rounded-2xl justify-between items-center">
              <div>
                <span className="text-xs font-bold text-gray-300 block">Ready for Job Applications</span>
                <p className="text-[11px] text-gray-400">Download formatted files ready for ATS applicant tracking systems.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => exportAtsResumePdf(optimizedResume)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
                >
                  <FaFilePdf size={14} /> Download PDF (.pdf)
                </button>
                <button
                  onClick={() => exportAtsResumeDocx(optimizedResume)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2"
                >
                  <FaFileWord size={14} /> Download Word (.docx)
                </button>
              </div>
            </div>

            {/* Document Preview Box */}
            <div className="bg-white border border-gray-300 rounded-2xl p-6 sm:p-8 shadow-inner space-y-6 text-gray-800 font-sans">
              {/* Preview Candidate Header */}
              <div className="border-b border-gray-300 pb-4">
                <h3 className="text-2xl font-bold text-gray-900">{optimizedResume.candidateName}</h3>
                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">{optimizedResume.targetRole}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {[
                    optimizedResume.contactInfo?.email,
                    optimizedResume.contactInfo?.phone,
                    optimizedResume.contactInfo?.location,
                    optimizedResume.contactInfo?.linkedin,
                    optimizedResume.contactInfo?.portfolio
                  ].filter(Boolean).join('  |  ')}
                </p>
              </div>

              {/* Summary */}
              {optimizedResume.professionalSummary && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-2">
                    Professional Summary
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{optimizedResume.professionalSummary}</p>
                </div>
              )}

              {/* Core Competencies */}
              {optimizedResume.coreCompetencies && optimizedResume.coreCompetencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-2">
                    Core Competencies
                  </h4>
                  <div className="flex flex-wrap gap-1.5 text-xs text-gray-800">
                    {optimizedResume.coreCompetencies.map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 px-2.5 py-1 rounded border border-gray-200 font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {optimizedResume.workExperience && optimizedResume.workExperience.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-3">
                    Professional Experience
                  </h4>
                  <div className="space-y-4">
                    {optimizedResume.workExperience.map((exp, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>{exp.title} — {exp.company}</span>
                          <span className="text-gray-500 font-normal">{exp.duration} | {exp.location}</span>
                        </div>
                        {exp.achievements && (
                          <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
                            {exp.achievements.map((ach, aIdx) => (
                              <li key={aIdx} className="leading-relaxed">{ach}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {optimizedResume.projects && optimizedResume.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-3">
                    Key Projects
                  </h4>
                  <div className="space-y-3 text-xs">
                    {optimizedResume.projects.map((proj, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>{proj.name}</span>
                          <span className="text-gray-500 font-mono text-[11px]">{proj.techStack}</span>
                        </div>
                        <p className="text-gray-700">{proj.description}</p>
                        {proj.keyMetric && (
                          <span className="text-blue-800 font-semibold text-[11px] block">Impact: {proj.keyMetric}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Certifications */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs pt-2">
                {optimizedResume.education && optimizedResume.education.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-2">
                      Education
                    </h4>
                    {optimizedResume.education.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-gray-900">{edu.degree} - {edu.field}</p>
                        <p className="text-gray-500">{edu.institution} ({edu.year})</p>
                      </div>
                    ))}
                  </div>
                )}

                {optimizedResume.certifications && optimizedResume.certifications.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-1 mb-2">
                      Certifications
                    </h4>
                    {optimizedResume.certifications.map((cert, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-gray-900">{cert.title}</p>
                        <p className="text-gray-500">{cert.issuer} ({cert.year})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BULLET IMPROVER MODAL */}
      {showImprover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FaMagic className="text-blue-600" /> AI Resume Bullet Point Improver
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Improvement Goal</label>
              <select
                value={improverGoal}
                onChange={(e) => setImproverGoal(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 transition mb-3"
              >
                <option value="Make ATS friendly & impactful">Make ATS friendly & impactful</option>
                <option value="Emphasize Technical Architecture & Scalability">Emphasize Technical Architecture & Scalability</option>
                <option value="Highlight Measurable Business Metrics (STAR)">Highlight Measurable Business Metrics (STAR)</option>
                <option value="Demonstrate Leadership & Cross-Functional Ownership">Demonstrate Leadership & Cross-Functional Ownership</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Select / Type Original Bullet Point</label>
              <textarea
                rows={3}
                placeholder="e.g. Built API caching using Redis..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={selectedBullet}
                onChange={(e) => setSelectedBullet(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Provided Real Metrics / Numbers (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Reduced latency by 35%, 50k DAU"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={userMetrics}
                onChange={(e) => setUserMetrics(e.target.value)}
              />
              <span className="text-[10px] text-gray-400 block mt-1">
                We never fabricate fake numbers. Provide real figures if available.
              </span>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowImprover(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handleImproveBulletSubmit}
                disabled={improverLoading || !selectedBullet.trim()}
                className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
              >
                {improverLoading ? 'Enhancing...' : 'Improve Bullet Point'}
              </button>
            </div>

            {improvedResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <p className="font-bold text-blue-900">Improved Bullet Point:</p>
                <p className="text-blue-800 font-semibold leading-relaxed">"{improvedResult.improvedBullet}"</p>
                <p className="text-blue-700"><strong>Changes:</strong> {improvedResult.changesMade}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CareerHub;
