function DataTable({ columns, rows, onDelete, deletingId }) {
  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">No records yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-zinc-500">
            {columns.map((col) => (
              <th key={col.key} className="px-2 py-2">
                {col.label}
              </th>
            ))}
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-b border-zinc-100 last:border-0">
              {columns.map((col) => (
                <td key={col.key} className="px-2 py-2">
                  {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                </td>
              ))}
              <td className="px-2 py-2 text-right">
                <button
                  onClick={() => onDelete(row._id)}
                  disabled={deletingId === row._id}
                  className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === row._id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
