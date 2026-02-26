import React from "react";

export const SearchBar = ({ value, onChange }) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
    </div>
  );
};