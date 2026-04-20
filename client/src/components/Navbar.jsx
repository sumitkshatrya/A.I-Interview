import { motion as Motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux';
import {BsRobot, BsCoin} from 'react-icons/bs'
import {HiOutlineLogout} from 'react-icons/hi'  
import { FaUserAstronaut } from 'react-icons/fa'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { ServerUrl } from '../App';
import AuthModel from './AuthModel';

const Navbar = () => {
    const {userData} = useSelector((state) => state.user);
    const [showCreditPopup, setShowCreditPopup] = useState(false);
    const [showUserPopup, setShowUserPopup] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
      try {
        
        await axios.get(ServerUrl + '/api/auth/logout',
          {withCredentials: true});
          dispatch(setUserData(null));
          setShowCreditPopup(false);
          setShowUserPopup(false);
           navigate('/');

      } catch (error) {
        console.log(error);
      }

    }
  return (
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
      <Motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3}} 
      className='w-full max-w-6xl bg-white rounded-2xl shadow-sm border border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center relative'>
        <button onClick={() => navigate('/')} className='flex items-center gap-3 cursor-pointer' aria-label='Go to home'>
            <div className='bg-black text-white p-2 rounded-lg '>
              <BsRobot size={18} />

            </div>
            <h1 className='font-semibold hidden md:block text-lg'>A.I Interview</h1>
            </button>

        <div className='flex items-center gap-3 sm:gap-6 relative'>
          <div className='relative'>
              <button onClick={()=> {
                if (!userData) {
                  setShowAuth(true)
                  return;
                }
                setShowCreditPopup(!showCreditPopup)
                ; setShowUserPopup(false)
              }
              }className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition' aria-label='Open credits menu'>
                <BsCoin size={20} />
                {userData?.credits || 0}
              </button>
              {showCreditPopup && (
                <div className='absolute right-[-72px] sm:right-[-50px] mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-10'>
                  <p className='text-sm text-gray-600 mb-4'>Need more credits to continue interviews?</p>
                  <button onClick={()=>{setShowCreditPopup(false); navigate('/pricing')}} className='w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90 transition'>Buy more Credits</button>
                </div>
              )}
          </div>
          
          <div className='relative'>
              <button onClick={()=> {
                if (!userData) {
                  setShowAuth(true)
                  return;
                }
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false)
              }} className='w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold' aria-label='Open account menu'>
               {userData?.name ? userData.name.charAt(0).toUpperCase() 
               : <FaUserAstronaut size={18} />}
              </button>
              {showUserPopup && (
                <div className='absolute right-0 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
                  <p className='text-md text-gray-900 font-semibold mb-1 truncate'>{userData?.name}</p>
                   <p className='text-sm text-gray-500 mb-4 truncate'>{userData?.email}</p>
                  <button onClick={()=>{setShowUserPopup(false); navigate('/history')}} className='w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90 transition mb-2'>History</button>
                  <button onClick={handleLogout} className='w-full bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2 justify-center relative'>
                    <span className='absolute left-6' >
                      <HiOutlineLogout size={18} />
                      </span>
                    Logout</button>
                </div>
              )}
          </div>
          
        </div>
        </Motion.div>

            {
              showAuth && <AuthModel onClose={()=>setShowAuth(false)}/>
            }
    </div>
  )
}

export default Navbar
