import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RoleAndExperience from "../components/Role&Experience"
import Report from "../components/Report"
import VoiceInterview from "../components/VoiceInterview"


const Interview = () => {
  const [step,setStep] = useState(1)
  const [interviewData, setInterviewData] = useState(null)
  const navigate = useNavigate()


  return (
    <div className="min-h-screen bg-gray-50">
      {
        step===1 && (
          <RoleAndExperience onStart={(data)=>{setInterviewData(data);
              setStep(2)
          }}/>
        )
      }

      {
        step===2 && (
          <VoiceInterview interviewData={interviewData}
          onFinish={(report)=>{
            const reportId = report?.interviewId || interviewData?.interviewId

            if (reportId) {
              navigate(`/report/${reportId}`, { replace: true })
              return
            }

            setInterviewData(report);
            setStep(3)
          }}
          />
        )
      }

      {
        step===3 && (
          <Report report={interviewData} />
        )
      }

    </div>
  )
}

export default Interview
