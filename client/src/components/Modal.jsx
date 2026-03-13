import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          ✕
        </button>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;