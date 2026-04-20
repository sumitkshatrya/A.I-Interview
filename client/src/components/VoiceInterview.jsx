import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import maleVideo from '../assets/Videos/male-ai.mp4'
import femaleVideo from '../assets/Videos/female-ai.mp4'
import Timer from './Timer';
import { motion as Motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import axios from 'axios';
import { ServerUrl } from '../App'
import { BsArrowRight } from 'react-icons/bs';


const VoiceInterview = ({interviewData, onFinish}) => {
 const {interviewId, userName = "there", questions: generatedQuestions = []} = interviewData || {};
 const questions = useMemo(() => generatedQuestions.slice(0, 5), [generatedQuestions]);
 const [isIntroPhase, setIsIntroPhase] = useState(true);

 const [isMicOn, setIsMicOn] = useState(true);
 const recognitionRef = useRef(null);
 const submitAnswerRef = useRef(null);
 const isRecognitionRunningRef = useRef(false);
 const [isAIPlaying, setIsAIPlaying] = useState(false);
 const isAIPlayingRef = useRef(false);
 const isMicOnRef = useRef(true);
 const introSpokenRef = useRef(false);
 const spokenQuestionIndexRef = useRef(null);
 const activeSpeechIdRef = useRef(0);

 const [currentIndex, setCurrentIndex] = useState(0);
 const [answer, setAnswer] = useState(""); 
 const [feedback, setFeedback] = useState("");
 const [timeLeft, setTimeLeft] = useState(
  questions[0]?.timeLimit || 60
 );
const [selectedVoice, setSelectedVoice] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
const [isFinishing, setIsFinishing] = useState(false);
const [voiceGender, setVoiceGender] = useState("female");
const [subtitle, setSubtitle] = useState("");

const videoRef = useRef(null);

const currentQuestion = questions[currentIndex];
const isLastQuestion = currentIndex + 1 >= questions.length;
const hasCompletedAllQuestions = questions.length > 0 && currentIndex >= questions.length;
const displayQuestionNumber = questions.length ? Math.min(currentIndex + 1, questions.length) : 0;
const progress = questions.length ? Math.min((displayQuestionNumber / questions.length) * 100, 100) : 0;

useEffect(() => {
  isMicOnRef.current = isMicOn;
}, [isMicOn]);

useEffect(() => {
  isAIPlayingRef.current = isAIPlaying;
}, [isAIPlaying]);


useEffect(()=>{
 if (!("speechSynthesis" in window)) return;

 const loadVoices = () =>{
  const voices = window.speechSynthesis.getVoices();
  if(!voices.length) return;

  // Try known female voices first
  const femaleVoice = voices.find(v =>
    v.name.toLowerCase().includes("zira") || 
    v.name.toLowerCase().includes("samantha") ||
    v.name.toLowerCase().includes("female")
  );

  if (femaleVoice) {
    setSelectedVoice(femaleVoice);
    setVoiceGender("female");
    return;
  }

  // Try known male voices
  const maleVoice = voices.find(v =>
    v.name.toLowerCase().includes("mark") || 
    v.name.toLowerCase().includes("david") ||
    v.name.toLowerCase().includes("male")
  );

  if (maleVoice) {
    setSelectedVoice(maleVoice);  
    setVoiceGender("male");
    return;
  }

  // Fallback: first voice (assume available)
    setSelectedVoice(voices[0]);
    setVoiceGender("female");
  };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
 
},[])


   const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;  

  const stopMic = useCallback(() => {
    if (!recognitionRef.current || !isRecognitionRunningRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.log("Speech recognition stop error:", error);
    } finally {
      isRecognitionRunningRef.current = false;
    }
  }, []);

  const startMic = useCallback(() => {
    if (!recognitionRef.current || isAIPlayingRef.current || isRecognitionRunningRef.current) return;

    try {
      recognitionRef.current.start();
      isRecognitionRunningRef.current = true;
    } catch (error) {
      isRecognitionRunningRef.current = false;
      console.log("Speech recognition start error:", error);
    }
  }, []);

  // -------------SPEAK FUNCTION-------------------------------//
  const speakText = useCallback((text) =>{
    return new Promise((resolve) =>{
      if(!("speechSynthesis" in window) || !selectedVoice || !text){
        resolve();
        return;
      }

      const speechId = activeSpeechIdRef.current + 1;
      activeSpeechIdRef.current = speechId;
      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods

    const humanText = text
    .replace(/,/g, ", ...")
    .replace(/\./g, ". ...");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92; // Slightly slower for better clarity
      utterance.pitch = 1.05; // Slightly higher pitch for a more engaging tone
      utterance.volume = 1; // Full volume

      utterance.onstart = () => {
        setIsAIPlaying(true);
        isAIPlayingRef.current = true;
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        
        setIsAIPlaying(false);
        isAIPlayingRef.current = false;

          setTimeout(()=>{
            if (activeSpeechIdRef.current === speechId && isMicOnRef.current) {
              startMic();
            }
          }, 300 ) 
        
        setTimeout(()=>{
          setSubtitle("");
          resolve();
        },300); // Short pause after speaking before resolving
       };

       utterance.onerror = (event) => {
        console.log("Speech synthesis error:", event.error);
        videoRef.current?.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
        setIsAIPlaying(false);
        isAIPlayingRef.current = false;
        setSubtitle("");
        resolve();
       };

       setSubtitle(text);

       window.speechSynthesis.speak(utterance);
    })
  }, [selectedVoice, startMic, stopMic])


  useEffect(()=>{
    if(!selectedVoice) {
      return;
    }
    let isCancelled = false;

    const runIntro = async () =>{
      if(isIntroPhase && !introSpokenRef.current){
        introSpokenRef.current = true;
        await speakText(
        `Hello ${userName}, it's great to meet you today. I hope you're doing well. Let's get started with your interview.`
       );

       await speakText(
        `I'll ask you a few questions. Just answer naturally, and take your time.
        Let's begin.`
       );

       if (!isCancelled) {
        setIsIntroPhase(false);
       }
      }else if(!isIntroPhase && currentQuestion && spokenQuestionIndexRef.current !== currentIndex){  
            spokenQuestionIndexRef.current = currentIndex;
            await new Promise(r => setTimeout(r, 800)); 

            // If last question (hard level)
            if(currentIndex === questions.length - 1){
              await speakText(
                `This is the final question, and it's a bit more challenging. Take a moment to think before you answer.`
              );
            }

            await speakText(currentQuestion.question);

          }

    }

    runIntro();

    return () => {
      isCancelled = true;
    };

  },[selectedVoice, isIntroPhase, currentIndex, currentQuestion, questions.length, speakText, userName]) 


  useEffect(()=>{
    if(isIntroPhase) return;
    if(!currentQuestion) return;
    if(isSubmitting || isAIPlaying) return;
    const timer = setInterval(()=>{
      setTimeLeft((prev) => {
        if(prev <= 1){
          clearInterval(timer);
          return 0;
        }
        return prev - 1; 

      })
    }, 1000);

    return () => clearInterval(timer);

  },[isIntroPhase, currentIndex, currentQuestion, isSubmitting, isAIPlaying])

  useEffect(()=>{
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  },[currentIndex, currentQuestion, isIntroPhase])

  useEffect(()=>{
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition) {
      setIsMicOn(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onend = () => {
      isRecognitionRunningRef.current = false;
    };

    recognition.onerror = (event) => {
      isRecognitionRunningRef.current = false;
      console.log("Speech recognition error:", event.error);
    };

    recognitionRef.current = recognition;

  },[])

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };  


   const submitAnswer = async () => {
    if(isSubmitting) return;
    if(!currentQuestion) return;
    
    stopMic();
    setIsSubmitting(true);

     try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer",{
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: (currentQuestion.timeLimit || 60) - timeLeft,
      }, {withCredentials:true})

      setFeedback(result.data.feedback);

      await speakText(result.data.feedback);

      setIsSubmitting(false);

      if (isLastQuestion) {
        stopMic();
        setIsMicOn(false);
      } else {
        handleNext();
      }

     } catch (error) {
      console.log(error);
      setIsSubmitting(false);
     }
    }

    const handleNext = async () => {
      setAnswer("");
      setFeedback("");
      
      if(isLastQuestion) {
        stopMic();
        setIsMicOn(false);
        return;
      }

      await speakText("Alright, let's move on to the next question.");

       setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));

      // setCurrentIndex(currentIndex + 1);
      // setTimeLeft(questions[currentIndex + 1]?.timeLimit || 60);
      setTimeout(()=>{
        if (isMicOn)
          startMic();
      }, 500)

    }

    const finishInterview = async () => {
      if (isFinishing) return;
      console.log("Interview finished. Submitting results...");

      stopMic();
      setIsMicOn(false)
      setIsFinishing(true)
      try {
        const result = await axios.post(ServerUrl + "/api/interview/finish",{
          interviewId,
        }, {withCredentials:true})

        console.log(result.data);
        
        onFinish(result.data);
      } catch (error) {
        console.log(error);
        setIsFinishing(false)
      }
    }

    useEffect(()=>{
      if (isIntroPhase) return;
      if (!currentQuestion) return;

     if(timeLeft === 0 && !isSubmitting && !feedback){
      submitAnswerRef.current?.();
      } 
    },[timeLeft, isIntroPhase, currentQuestion, isSubmitting, feedback]);

    useEffect(() => {
      submitAnswerRef.current = submitAnswer;
    });

    useEffect(()=>{
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      }
    }, []);




  return (
    <div className='min-h-screen bg-[#f3f3f3] flex items-center justify-center p-3 sm:p-6'>
      <div className="w-full max-w-7xl min-h-[80vh] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden" >

        {/* video section */}

        <div className="w-full lg:w-[35%] bg-gray-50 flex flex-col items-center p-4 sm:p-6 space-y-5 sm:space-y-6 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className='w-full max-w-md rounded-2xl overflow-hidden shadow-xl'>
          <video 
          src={videoSource}
          key={videoSource}
            ref={videoRef}
           muted
           playsInline
           preload='auto' 
           className='w-full h-auto object-cover'
            />
          </div>

          {/* subtitle*/}

          {
            subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
            )
          }


          {/* timer area */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              <span className={`text-sm font-semibold ${isAIPlaying ? "text-emerald-600" : "text-gray-700"}`}>
                {isIntroPhase ? "Starting" : isAIPlaying ? "AI Speaking" : "Listening"}
              </span>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">

              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit}/>
            </div>

           <div className="h-px bg-gray-200"></div>

          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <span className='block text-2xl font-bold text-emerald-600'>{displayQuestionNumber}</span>
              <span className='block text-xs text-gray-400'>Current Question</span>
            </div>

            <div>
              <span className='block text-2xl font-bold text-emerald-600'>{questions.length}</span>
              <span className='block text-xs text-gray-400'>Total Questions</span>
            </div>
          </div>

          <div>
            <div className='mb-2 flex items-center justify-between text-xs font-semibold text-gray-500'>
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className='h-2 rounded-full bg-gray-100'>
              <div className='h-full rounded-full bg-emerald-500 transition-all' style={{width: `${progress}%`}}></div>
            </div>
          </div>

          </div>
        </div>

      {/* text sections */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative min-h-[560px]">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-2">
          AI Smart Interview
          </h2>
          <p className='mb-6 text-sm text-gray-500'>
            {isIntroPhase ? "Your interviewer is introducing the session." : "Answer naturally by speaking or typing below."}
          </p>


          {!isIntroPhase && !hasCompletedAllQuestions && (<div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>
              Question {displayQuestionNumber} of {questions.length}
            </p>

            <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">{currentQuestion?.question}</div>
          </div>)
          }

          {hasCompletedAllQuestions ? (
            <div className='flex-1 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-emerald-800'>Finish your interview</h3>
              <p className='mt-2 text-sm leading-relaxed text-emerald-700'>
                You have completed all 5 questions. Save the interview and open your report.
              </p>
            </div>
          ) : (
          <textarea
          placeholder='Type your answer here...'
          onChange={(e) =>setAnswer(e.target.value)}
          value={answer}
          className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800'/>
          )}

          {hasCompletedAllQuestions ? (
            <div className='mt-6'>
              <button
                onClick={finishInterview}
                disabled={isFinishing}
                className='w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:bg-gray-500 disabled:cursor-not-allowed'
              >
                {isFinishing ? "Preparing Report..." : "See your interview report"}
              </button>
            </div>
          ) : !feedback ? ( <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
            <Motion.button
            onClick={toggleMic}
            whileTap={{scale:0.9}}
             className='w-12 h-12 sm:w-14 sm:h-14 flex shrink-0 items-center justify-center rounded-full bg-black text-white shadow-lg self-center sm:self-auto'
             aria-label={isMicOn ? "Turn microphone off" : "Turn microphone on"}>
              {isMicOn ? <FaMicrophone size={20}/> : <FaMicrophoneSlash size={20}/>}
            </Motion.button>

            <Motion.button
            onClick={submitAnswer}
            disabled={isSubmitting}
            whileTap={{scale:0.95}}
             className='flex-1 bg-emerald-600 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:bg-emerald-700 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed'>
             {isSubmitting ? "Submitting..." : "Submit Answer"}

            </Motion.button>
          </div>):(
            <Motion.div
              initial={{opacity:0}}
              animate={{opacity:1}}
            className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'>
              {isLastQuestion && (
                <h3 className='mb-2 text-lg font-bold text-emerald-800'>
                  Finish your interview
                </h3>
              )}
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>

              <button
              onClick={isLastQuestion ? finishInterview : handleNext}
              disabled={isFinishing}

              className='w-full bg-emerald-600 text-white py-3 rounded-xl shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-1 disabled:bg-gray-500 disabled:cursor-not-allowed'>
                {isLastQuestion ? (isFinishing ? "Preparing Report..." : "See your interview report") : "Next Question"} <BsArrowRight size={18}/>
              </button>
            </Motion.div>
          )}
      </div>
      </div>
      
    </div>
  )
}


export default VoiceInterview
