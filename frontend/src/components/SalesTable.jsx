function SalesTable({ sales, onClose, showVerification, onToggleVerified, onViewSale, mode }) {
  return (
    <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">{mode === "all" ? "All Sales" : "My Sales"}</h2>
        <button
          onClick={onClose}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Close
        </button>
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-zinc-500">No sales found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                {mode === "all" && <th className="px-2 py-2">Seller</th>}
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Payment</th>
                <th className="px-2 py-2">Verified</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b border-zinc-100 last:border-0">
                  {mode === "all" && (
                    <td className="px-2 py-2">
                      {sale.seller?.name || sale.seller || "—"}
                    </td>
                  )}
                  <td className="px-2 py-2">
                    {sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-2 py-2">{sale.paymentMethod || "—"}</td>
                  <td className="px-2 py-2">
                    {showVerification ? (
                      <button
                        type="button"
                        onClick={() => onToggleVerified(sale._id)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-zinc-300 hover:bg-zinc-100"
                        title={sale.verified ? "Unverify sale" : "Verify sale"}
                        aria-label={sale.verified ? "Unverify sale" : "Verify sale"}
                      >
                        {sale.verified ? "✓" : ""}
                      </button>
                    ) : (
                      sale.verified ? "Yes" : "No"
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => onViewSale(sale._id)}
                      className="text-sm text-zinc-500 hover:text-zinc-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default SalesTable;
