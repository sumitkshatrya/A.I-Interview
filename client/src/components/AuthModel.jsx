import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Auth from '../pages/Auth';

const AuthModel = ({ onClose }) => {
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData && onClose) {
      onClose();
    }
  }, [userData, onClose]);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0B0F17]/98 backdrop-blur-2xl overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700 transition shadow-md cursor-pointer"
          aria-label="Close login dialog"
        >
          <FaTimes size={14} />
        </button>
        <Auth isModel={true} onClose={onClose} />
      </div>
    </div>,
    document.body
  );
};

export default AuthModel;
