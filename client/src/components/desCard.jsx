// src/components/desCard.jsx
import React from "react";

export const InfoCard = ({ 
  title, 
  data, 
  status, 
  statusColor = 'text-green-600',
  actions,
  children,
  layout = 'grid',
  className = '',
  titleClassName = ''
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header con título y estado */}
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className={`text-xl font-semibold text-gray-800 ${titleClassName}`}>
          {title || "Información"}
        </h2>
        {status && (
          <span className={`text-sm font-medium ${statusColor}`}>
            {status}
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Datos en grid o lista */}
        {data && data.length > 0 && (
          <div className={
            layout === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
              : 'space-y-3'
          }>
            {data.map((item, index) => {
              // Si es un título (isTitle: true), mostrarlo centrado y ocupando todo el ancho
              if (item.isTitle) {
                return (
                  <div key={index} className="col-span-full text-left">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {item.label}
                    </h3>
                  </div>
                );
              }
              
              // Si es un separador
              if (item.isSeparator) {
                return (
                  <div key={index} className="col-span-full">
                    <hr className="border-gray-200 my-2" />
                  </div>
                );
              }
              
              // Item normal con texto alineado a la izquierda
              return (
                <div key={index} className="text-left">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className={`text-base font-medium ${item.valueColor || 'text-gray-800'}`}>
                    {item.value || 'No especificado'}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Contenido personalizado */}
        {children}

        {/* Acciones/botones */}
        {actions && actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`px-4 py-2 rounded-lg transition font-medium text-sm ${
                  action.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                  action.variant === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                  action.variant === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                  action.variant === 'cyan' ? 'bg-cyan-600 text-white hover:bg-cyan-700' :
                  'bg-gray-600 text-white hover:bg-gray-700'
                } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};