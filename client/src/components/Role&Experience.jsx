import { motion as Motion } from 'framer-motion'
import { useState } from 'react'
import {
  FaBriefcase,
  FaChartLine,
  FaFileUpload,
  FaMicrophoneAlt,
  FaUserTie,
} from 'react-icons/fa'
import { BsArrowLeft, BsCheckCircle, BsFileEarmarkPdf, BsInfoCircle, BsX } from 'react-icons/bs'
import axios from 'axios'
import { ServerUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

const setupSteps = [
  {
    icon: <FaUserTie className='text-green-600 text-xl' />,
    title: 'Profile',
    text: 'Choose role and experience',
  },
  {
    icon: <FaMicrophoneAlt className='text-blue-600 text-xl' />,
    title: 'Voice',
    text: 'Answer like a real interview',
  },
  {
    icon: <FaChartLine className='text-amber-600 text-xl' />,
    title: 'Report',
    text: 'Get scores and feedback',
  },
]

const modeOptions = [
  {
    value: 'Technical',
    title: 'Technical',
    desc: 'Skills, projects, and practical depth',
  },
  {
    value: 'HR',
    title: 'HR',
    desc: 'Behavior, communication, and confidence',
  },
]

const RoleAndExperience = ({ onStart }) => {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('')
  const [mode, setMode] = useState('Technical')
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [resumeText, setResumeText] = useState('')
  const [analysisDone, setAnalysisDone] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const credits = userData?.credits || 0
  const canStart = Boolean(role.trim() && experience.trim() && !loading)

  const handleFileChange = (file) => {
    setError('')
    setAnalysisDone(false)
    setProjects([])
    setSkills([])
    setResumeText('')

    if (!file) {
      setResumeFile(null)
      return
    }

    if (file.type !== 'application/pdf') {
      setResumeFile(null)
      setError('Please upload a PDF resume only.')
      return
    }

    setResumeFile(file)
  }

  const resetResume = () => {
    setResumeFile(null)
    setAnalysisDone(false)
    setProjects([])
    setSkills([])
    setResumeText('')
  }

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return

    setAnalyzing(true)
    setError('')

    const formdata = new FormData()
    formdata.append('resume', resumeFile)

    try {
      const result = await axios.post(ServerUrl + '/api/interview/resume', formdata, { withCredentials: true })

      setRole(result.data.role || '')
      setExperience(result.data.experience || '')
      setProjects(result.data.projects || [])
      setSkills(result.data.skills || [])
      setResumeText(result.data.resumeText || '')
      setAnalysisDone(true)
    } catch (error) {
      console.log(error)
      setError(error.response?.data?.message || 'Resume analysis failed. You can still continue manually.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleStart = async () => {
    if (!canStart) return

    setLoading(true)
    setError('')

    try {
      const result = await axios.post(
        ServerUrl + '/api/interview/generate-questions',
        {
          role,
          experience,
          mode,
          resumeText,
          projects,
          skills,
        },
        { withCredentials: true }
      )

      if (userData) {
        dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
      }

      onStart(result.data)
    } catch (error) {
      console.log(error)
      setError(error.response?.data?.message || 'Unable to start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className='min-h-screen bg-[#f3f3f3] px-4 py-6 sm:py-10'
    >
      <div className='mx-auto w-full max-w-6xl'>
        <button
          onClick={() => navigate('/')}
          className='mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'
        >
          <BsArrowLeft size={16} />
          Back
        </button>

        <div className='grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl lg:grid-cols-[0.92fr_1.08fr]'>
          <Motion.aside
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className='relative flex flex-col justify-between bg-gray-950 p-6 text-white sm:p-8 lg:p-10'
          >
            <div>
              <div className='mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-green-200'>
                <BsInfoCircle size={16} />
                50 credits per interview
              </div>

              <h1 className='max-w-md text-3xl font-semibold leading-tight sm:text-4xl'>
                Set up a focused mock interview
              </h1>
              <p className='mt-4 max-w-md text-sm leading-relaxed text-gray-300 sm:text-base'>
                Add your target role, experience level, and optional resume. The AI will generate questions around your actual background.
              </p>

              <div className='mt-8 grid gap-3'>
                {setupSteps.map((item, index) => (
                  <div key={item.title} className='flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-4'>
                    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white'>
                      {item.icon}
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-white'>
                        {index + 1}. {item.title}
                      </p>
                      <p className='text-sm text-gray-300'>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-5'>
              <p className='text-sm font-semibold text-gray-300'>Available credits</p>
              <div className='mt-2 flex items-end justify-between gap-4'>
                <p className='text-4xl font-semibold'>{credits}</p>
                <p className={`rounded-full px-3 py-1 text-xs font-semibold ${credits >= 50 ? 'bg-green-400/15 text-green-200' : 'bg-red-400/15 text-red-200'}`}>
                  {credits >= 50 ? 'Ready' : 'Need credits'}
                </p>
              </div>
            </div>
          </Motion.aside>

          <Motion.section
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45 }}
            className='p-6 sm:p-8 lg:p-10'
          >
            <div className='mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-wide text-green-600'>Interview Setup</p>
                <h2 className='mt-2 text-3xl font-semibold text-gray-950'>Tell us your target</h2>
              </div>
              <div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600'>
                Required fields are marked by labels.
              </div>
            </div>

            <div className='space-y-6'>
              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>Role</label>
                <div className='relative'>
                  <FaUserTie className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Frontend Developer, Data Analyst, Product Manager...'
                    className='w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 outline-none transition focus:bg-white focus:ring-2 focus:ring-green-500'
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                  />
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>Experience</label>
                <div className='relative'>
                  <FaBriefcase className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Fresher, 1 year, 3 years, senior level...'
                    className='w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 outline-none transition focus:bg-white focus:ring-2 focus:ring-green-500'
                    onChange={(e) => setExperience(e.target.value)}
                    value={experience}
                  />
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>Interview Mode</label>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {modeOptions.map((modeOption) => (
                    <button
                      key={modeOption.value}
                      type='button'
                      onClick={() => setMode(modeOption.value)}
                      className={`rounded-xl border p-4 text-left transition ${
                        mode === modeOption.value
                          ? 'border-green-300 bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      <div className='flex items-center justify-between gap-3'>
                        <p className='font-semibold text-gray-950'>{modeOption.title}</p>
                        {mode === modeOption.value && <BsCheckCircle className='text-green-600' size={18} />}
                      </div>
                      <p className='mt-1 text-sm text-gray-500'>{modeOption.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>Resume</label>
                <div
                  onClick={() => document.getElementById('resumeUpload').click()}
                  className='rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 transition hover:border-green-500 hover:bg-green-50'
                >
                  <input
                    type='file'
                    accept='application/pdf'
                    id='resumeUpload'
                    className='hidden'
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />

                  {!resumeFile ? (
                    <div className='text-center'>
                      <FaFileUpload className='mx-auto mb-3 text-4xl text-green-600' />
                      <p className='font-semibold text-gray-800'>Upload resume PDF</p>
                      <p className='mt-1 text-sm text-gray-500'>Optional, but it helps generate project-specific questions.</p>
                    </div>
                  ) : (
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm'>
                          <BsFileEarmarkPdf size={22} />
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate font-semibold text-gray-900'>{resumeFile.name}</p>
                          <p className='text-sm text-gray-500'>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            resetResume()
                          }}
                          className='inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-3 text-gray-700 transition hover:bg-gray-100'
                          aria-label='Remove resume'
                        >
                          <BsX size={18} />
                        </button>
                        <button
                          type='button'
                          disabled={analyzing}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUploadResume()
                          }}
                          className='rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:bg-gray-500'
                        >
                          {analyzing ? 'Analyzing...' : analysisDone ? 'Analyze Again' : 'Analyze Resume'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {analysisDone && (
                <Motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='rounded-2xl border border-green-200 bg-green-50 p-5'
                >
                  <div className='mb-4 flex items-center gap-2 text-green-700'>
                    <BsCheckCircle size={18} />
                    <h3 className='font-semibold'>Resume analysis applied</h3>
                  </div>

                  <div className='grid gap-4 lg:grid-cols-2'>
                    {projects.length > 0 && (
                      <div>
                        <p className='mb-2 text-sm font-semibold text-gray-700'>Projects</p>
                        <ul className='space-y-2 text-sm text-gray-700'>
                          {projects.slice(0, 4).map((project, index) => (
                            <li key={index} className='rounded-xl bg-white px-3 py-2'>{project}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {skills.length > 0 && (
                      <div>
                        <p className='mb-2 text-sm font-semibold text-gray-700'>Skills</p>
                        <div className='flex flex-wrap gap-2'>
                          {skills.slice(0, 12).map((skill, index) => (
                            <span key={index} className='rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700'>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Motion.div>
              )}

              {error && (
                <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700'>
                  {error}
                </div>
              )}

              <div className='rounded-2xl border border-gray-200 bg-gray-50 p-4'>
                <div className='mb-4 flex items-center justify-between gap-3 text-sm'>
                  <span className='font-semibold text-gray-700'>Setup status</span>
                  <span className={canStart ? 'font-semibold text-green-700' : 'font-semibold text-gray-500'}>
                    {canStart ? 'Ready to start' : 'Role and experience required'}
                  </span>
                </div>

                <Motion.button
                  onClick={handleStart}
                  disabled={!canStart}
                  whileTap={{ scale: canStart ? 0.98 : 1 }}
                  className='w-full rounded-full bg-green-600 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed'
                >
                  {loading ? 'Generating Questions...' : 'Start Interview'}
                </Motion.button>
              </div>
            </div>
          </Motion.section>
        </div>
      </div>
    </Motion.div>
  )
}

export default RoleAndExperience
