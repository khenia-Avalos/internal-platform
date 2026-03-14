import React from "react";

export const InfoCard = ({ title, data }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          {title || "Información"}
        </h2>
      </div>
      
     <div className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {data.map((item, index) => (
      <div key={index}>
        <p className="text-sm text-gray-500">{item.label}</p>
        <p className="text-lg font-semibold text-gray-800">
          {item.value || 'No especificado'}
        </p>
      </div>
    ))}
  </div>
</div>
    </div>
  );
};