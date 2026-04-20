import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { BsArrowLeft, BsBarChart, BsCalendar3, BsDownload } from 'react-icons/bs'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Navbar from '../components/Navbar'
import { ServerUrl } from '../App'
import { downloadInterviewReportPDF } from '../utils/reportPdf'

const InterviewReport = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const getReport = async () => {
      try {
        setLoading(true)
        setError("")
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id,
          {withCredentials:true})
        setReport(result.data)
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load interview report.")
      } finally {
        setLoading(false)
      }
    }

    getReport()
  }, [id])

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available"

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const scoreColor = (value) => {
    const score = Number(value || 0)

    if (score >= 8) return "bg-green-500"
    if (score >= 5) return "bg-yellow-500"
    return "bg-red-500"
  }

  const downloadPDF = () => {
    downloadInterviewReportPDF(report)
  }

  const questionScoreData = Array.from({ length: 5 }, (_, index) => ({
    name: `Q${index + 1}`,
    score: Number(report?.questionWiseScore?.[index]?.score || 0),
  }))

  const ScoreBar = ({ label, value }) => {
    const score = Number(value || 0)

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
          <BsBarChart size={20} />
        </div>
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-950">{score.toFixed(1)}/10</p>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${scoreColor(score)}`}
            style={{ width: `${Math.min(score * 10, 100)}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <Navbar />

      <main className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => navigate('/history')}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <BsArrowLeft size={16} />
              Back to History
            </button>

            {!loading && !error && report && (
              <button
                onClick={downloadPDF}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 sm:w-auto"
              >
                <BsDownload size={17} />
                Download PDF
              </button>
            )}
          </div>

          {loading && (
            <div className="grid gap-5">
              <div className="app-panel animate-pulse p-8">
                <div className="mb-4 h-5 w-44 rounded-full bg-gray-100"></div>
                <div className="mb-4 h-10 w-72 max-w-full rounded-xl bg-gray-100"></div>
                <div className="h-5 w-56 max-w-full rounded-full bg-gray-100"></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-40 rounded-2xl bg-white"></div>
                <div className="h-40 rounded-2xl bg-white"></div>
                <div className="h-40 rounded-2xl bg-white"></div>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
              <p className="font-semibold text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && report && (
            <>
              <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-600">
                      Interview Report
                    </p>
                    <h1 className="text-3xl font-semibold text-gray-950 md:text-5xl">
                      {report.role}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-gray-600">
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                        {report.mode}
                      </span>
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 capitalize text-gray-700">
                        {report.status}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
                        <BsCalendar3 size={14} />
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5 text-center text-green-700">
                    <p className="text-sm font-semibold">Final Score</p>
                    <p className="mt-1 text-4xl font-semibold">{report.finalScore}/10</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid gap-5 lg:grid-cols-3">
                <div className="grid gap-4 sm:grid-cols-3 lg:col-span-1 lg:grid-cols-1">
                  {[
                    { label: "Confidence", value: report.confidence },
                    { label: "Communication", value: report.communication },
                    { label: "Correctness", value: report.correctness },
                  ].map((item) => (
                    <ScoreBar key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-green-600">Performance Trend</p>
                      <h2 className="mt-1 text-xl font-semibold text-gray-950">Question wise scores</h2>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <BsBarChart size={20} />
                    </div>
                  </div>

                  <div className="h-72 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={questionScoreData}
                        margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="score"
                          name="Score"
                          stroke="#22c55e"
                          fill="#bbf7d0"
                          fillOpacity={0.7}
                          strokeWidth={3}
                          dot={{ r: 3, fill: "#22c55e" }}
                          activeDot={{ r: 5 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid gap-5">
                {report.questionWiseScore?.map((item, index) => (
                  <div key={item._id || index} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                        Question {index + 1}
                      </span>
                      <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                        {Number(item.score || 0).toFixed(1)}/10
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-950">{item.question}</p>
                    <p className="mt-4 text-sm font-semibold uppercase text-gray-400">Answer</p>
                    <p className="mt-1 rounded-xl bg-gray-50 p-4 text-gray-700">{item.answer || "No answer submitted."}</p>
                    <p className="mt-4 text-sm font-semibold uppercase text-gray-400">Feedback</p>
                    <p className="mt-1 rounded-xl border border-green-100 bg-green-50 p-4 text-green-800">{item.feedback || "No feedback available."}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default InterviewReport
