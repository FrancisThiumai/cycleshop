function PartRow({ part }) {
  return (
    <li className="flex items-center justify-between border-b border-zinc-100 py-2 text-sm">
      <span>{part.modelId?.modelName || "Unknown part"}</span>
      <span className="text-zinc-500">₹{part.soldPrice}</span>
    </li>
  );
}

function SaleDetailModal({ detail, onClose }) {
  if (!detail) return null;

  const { sale, parts, bicycle } = detail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">
            Sale — {sale.saleType === "bicycle" ? "Bicycle" : "Parts"}
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Close
          </button>
        </div>

        <div className="mb-4 text-sm text-zinc-500">
          <div>{new Date(sale.saleDate).toLocaleString()}</div>
          <div>
            {sale.paymentMethod} · ₹{sale.salePrice} ·{" "}
            {sale.verified ? "Verified" : "Not verified"}
          </div>
        </div>

        {bicycle && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium">Bicycle configuration</h3>
            <ul>
              <PartRow part={bicycle.frame} />
              <PartRow part={bicycle.gear} />
              <PartRow part={bicycle.brake} />
              <PartRow part={bicycle.tyre1} />
              <PartRow part={bicycle.tyre2} />
              {bicycle.extras.map((part) => (
                <PartRow key={part._id} part={part} />
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium">
            {bicycle ? "All parts in this sale" : "Parts"}
          </h3>
          {parts.length === 0 ? (
            <p className="text-sm text-zinc-500">No parts found for this sale.</p>
          ) : (
            <ul>
              {parts.map((part) => (
                <PartRow key={part._id} part={part} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default SaleDetailModal;
