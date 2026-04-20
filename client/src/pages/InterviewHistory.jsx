import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import Navbar from '../components/Navbar';
import { BsArrowLeft, BsBarChart, BsCalendar3, BsClockHistory, BsEye, BsPlayCircle, BsSearch } from 'react-icons/bs';

const InterviewHistory = () => {
    const [interviews, setInterviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const navigate = useNavigate();

    useEffect(()=>{
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
    },[])

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
        const matchesFilter = activeFilter === "all" || interview.status === activeFilter;
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

      return new Date(dateValue).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const scoreTone = (score) => {
      const value = Number(score || 0);

      if (value >= 8) return "text-green-700 bg-green-50 border-green-200";
      if (value >= 5) return "text-yellow-700 bg-yellow-50 border-yellow-200";
      return "text-red-700 bg-red-50 border-red-200";
    };

    const statusTone = (status) => {
      return status === "completed"
        ? "text-green-700 bg-green-50 border-green-200"
        : "text-gray-700 bg-gray-100 border-gray-200";
    };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <Navbar />

      <main className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <button
                onClick={() => navigate('/')}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                <BsArrowLeft size={16} />
                Back
              </button>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-600">
                Interview History
              </p>
              <h1 className="text-3xl font-semibold text-gray-950 md:text-5xl">
                Your interview progress
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-500">
                Review your previous interview sessions, scores, modes, status and practice timeline in one place.
              </p>
            </div>

            <button
              onClick={() => navigate('/interview')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              <BsPlayCircle size={18} />
              Start Interview
            </button>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total", value: stats.total, icon: <BsClockHistory size={20} /> },
              { label: "Completed", value: stats.completed, icon: <BsBarChart size={20} /> },
              { label: "Incompleted", value: stats.incompleted, icon: <BsClockHistory size={20} /> },
              { label: "Average Score", value: `${stats.averageScore}/10`, icon: <BsBarChart size={20} /> },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-950">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="app-panel mb-8 p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search role, mode, status or interview ID"
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition focus:border-green-400 focus:bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Completed", value: "completed" },
                  { label: "Incompleted", value: "Incompleted" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeFilter === filter.value
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="grid gap-5">
              {[1, 2, 3].map((item) => (
                <div key={item} className="app-panel animate-pulse p-5 md:p-6">
                  <div className="mb-4 h-5 w-40 rounded-full bg-gray-100"></div>
                  <div className="mb-5 h-8 w-64 max-w-full rounded-lg bg-gray-100"></div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="h-12 rounded-xl bg-gray-100"></div>
                    <div className="h-12 rounded-xl bg-gray-100"></div>
                    <div className="h-12 rounded-xl bg-gray-100"></div>
                    <div className="h-12 rounded-xl bg-gray-100"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
              <p className="font-semibold text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && interviews.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <BsClockHistory size={26} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-950">No interviews yet</h2>
              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Start your first interview and your role, mode, score and status will appear here.
              </p>
              <button
                onClick={() => navigate('/interview')}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              >
                <BsPlayCircle size={18} />
                Start Interview
              </button>
            </div>
          )}

          {!loading && !error && interviews.length > 0 && filteredInterviews.length === 0 && (
            <div className="app-panel p-10 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
                <BsSearch size={24} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-950">No matching interviews</h2>
              <p className="mx-auto mt-3 max-w-md text-gray-500">
                Try a different role, mode, status, or clear your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
                className="app-button-secondary mt-6"
              >
                Clear Filters
              </button>
            </div>
          )}

          {!loading && !error && filteredInterviews.length > 0 && (
            <div className="grid gap-5">
              {filteredInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg md:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusTone(interview.status)}`}>
                          {interview.status || "Unknown"}
                        </span>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {interview.mode || "Mode not set"}
                        </span>
                      </div>

                      <h2 className="truncate text-2xl font-semibold text-gray-950">
                        {interview.role || "Role not available"}
                      </h2>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-400">Experience</p>
                          <p className="mt-1 text-sm font-medium text-gray-800">{interview.experience || "Not available"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-400">Final Score</p>
                          <span className={`mt-1 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${scoreTone(interview.finalScore)}`}>
                            {Number(interview.finalScore || 0).toFixed(1)}/10
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-400">Created</p>
                          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-800">
                            <BsCalendar3 size={14} />
                            {formatDate(interview.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-gray-400">Interview ID</p>
                          <p className="mt-1 truncate text-sm font-medium text-gray-800">{interview._id}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/report/${interview._id}`)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                    >
                      <BsEye size={17} />
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default InterviewHistory
