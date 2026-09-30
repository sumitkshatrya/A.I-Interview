import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice';
import Interview from './pages/Interview';
import InterviewHistory from './pages/InterviewHistory';
import Pricing from './pages/Pricing';
import InterviewReport from './pages/InterviewReport';
import ResumeTemplate from './pages/ResumeTemplate';
import CareerHub from './pages/CareerHub';
import CareerCoachPage from './pages/CareerCoachPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateInvitePage from './pages/CandidateInvitePage';

export const ServerUrl = (import.meta.env?.VITE_SERVER_URL || "http://localhost:8000").replace(/\/$/, "");

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + '/api/user/current-user', { withCredentials: true });
        const user = result.data.data || result.data;
        dispatch(setUserData(user));
      } catch (error) {
        console.log("Error fetching current user:", error);
        dispatch(setUserData(null));
      }
    };

    getUser();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/interview" element={<Interview />} />
      <Route path="/interview/invite/:token" element={<CandidateInvitePage />} />
      <Route path="/invite/:token" element={<CandidateInvitePage />} />
      <Route path="/history" element={<InterviewHistory />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/report" element={<Navigate to="/history" replace />} />
      <Route path="/report/:id" element={<InterviewReport />} />
      <Route path="/resume-template" element={<ResumeTemplate />} />
      <Route path="/career-hub" element={<CareerHub />} />
      <Route path="/coach" element={<CareerCoachPage />} />
      <Route path="/recruiter" element={<RecruiterDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
