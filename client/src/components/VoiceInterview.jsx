import { useCallback, useEffect, useRef, useState } from 'react';
import femaleVideo from '../assets/Videos/female-ai.mp4';
import Timer from './Timer';
import { motion as Motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaExclamationTriangle, FaChalkboardTeacher, FaPause, FaPlay } from 'react-icons/fa';
import axios from 'axios';
import { ServerUrl } from '../App';
import { BsArrowRight } from 'react-icons/bs';

const VoiceInterview = ({ interviewData, onFinish }) => {
  const {
    interviewId,
    userName = "there",
    questions: initialQuestions = [],
    currentQuestion: initialCurrentQ,
    totalQuestions: maxTotal = 5
  } = interviewData || {};

  const [questionsList, setQuestionsList] = useState(
    initialQuestions.length > 0 ? initialQuestions : [initialCurrentQ]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [networkError, setNetworkError] = useState(false);

  const recognitionRef = useRef(null);
  const submitAnswerRef = useRef(null);
  const isRecognitionRunningRef = useRef(false);
  const isAIPlayingRef = useRef(false);
  const isMicOnRef = useRef(true);
  const introSpokenRef = useRef(false);
  const spokenQuestionIndexRef = useRef(null);
  const activeSpeechIdRef = useRef(0);
  const videoRef = useRef(null);

  const currentQuestion = questionsList[currentIndex] || initialCurrentQ;
  const isLastStep = currentIndex + 1 >= maxTotal;

  // Auto transition intro phase after safety timeout so timer never gets stuck
  useEffect(() => {
    const introTimeout = setTimeout(() => {
      setIsIntroPhase(false);
    }, 1200);
    return () => clearTimeout(introTimeout);
  }, []);

  // Autosave Interview Recovery
  useEffect(() => {
    if (interviewId && currentQuestion) {
      const stateToSave = {
        interviewId,
        currentIndex,
        answer,
        questionsList
      };
      localStorage.setItem(`interview_recovery_${interviewId}`, JSON.stringify(stateToSave));
    }
  }, [interviewId, currentIndex, answer, questionsList, currentQuestion]);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    isAIPlayingRef.current = isAIPlaying;
  }, [isAIPlaying]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const female = voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("female"));
      setSelectedVoice(female || voices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const stopMic = useCallback(() => {
    if (!recognitionRef.current || !isRecognitionRunningRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.log(e);
    } finally {
      isRecognitionRunningRef.current = false;
    }
  }, []);

  const startMic = useCallback(() => {
    if (!recognitionRef.current || isAIPlayingRef.current || isRecognitionRunningRef.current) return;
    try {
      recognitionRef.current.start();
      isRecognitionRunningRef.current = true;
    } catch {
      isRecognitionRunningRef.current = false;
    }
  }, []);

  const speakText = useCallback((text) => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window) || !selectedVoice || !text) {
        setSubtitle(text || "");
        resolve();
        return;
      }

      const speechId = activeSpeechIdRef.current + 1;
      activeSpeechIdRef.current = speechId;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        isAIPlayingRef.current = true;
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
        setIsAIPlaying(false);
        isAIPlayingRef.current = false;
        setTimeout(() => {
          if (activeSpeechIdRef.current === speechId && isMicOnRef.current) {
            startMic();
          }
        }, 300);
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      utterance.onerror = () => {
        videoRef.current?.pause();
        setIsAIPlaying(false);
        isAIPlayingRef.current = false;
        setSubtitle("");
        resolve();
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  }, [selectedVoice, startMic, stopMic]);

  useEffect(() => {
    let isCancelled = false;
    const runIntro = async () => {
      if (isIntroPhase && !introSpokenRef.current) {
        introSpokenRef.current = true;
        await speakText(`Hello ${userName}, welcome to your adaptive session. Let's begin.`);
        if (!isCancelled) setIsIntroPhase(false);
      } else if (!isIntroPhase && currentQuestion && spokenQuestionIndexRef.current !== currentIndex) {
        spokenQuestionIndexRef.current = currentIndex;
        await new Promise(r => setTimeout(r, 400));
        await speakText(currentQuestion.question);
      }
    };
    runIntro();
    return () => { isCancelled = true; };
  }, [isIntroPhase, currentIndex, currentQuestion, speakText, userName]);

  // CONTINUOUS RELIABLE TIMER COUNTDOWN
  useEffect(() => {
    if (!currentQuestion || isSubmitting || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, isSubmitting, isTimerPaused, currentIndex]);

  // Reset timer duration whenever question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
      setIsTimerPaused(false);
    }
  }, [currentIndex, currentQuestion]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      setAnswer((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onend = () => { isRecognitionRunningRef.current = false; };
    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting || !currentQuestion) return;
    stopMic();
    setIsSubmitting(true);
    setNetworkError(false);

    try {
      const res = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: (currentQuestion.timeLimit || 60) - timeLeft
        },
        { withCredentials: true }
      );

      const resData = res.data.data || res.data;
      setFeedback(resData.feedback);
      setLatestEvaluation(resData.evaluation || null);
      await speakText(resData.feedback);

      setIsSubmitting(false);

      if (resData.isFinished || isLastStep) {
        stopMic();
        setIsMicOn(false);
      } else if (resData.nextQuestion) {
        setQuestionsList((prev) => [...prev, resData.nextQuestion]);
        setAnswer("");
        setFeedback("");
        setCurrentIndex((prev) => prev + 1);
        if (resData.transitionText) {
          await speakText(resData.transitionText);
        }
      }
    } catch (err) {
      console.error(err);
      setNetworkError(true);
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setAnswer("");
    setFeedback("");
    setLatestEvaluation(null);
    if (currentIndex + 1 < questionsList.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const finishInterview = async () => {
    if (isFinishing) return;
    stopMic();
    setIsMicOn(false);
    setIsFinishing(true);

    try {
      const res = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );
      localStorage.removeItem(`interview_recovery_${interviewId}`);
      onFinish(res.data.data || res.data);
    } catch (e) {
      console.log(e);
      setIsFinishing(false);
    }
  };

  useEffect(() => {
    if (currentQuestion && timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswerRef.current?.();
    }
  }, [timeLeft, currentQuestion, isSubmitting, feedback]);

  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col md:flex-row min-h-160">
        {/* Left Video Avatar Panel */}
        <div className="w-full md:w-95 bg-slate-950 p-6 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between items-center text-center relative">
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Bar Raiser Avatar</span>
            <button
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              {isTimerPaused ? <FaPlay className="text-emerald-400" size={10} /> : <FaPause className="text-amber-400" size={10} />}
              {isTimerPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          {/* Avatar Video & Waveform */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl my-4">
            <video
              ref={videoRef}
              src={femaleVideo}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            {isAIPlaying && (
              <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-emerald-400 opacity-30" />
              </div>
            )}
          </div>

          {subtitle && (
            <div className="w-full px-3 py-1.5 mb-2 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-emerald-400 font-medium italic line-clamp-2">
              &quot;{subtitle}&quot;
            </div>
          )}

          <div className="w-full space-y-3">
            <div className="flex justify-center items-center gap-3">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>

            <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-3 text-slate-400 font-semibold">
              <span>Question {currentIndex + 1} of {maxTotal}</span>
              <span className="font-extrabold text-emerald-400">{Math.round(((currentIndex + 1) / maxTotal) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Right Interaction Panel */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 justify-between relative bg-slate-900/60">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Adaptive AI Mock Interviewer
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Speak your response into the microphone or type below. The AI evaluates answer quality and adapts next question.
            </p>

            {networkError && (
              <div className="mb-4 p-3.5 bg-amber-950/60 border border-amber-500/40 rounded-2xl text-xs font-semibold text-amber-300 flex items-center justify-between shadow-lg">
                <span className="flex items-center gap-1.5"><FaExclamationTriangle /> Connection interrupted. Progress saved.</span>
                <button onClick={submitAnswer} className="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-[11px]">Retry Submit</button>
              </div>
            )}

            {!isIntroPhase && currentQuestion && (
              <div className="mb-4 bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Topic: {currentQuestion.competency || 'Core Competency'} (Difficulty: {currentQuestion.difficulty || 3}/5)
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>
            )}

            <textarea
              placeholder="Type your response here..."
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              rows={5}
              className="w-full bg-slate-950 p-4 rounded-2xl resize-none outline-none border border-slate-800 focus:border-emerald-500 transition text-sm text-slate-100 placeholder-slate-500"
            />
          </div>

          <div className="mt-4 space-y-3">
            {latestEvaluation && (latestEvaluation.teachingExplanation || latestEvaluation.finalScore < 7.0) && (
              <div className="p-4 bg-purple-950/60 border border-purple-500/40 rounded-2xl text-xs space-y-1 shadow-lg">
                <div className="font-bold text-purple-300 flex items-center gap-1.5">
                  <FaChalkboardTeacher className="text-purple-400" /> AI Teaching & Concept Lesson:
                </div>
                <p className="text-purple-200 leading-relaxed font-medium">
                  {latestEvaluation.teachingExplanation || latestEvaluation.idealAnswerStructure || "To score high on this topic, focus on clearly explaining your architectural trade-offs, technical steps, and measurable results."}
                </p>
              </div>
            )}

            {!feedback ? (
              <div className="flex items-center gap-3">
                <Motion.button
                  onClick={toggleMic}
                  whileTap={{ scale: 0.9 }}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg shrink-0 transition ${
                    isMicOn ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isMicOn ? <FaMicrophone size={18} /> : <FaMicrophoneSlash size={18} />}
                </Motion.button>

                <button
                  onClick={submitAnswer}
                  disabled={isSubmitting || !answer.trim()}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-2xl shadow-lg font-extrabold text-sm transition disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {isSubmitting ? 'Evaluating Answer Quality...' : 'Submit Answer'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 border border-emerald-500/40 p-4 rounded-2xl space-y-3 shadow-xl">
                <p className="text-xs text-emerald-300 font-semibold leading-relaxed">{feedback}</p>
                <button
                  onClick={isLastStep ? finishInterview : handleNext}
                  disabled={isFinishing}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {isLastStep ? (isFinishing ? 'Generating Final Report...' : 'View Complete Multi-Dimensional Report') : 'Next Question'}
                  <BsArrowRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterview;
