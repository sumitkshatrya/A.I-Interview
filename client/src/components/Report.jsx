import { useNavigate } from 'react-router-dom'
import { BsArrowLeft, BsDownload } from 'react-icons/bs'
import { motion as Motion } from 'framer-motion'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { downloadInterviewReportPDF } from '../utils/reportPdf'

const Report = ({ report }) => {
  const navigate = useNavigate()

  if (!report) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <h2 className='text-xl font-semibold'>Loading Report...</h2>
      </div>
    )
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = []
  } = report

  const questionScoreData = Array.from({ length: 5 }, (_, index) => ({
    name: `Q${index + 1}`,
    score: Number(questionWiseScore[index]?.score || 0)
  }))

  // Skills
  const skills = [
    { label: 'Confidence', value: confidence },
    { label: 'Communication', value: communication },
    { label: 'Correctness', value: correctness }
  ]

  // Performance text
  let performanceText = ""
  let shortTagline = ""

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities."
    shortTagline = "Excellent clarity and structured responses."
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement."
    shortTagline = "Good base, refine answers."
  } else {
    performanceText = "Needs major improvement."
    shortTagline = "Work on clarity & confidence."
  }

  const percentage = (finalScore / 10) * 100

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
  }

  const downloadPDF = () => {
    downloadInterviewReportPDF(report)
  }

  return (
    <div className='min-h-screen bg-gray-50 px-4 py-5 sm:px-6 lg:px-8'>

      {/* HEADER */}
      <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate('/history')}
          className='inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'
        >
          <BsArrowLeft /> Back
        </button>

        <button
          onClick={downloadPDF}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-green-700 sm:w-auto"
        >
          <BsDownload size={17} />
          Download PDF
        </button>
      </div>

      <h1 className='mx-auto mb-6 max-w-7xl text-2xl font-bold text-gray-950 sm:text-3xl'>
        Interview Analytics Dashboard
      </h1>

      <div className='mx-auto grid max-w-7xl gap-5 lg:grid-cols-3 lg:gap-6'>

        {/* LEFT */}
        <div className='space-y-5 lg:space-y-6'>

          {/* SCORE */}
          <Motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'
          >
            <h3 className='mb-4 font-semibold text-gray-950'>Overall Performance</h3>

            <div className='mx-auto w-24 sm:w-28'>
              <CircularProgressbar
                value={percentage}
                text={`${finalScore}/10`}
                styles={buildStyles({
                  pathColor: "#10b981",
                  textColor: "#111"
                })}
              />
            </div>

            <p className='mt-4 text-center font-medium text-gray-900'>{performanceText}</p>
            <p className='text-center text-gray-500 text-sm'>
              {shortTagline}
            </p>
          </Motion.div>

          {/* SKILLS */}
          <Motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'
          >
            <h3 className='mb-4 font-semibold'>Skill Evaluation</h3>

            {skills.map((s, i) => (
              <div key={i} className='mb-4 last:mb-0'>
                <div className='flex justify-between'>
                  <span>{s.label}</span>
                  <span>{s.value}</span>
                </div>

                <div className='mt-2 h-2 overflow-hidden rounded-full bg-gray-200'>
                  <div
                    className='h-full rounded-full bg-green-500'
                    style={{ width: `${Math.min(Number(s.value || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </Motion.div>

        </div>

        {/* RIGHT */}
        <div className='space-y-5 lg:col-span-2 lg:space-y-6'>

          {/* PERFORMANCE TREND */}
          <Motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'
          >
            <h3 className='mb-4 font-semibold'>Performance Trend</h3>

            <div className='h-64 min-w-0 sm:h-72'>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
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
          </Motion.div>

          {/* QUESTIONS */}
          <Motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4 }}
            className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'
          >
            <h3 className='mb-4 font-semibold'>Question Breakdown</h3>

            {questionWiseScore.map((q, i) => (
              <Motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className='mb-4 rounded-2xl bg-gray-100 p-4 last:mb-0'
              >
                <p className='text-sm text-gray-500'>
                  Question {i + 1}
                </p>

                <p className='break-words font-medium text-gray-950'>
                  {q.question || "No question"}
                </p>

                <p className='text-green-600 font-bold'>
                  {q.score || 0}/10
                </p>

                <p className='mt-2 break-words text-sm text-gray-700'>
                  {q.feedback || "No feedback"}
                </p>
              </Motion.div>
            ))}
          </Motion.div>

        </div>
      </div>
    </div>
  )
}

export default Report
