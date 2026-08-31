import { useState } from "react";
import ModelPicker from "./ModelPicker";

function AddPartInfoForm({ onSubmit, loading }) {
  const [selectedModel, setSelectedModel] = useState(null);
  const [cost, setCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedModel) return;

    onSubmit({
      modelId: selectedModel._id,
      cost: Number(cost),
      purchaseDate,
    });

    setSelectedModel(null);
    setCost("");
    setPurchaseDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ModelPicker selectedModel={selectedModel} onSelectModel={setSelectedModel} />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Cost (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </label>

        <label className="text-sm font-medium">
          Purchase date
          <input
            type="date"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </label>
      </div>

      <button
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        disabled={loading || !selectedModel}
      >
        {loading ? "Adding..." : "Add stock item"}
      </button>
    </form>
  );
}

export default AddPartInfoForm;
