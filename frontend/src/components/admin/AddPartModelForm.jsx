import { useState } from "react";

function AddPartModelForm({ onSubmit, loading }) {
  const [modelName, setModelName] = useState("");
  const [partType, setPartType] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      modelName,
      partType,
      currentPrice: Number(currentPrice),
    });
    setModelName("");
    setPartType("");
    setCurrentPrice("");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
      <label className="text-sm font-medium">
        Model name
        <input
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          required
        />
      </label>

      <label className="text-sm font-medium">
        Part type
        <input
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={partType}
          onChange={(e) => setPartType(e.target.value)}
          required
        />
      </label>

      <label className="text-sm font-medium">
        Current price (₹)
        <input
          type="number"
          min="0"
          step="0.01"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={currentPrice}
          onChange={(e) => setCurrentPrice(e.target.value)}
          required
        />
      </label>

      <button
        className="self-end rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 sm:col-span-3"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add part model"}
      </button>
    </form>
  );
}

export default AddPartModelForm;
