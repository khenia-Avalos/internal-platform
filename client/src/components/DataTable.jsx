// components/common/DataTable.jsx
export const DataTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
      <thead className="bg-gray-100">
        <tr>
          {columns.map((col) => (
            <th key={col.accessor} className="px-4 py-2 text-left">
              {col.header}
            </th>
          ))}
          <th className="px-4 py-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item._id} className="border-t hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.accessor} className="px-4 py-2">
                {item[col.accessor]}
              </td>
            ))}
            <td className="px-4 py-2">
              <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2">
                Editar
              </button>
              <button onClick={() => onDelete(item._id)} className="text-red-600 hover:text-red-800">
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};