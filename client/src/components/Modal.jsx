import React from 'react';

function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
  if (!isOpen) return null;

  //  Tamaños responsivos para el modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95%] md:max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size] || sizeClasses.lg} relative max-h-[90vh] overflow-y-auto`}>
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-gray-700 z-10 p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {title && <h2 className="text-lg md:text-xl font-bold mb-4 pr-6 pt-2 px-4 md:px-6">{title}</h2>}
        <div className="p-3 md:p-6 pt-0">{children}</div>
      </div>
    </div>
  );
}

export default Modal;