import { BsRobot } from 'react-icons/bs'
import { IoSparkles } from 'react-icons/io5'
import { FcGoogle } from 'react-icons/fc'
import { motion as Motion } from 'framer-motion'
import { auth, provider } from '../utils/firebase'
import { signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import { ServerUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'

const Auth = ({ isModel = false }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleGoogleAuth = async () => {
    try {
      const response = await signInWithPopup(auth, provider)
      const user = response.user

      const result = await axios.post(
        ServerUrl + '/api/auth/google-login',
        {
          name: user.displayName,
          email: user.email,
        },
        { withCredentials: true }
      )

      dispatch(setUserData(result.data))
      if (!isModel) {
        navigate('/')
      }
    } catch (error) {
      console.log(error)
      dispatch(setUserData(null))
    }
  }

  return (
    <div className={`w-full ${isModel ? 'py-4' : 'min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20'}`}>
      <Motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={`w-full ${isModel ? 'max-w-md p-8' : 'max-w-lg p-8 sm:p-12'} rounded-2xl bg-white shadow-xl border border-gray-200`}
      >
        <div className='flex items-center justify-center gap-3 mb-6'>
          <div className='bg-black text-white p-2 rounded-lg'>
            <BsRobot size={18} />
          </div>
          <h1 className='text-lg font-semibold'>AI Interview</h1>
        </div>

        <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>
          Continue with{' '}
          <span className='bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
            <IoSparkles size={16} />
            AI Smart Interview
          </span>
        </h1>

        <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
          Sign in to practice AI mock interviews, get real-time feedback, track your progress, and improve your interview confidence.
        </p>

        <Motion.button
          onClick={handleGoogleAuth}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className='w-full flex items-center justify-center gap-3 py-3 rounded-full shadow-md font-medium bg-green-600 text-white hover:bg-green-700 transition-colors duration-300'
        >
          <FcGoogle size={20} />
          Continue with Google
        </Motion.button>
      </Motion.div>
    </div>
  )
}

export default Auth
