import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion as Motion } from 'framer-motion';
import { FaUserPlus, FaLink, FaClipboardList, FaCheckCircle, FaClock, FaBuilding } from 'react-icons/fa';
import axios from 'axios';
import { ServerUrl } from '../App';

const RecruiterDashboard = () => {
  const [invitations, setInvitations] = useState([]);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Senior Level (4+ yrs)');
  const [interviewMode, setInterviewMode] = useState('Technical');
  const [createdUrl, setCreatedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await axios.get(ServerUrl + '/api/recruiter/dashboard', { withCredentials: true });
      setInvitations(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();
    if (!candidateEmail || !roleTitle) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        ServerUrl + '/api/recruiter/invite',
        { candidateEmail, roleTitle, experienceLevel, interviewMode },
        { withCredentials: true }
      );
      setCreatedUrl(res.data.data.inviteUrl);
      setCandidateEmail('');
      setRoleTitle('');
      fetchInvitations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Enterprise Talent Suite</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Recruiter & Employer Workspace</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create structured role invitations, issue secure interview links, and review candidate evaluation cards.
          </p>
        </div>

        {/* Create Invitation Form */}
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUserPlus className="text-emerald-400" /> Create Candidate Interview Invitation Link
          </h2>

          {error && <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl">{error}</div>}

          <form onSubmit={handleCreateInvite} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Candidate Email</label>
              <input
                type="email"
                required
                placeholder="candidate@company.com"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 transition"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Target Role Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 transition"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Experience Seniority</label>
              <select
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 transition"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                <option value="Mid Level (2-4 yrs)">Mid Level (2-4 yrs)</option>
                <option value="Senior Level (4+ yrs)">Senior Level (4+ yrs)</option>
                <option value="Lead / Principal">Lead / Principal</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Interview Format</label>
              <select
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 transition"
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value)}
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral (STAR)</option>
                <option value="Coding">Coding Speed Run</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs shadow-lg transition disabled:bg-slate-800"
              >
                {loading ? 'Generating Invitation Link...' : 'Issue Candidate Access Code'}
              </button>
            </div>
          </form>

          {createdUrl && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <FaCheckCircle /> Candidate Invitation Link Generated Successfully:
              </span>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  readOnly
                  value={createdUrl}
                  className="flex-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-white font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(createdUrl)}
                  className="bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md hover:bg-emerald-400 transition"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Issued Invitations List */}
        <div className="bg-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaClipboardList className="text-purple-400" /> Issued Candidate Invitations
            </h2>
            <p className="text-xs text-slate-400 mt-1">Track candidate progress and review completed reports.</p>
          </div>

          {invitations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
              No candidate invitations issued yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => {
                const fullLink = `${window.location.origin}/interview/invite/${inv.inviteToken}`;
                return (
                  <div key={inv._id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{inv.roleTitle}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Candidate: <strong>{inv.candidateEmail}</strong> ({inv.experienceLevel})</p>
                      <span className="text-[10px] text-slate-500 font-mono">Invite Token: {inv.inviteToken}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(fullLink)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Copy Candidate Invite Link"
                      >
                        <FaLink className="text-[10px]" /> Copy Link
                      </button>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        inv.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
