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
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'
              : 'space-y-3'
          }>
            {data.map((item, index) => {
              // Si es un título (isTitle: true), mostrarlo centrado y ocupando todo el ancho
              if (item.isTitle) {
                return (
                  <div key={index} className="col-span-full">
                    <h3 className="text-xl font-semibold text-gray-800 text-center">
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
              
              // ========== Item normal con soporte para saltos de línea ==========
              const isLongText = item.preserveLines || 
                (typeof item.value === 'string' && item.value.includes('\n'));
              
              // Si el texto tiene saltos de línea o es muy largo, usar col-span completo
              const colSpanClass = isLongText || item.fullWidth ? 'col-span-full' : '';
              
              return (
                <div key={index} className={`bg-gray-50 p-4 rounded-lg border border-gray-200 ${colSpanClass}`}>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <div 
                    className={`text-base font-medium ${item.valueColor || 'text-gray-800'} ${isLongText ? 'whitespace-pre-wrap break-words' : ''}`}
                    style={isLongText ? { 
                      whiteSpace: 'pre-wrap', 
                      wordBreak: 'break-word',
                      lineHeight: '1.5'
                    } : {}}
                  >
                    {item.value || 'No especificado'}
                  </div>
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