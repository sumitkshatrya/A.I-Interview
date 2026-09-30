import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BsArrowLeft, BsBarChart, BsCalendar3, BsClockHistory, BsEye, BsPlayCircle, BsSearch } from 'react-icons/bs';

const InterviewHistory = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                setLoading(true);
                setError("");
                const result = await axios.get(ServerUrl + '/api/interview/get-interviews', { withCredentials: true });
                setInterviews(result.data.interviews || []);
            } catch (error) {
                console.error('Error fetching interviews:', error);
                setError(error.response?.data?.message || "Unable to load interview history.");
            } finally {
                setLoading(false);
            }
        };

        getMyInterviews();
    }, []);

    const stats = useMemo(() => {
      const total = interviews.length;
      const completed = interviews.filter((item) => item.status === "completed").length;
      const incompleted = total - completed;
      const scoredInterviews = interviews.filter((item) => Number(item.finalScore) > 0);
      const averageScore = scoredInterviews.length
        ? scoredInterviews.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / scoredInterviews.length
        : 0;

      return {
        total,
        completed,
        incompleted,
        averageScore: Number(averageScore.toFixed(1)),
      };
    }, [interviews]);

    const filteredInterviews = useMemo(() => {
      const normalizedSearch = searchTerm.trim().toLowerCase();

      return interviews.filter((interview) => {
        const statusStr = String(interview.status || "").toLowerCase();
        const matchesFilter =
          activeFilter === "all" ||
          statusStr === activeFilter.toLowerCase() ||
          (activeFilter === "incompleted" && (statusStr === "pending" || statusStr === "incompleted" || statusStr === "incomplete"));

        const matchesSearch = !normalizedSearch || [
          interview.role,
          interview.experience,
          interview.mode,
          interview.status,
          interview._id,
        ].some((value) => String(value || "").toLowerCase().includes(normalizedSearch));

        return matchesFilter && matchesSearch;
      });
    }, [activeFilter, interviews, searchTerm]);

    const formatDate = (dateValue) => {
      if (!dateValue) return "Not available";

      return new Date(dateValue).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const scoreTone = (score) => {
      const value = Number(score || 0);

      if (value >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      if (value >= 5) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      return "text-red-400 bg-red-500/10 border-red-500/30";
    };

    const statusTone = (status) => {
      return status === "completed"
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
        : "text-slate-400 bg-slate-800 border-slate-700";
    };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <button
                onClick={() => navigate('/')}
                className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 shadow-md transition hover:bg-slate-800"
              >
                <BsArrowLeft size={16} />
                Back
              </button>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                Interview Performance Timeline
              </p>
              <h1 className="text-3xl font-extrabold text-white md:text-4xl">
                Mock Interview History
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400">
                Review past mock interview sessions, scores, target modes, and multi-dimensional evaluation reports.
              </p>
            </div>

            <button
              onClick={() => navigate('/interview')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-xs font-extrabold text-slate-950 shadow-lg transition hover:bg-emerald-400 shrink-0"
            >
              <BsPlayCircle size={18} />
              Start New Mock Interview
            </button>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Sessions", value: stats.total, icon: <BsClockHistory size={20} /> },
              { label: "Completed", value: stats.completed, icon: <BsBarChart size={20} /> },
              { label: "Incomplete", value: stats.incompleted, icon: <BsClockHistory size={20} /> },
              { label: "Average Score", value: `${stats.averageScore}/10`, icon: <BsBarChart size={20} /> },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-8 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search role, mode, status or interview ID..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-xs font-semibold text-white outline-none transition focus:border-emerald-500 placeholder-slate-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Completed", value: "completed" },
                  { label: "Incomplete", value: "incompleted" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                      activeFilter === filter.value
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 animate-pulse space-y-4">
                  <div className="h-4 w-32 bg-slate-800 rounded"></div>
                  <div className="h-6 w-64 bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-8 text-center shadow-lg">
              <p className="font-semibold text-red-300 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && interviews.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-md space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BsClockHistory size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">No Mock Interviews Completed Yet</h2>
              <p className="mx-auto max-w-md text-xs text-slate-400">
                Start your first interview session to build your Skill Graph and track performance over time!
              </p>
              <button
                onClick={() => navigate('/interview')}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-md transition hover:bg-emerald-400"
              >
                <BsPlayCircle size={18} />
                Start Mock Interview
              </button>
            </div>
          )}

          {!loading && !error && interviews.length > 0 && filteredInterviews.length === 0 && (
            <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
              <h2 className="text-xl font-bold text-white">No Matching Interviews</h2>
              <p className="text-xs text-slate-400">Try a different search query or clear your active filters.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && !error && filteredInterviews.length > 0 && (
            <div className="grid gap-4">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-md transition hover:border-slate-700 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusTone(interview.status)}`}>
                          {interview.status || "Unknown"}
                        </span>
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[11px] font-bold text-purple-300">
                          {interview.mode || "Mode not set"}
                        </span>
                      </div>

                      <h2 className="truncate text-xl font-extrabold text-white">
                        {interview.role || "Role not available"}
                      </h2>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                        <div>
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Seniority Level</p>
                          <p className="mt-1 font-semibold text-slate-200">{interview.experience || "Not available"}</p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Final Score</p>
                          <span className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${scoreTone(interview.finalScore)}`}>
                            {Number(interview.finalScore || 0).toFixed(1)}/10
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Date Completed</p>
                          <p className="mt-1 flex items-center gap-1.5 font-semibold text-slate-200">
                            <BsCalendar3 size={13} />
                            {formatDate(interview.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Session ID</p>
                          <p className="mt-1 truncate font-mono text-slate-400 text-[11px]">{interview._id}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/report/${interview._id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-xs font-bold text-emerald-400 transition hover:bg-slate-800 shadow-md shrink-0"
                    >
                      <BsEye size={16} />
                      View Multi-Dimensional Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewHistory;
