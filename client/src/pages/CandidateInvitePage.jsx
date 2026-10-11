import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion as Motion } from 'framer-motion';
import {
  FaUserCheck,
  FaBriefcase,
  FaClock,
  FaPlay,
  FaExclamationTriangle,
  FaBuilding,
  FaLayerGroup
} from 'react-icons/fa';
import axios from 'axios';
import { ServerUrl } from '../App';

const CandidateInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvitationDetails = useCallback(async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/recruiter/invite/${token}`);
      if (res.data.success && res.data.data) {
        setInvitation(res.data.data);
      } else {
        setError('Invitation not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    } else {
      setError('Invalid invitation link.');
      setLoading(false);
    }
  }, [token, fetchInvitationDetails]);

  const handleStartInterview = () => {
    if (!invitation) return;
    navigate('/interview', {
      state: {
        targetRole: invitation.roleTitle,
        experience: invitation.experienceLevel,
        interviewType: invitation.interviewMode || 'Technical',
        invitationToken: invitation.inviteToken
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center items-center">
        {loading ? (
          <div className="text-center space-y-4 py-16">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Verifying Candidate Access Token...</p>
          </div>
        ) : error ? (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/90 border border-red-500/30 p-8 rounded-3xl text-center space-y-4 max-w-md w-full shadow-2xl backdrop-blur-xl"
          >
            <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl">
              <FaExclamationTriangle />
            </div>
            <h2 className="text-xl font-bold text-white">Invalid Invitation</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs transition"
            >
              Return to Homepage
            </button>
          </Motion.div>
        ) : (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 border border-slate-800 p-8 sm:p-10 rounded-3xl w-full shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-emerald-400">
              <FaBuilding size={160} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FaUserCheck /> Official Interview Access Code
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Candidate Assessment Invitation
              </h1>
              <p className="text-xs text-slate-400">
                You have been invited to complete a structured AI technical evaluation.
              </p>
            </div>

            {/* Role & Specs Details Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Target Position</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{invitation.roleTitle}</h3>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                  INVITATION VALID
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <FaBriefcase className="text-purple-400 shrink-0" />
                  <span>Seniority: <strong>{invitation.experienceLevel}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FaLayerGroup className="text-emerald-400 shrink-0" />
                  <span>Format: <strong>{invitation.interviewMode || 'Technical'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FaUserCheck className="text-indigo-400 shrink-0" />
                  <span>Candidate Email: <strong>{invitation.candidateEmail}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <FaClock className="text-amber-400 shrink-0" />
                  <span>Expires: <strong>{new Date(invitation.expiresAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Guidance banner */}
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-slate-300 space-y-1">
              <p className="font-bold text-emerald-300">Important Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Ensure a working microphone and camera before starting.</li>
                <li>The interview will adapt to your answers in real-time.</li>
                <li>Your recruiter will receive an automated scorecard upon completion.</li>
              </ul>
            </div>

            {/* Action CTA */}
            <button
              onClick={handleStartInterview}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold py-4 rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 group"
            >
              <FaPlay className="text-xs group-hover:scale-110 transition-transform" />
              Start AI Interview Assessment Now
            </button>
          </Motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CandidateInvitePage;

