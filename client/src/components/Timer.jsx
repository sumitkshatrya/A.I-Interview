import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const Timer = ({timeLeft, totalTime}) => {

  const safeTotal = totalTime || 60;
  const safeTime = Math.max(0, timeLeft || 0);
  const percentage = (safeTime / safeTotal) * 100;


  return (
    <div className='w-20 h-20'>
      <CircularProgressbar 
      value={percentage} 
      text= {`${safeTime}s`}
       styles={buildStyles({
        textSize: '28px',
        pathColor: "#10b981",
        textColor: '#ef4444',
        trailColor: '#e5e7eb',
       })}
      />
    </div>
  )
}

export default Timer
