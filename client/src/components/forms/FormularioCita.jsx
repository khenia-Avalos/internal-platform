{/* Comenta esto temporalmente */}
{/*
<HorariosDisponibles
  doctorId={doctorId}
  fecha={fecha}
  onSelectHorario={handleSelectHorario}
/>
*/}

{/* Reemplaza con esto para probar */}
<div className="space-y-2">
  <p className="text-sm text-gray-600">Horarios de prueba (selecciona uno):</p>
  <div className="flex gap-2 flex-wrap">
    <button 
      type="button"
      onClick={() => handleSelectHorario({ inicio: "09:00", fin: "10:00" })}
      className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
    >
      09:00 - 10:00
    </button>
    <button 
      type="button"
      onClick={() => handleSelectHorario({ inicio: "10:00", fin: "11:00" })}
      className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
    >
      10:00 - 11:00
    </button>
    <button 
      type="button"
      onClick={() => handleSelectHorario({ inicio: "11:00", fin: "12:00" })}
      className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
    >
      11:00 - 12:00
    </button>
  </div>
</div>