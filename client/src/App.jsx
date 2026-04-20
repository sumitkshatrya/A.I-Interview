import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice';
import Interview from './pages/Interview';
import InterviewHistory from './pages/InterviewHistory';
import Pricing from './pages/Pricing';
import InterviewReport from './pages/InterviewReport';



export const ServerUrl = "https://a-i-interview.onrender.com"

const App = () => {

  const dispatch = useDispatch();
  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + '/api/user/current-user', { withCredentials: true });  
       
        dispatch(setUserData(result.data));
      } catch (error) {
        console.log("Error fetching current user:", error);
        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);   
  return (
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/auth' element={<Auth />} />
         <Route path='/interview' element={<Interview />} />
          <Route path='/history' element={<InterviewHistory />} />
            <Route path='/pricing' element={<Pricing/>} />
            <Route path='/report' element={<Navigate to="/history" replace />} />
            <Route path='/report/:id' element={<InterviewReport/>} />
          
      </Routes>
  )
}

export default App
