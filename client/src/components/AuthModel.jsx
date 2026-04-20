import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Auth from '../pages/Auth';

const AuthModel = ({onClose}) => {
const { userData } = useSelector((state) => state.user);

useEffect(() => {
 if (userData) {
  onClose();
 }

},[userData, onClose])

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-black/10 backdrop-blur-sm px-4'>
      <div className='relative w-full max-w-md'>
        <button onClick={onClose} className='absolute top-8 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200'>
            <FaTimes size={16}/>   
        </button>
            <Auth isModel ={true}/>
      </div>
    </div>
  )
}

export default AuthModel
