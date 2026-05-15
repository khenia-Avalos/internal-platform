export const DataTable = ({ columns, data, onEdit, onDelete, onRowClick }) => {
  // Verificar si hay acciones disponibles
  const hasActions = onEdit || onDelete;

  return (
    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col) => (
            <th key={col.accessor} className="px-4 py-2 text-left">
              {col.header}
            </th>
          ))}
          {hasActions && (
            <th className="px-4 py-2 text-left">Acciones</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr 
            key={item._id}
            className="border-t hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowClick?.(item)}
          >
            {columns.map((col) => (
              <td key={col.accessor} className="px-4 py-2">
                {col.render ? col.render(item) : item[col.accessor]}
              </td>
            ))}
            {hasActions && (
              <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <button 
                    onClick={() => onEdit(item)} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 mr-2 shadow-sm hover:shadow"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(item)} 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow"
                  >
                    Eliminar
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};