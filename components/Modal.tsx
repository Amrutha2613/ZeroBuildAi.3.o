
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] p-10 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
        <h3 className={`text-2xl font-black mb-4 tracking-tighter ${type === 'danger' ? 'text-red-600' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className="text-gray-500 font-medium leading-relaxed mb-8">
          {message}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 font-black py-4 px-8 rounded-2xl shadow-lg transition-all ${type === 'danger' ? 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700' : 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-700'}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
