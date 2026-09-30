import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BsArrowLeft, BsBarChart, BsCalendar3, BsDownload } from 'react-icons/bs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ServerUrl } from '../App';
import { downloadInterviewReportPDF } from '../utils/reportPdf';

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getReport = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id, { withCredentials: true });
        setReport(result.data);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load interview report.");
      } finally {
        setLoading(false);
      }
    };

    getReport();
  }, [id]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    return new Date(dateValue).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const scoreColor = (value) => {
    const score = Number(value || 0);

    if (score >= 8) return "bg-emerald-500";
    if (score >= 5) return "bg-amber-500";
    return "bg-red-500";
  };

  const downloadPDF = () => {
    downloadInterviewReportPDF(report);
  };

  const questionScoreData = (report?.questionWiseScore || []).map((item, index) => ({
    name: `Q${index + 1}`,
    score: Number(item?.score || 0),
  }));

  const ScoreBar = ({ label, value }) => {
    const score = Number(value || 0);

    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-md space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BsBarChart size={18} />
        </div>
        <div className="flex items-end justify-between gap-3">
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <p className="text-2xl font-black text-white">{score.toFixed(1)}/10</p>
        </div>
        <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scoreColor(score)}`}
            style={{ width: `${Math.min(score * 10, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => navigate('/history')}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 shadow-md transition hover:bg-slate-800"
            >
              <BsArrowLeft size={16} />
              Back to History
            </button>

            {!loading && !error && report && (
              <button
                onClick={downloadPDF}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition hover:bg-emerald-400 sm:w-auto"
              >
                <BsDownload size={16} />
                Download PDF Evaluation
              </button>
            )}
          </div>

          {loading && (
            <div className="grid gap-5">
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse space-y-4">
                <div className="h-4 w-44 bg-slate-800 rounded"></div>
                <div className="h-8 w-72 bg-slate-800 rounded"></div>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-950/60 p-8 text-center shadow-lg">
              <p className="font-semibold text-red-300 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && report && (
            <>
              <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Multi-Dimensional Candidate Report
                    </span>
                    <h1 className="text-3xl font-extrabold text-white mt-1">
                      {report.role}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300">
                        {report.mode}
                      </span>
                      <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 capitalize text-slate-300">
                        {report.status}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-slate-300">
                        <BsCalendar3 size={13} />
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-center text-emerald-400 shadow-md">
                    <p className="text-xs font-bold uppercase tracking-wider">Overall Score</p>
                    <p className="mt-0.5 text-4xl font-black text-emerald-400">{report.finalScore}/10</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid gap-5 lg:grid-cols-3">
                <div className="grid gap-4 sm:grid-cols-3 lg:col-span-1 lg:grid-cols-1">
                  {[
                    { label: "Confidence", value: report.confidence },
                    { label: "Communication", value: report.communication },
                    { label: "Technical Depth", value: report.correctness },
                  ].map((item) => (
                    <ScoreBar key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Performance Trend</span>
                      <h2 className="mt-0.5 text-xl font-bold text-white">Question-by-Question Scores</h2>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <BsBarChart size={18} />
                    </div>
                  </div>

                  <div className="h-72 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={questionScoreData}
                        margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="name" stroke="#64748B" />
                        <YAxis domain={[0, 10]} stroke="#64748B" />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                        <Area
                          type="monotone"
                          dataKey="score"
                          name="Score"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#10b981" }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Turn by Turn Breakdown */}
              <div className="grid gap-5">
                {report.questionWiseScore?.map((item, index) => (
                  <div key={item._id || index} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-950 border border-slate-800 px-3.5 py-1 text-xs font-extrabold text-slate-300">
                        Question {index + 1}
                      </span>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-400">
                        {Number(item.score || 0).toFixed(1)}/10
                      </span>
                    </div>

                    <p className="text-base sm:text-lg font-bold text-white">{item.question}</p>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Candidate Answer</span>
                        <p className="rounded-xl bg-slate-950 p-4 text-slate-300 leading-relaxed border border-slate-800">
                          {item.answer || "No answer submitted."}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">AI Evaluator Feedback</span>
                        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 leading-relaxed">
                          {item.feedback || "No feedback available."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewReport;
