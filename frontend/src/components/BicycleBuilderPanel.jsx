import { useCallback, useEffect, useState } from "react";
import * as salesService from "../services/salesService";

// NOTE: this assumes the admin-defined partType strings are exactly
// "frame", "gear", "brake" and "tyre" (matching the field names already
// used in the BicycleInfo model). If your actual partType values differ
// (e.g. "Gear Set"), update REQUIRED_SLOTS below to match.
const REQUIRED_SLOTS = [
  { key: "frame", label: "Frame", partType: "frame" },
  { key: "gear", label: "Gear", partType: "gear" },
  { key: "brake", label: "Brake", partType: "brake" },
  { key: "tyre1", label: "Tyre 1", partType: "tyre" },
  { key: "tyre2", label: "Tyre 2", partType: "tyre" },
];

function BicycleBuilderPanel({
  extras,
  onRemoveExtra,
  paymentMethod,
  onPaymentMethodChange,
  transactionId,
  onTransactionIdChange,
  salePrice,
  onSalePriceChange,
  onSubmitSale,
  loading,
}) {
  const [modelsBySlot, setModelsBySlot] = useState({});
  const [selection, setSelection] = useState({});
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [recommendedPrice, setRecommendedPrice] = useState(null);
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  // Re-fetches the dropdown options for each required slot. Called on mount
  // and from the "Refresh" button, since newly added PartModels (added via
  // the admin panel in another tab) otherwise only show up after a full
  // page reload.
  const loadModels = useCallback(async () => {
    const uniquePartTypes = [...new Set(REQUIRED_SLOTS.map((s) => s.partType))];

    try {
      const results = await Promise.all(
        uniquePartTypes.map((partType) => salesService.fetchModels(partType))
      );

      const byPartType = Object.fromEntries(
        uniquePartTypes.map((partType, i) => [partType, results[i]])
      );

      setModelsBySlot(
        Object.fromEntries(
          REQUIRED_SLOTS.map((slot) => [slot.key, byPartType[slot.partType] || []])
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Live recommended price: hits the backend so it reflects the current
  // PartModel.currentPrice, not just whatever was in the dropdown when it
  // was loaded. Recomputes whenever the selection or extras change.
  const loadRecommendedPrice = useCallback(async () => {
    const modelIds = [
      selection.frame,
      selection.gear,
      selection.brake,
      selection.tyre1,
      selection.tyre2,
      ...extras.map((model) => model._id),
    ].filter(Boolean);

    if (modelIds.length === 0) {
      setRecommendedPrice(null);
      return;
    }

    setRecommendedLoading(true);

    try {
      const result = await salesService.estimateBicyclePrice({
        frame: selection.frame,
        gear: selection.gear,
        brake: selection.brake,
        tyre1: selection.tyre1,
        tyre2: selection.tyre2,
        extras: extras.map((model) => model._id),
      });

      setRecommendedPrice(result.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setRecommendedLoading(false);
    }
  }, [selection, extras]);

  useEffect(() => {
    loadRecommendedPrice();
  }, [loadRecommendedPrice]);

  const handleRefresh = async () => {
    setError("");
    setRefreshing(true);

    try {
      await Promise.all([loadModels(), loadRecommendedPrice()]);
    } finally {
      setRefreshing(false);
    }
  };

  const canSubmit =
    REQUIRED_SLOTS.every((slot) => selection[slot.key]) &&
    salePrice !== "" &&
    Number(salePrice) >= 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-3 font-medium">Build Bicycle</h2>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {REQUIRED_SLOTS.map((slot) => (
          <label key={slot.key} className="block text-sm font-medium">
            {slot.label}
            <select
              value={selection[slot.key] || ""}
              onChange={(e) =>
                setSelection((s) => ({ ...s, [slot.key]: e.target.value }))
              }
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
            >
              <option value="" disabled>
                Select {slot.label.toLowerCase()}
              </option>
              {(modelsBySlot[slot.key] || []).map((model) => (
                <option key={model._id} value={model._id}>
                  {model.modelName} (₹{model.currentPrice})
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <h3 className="text-sm font-medium">Miscellaneous parts</h3>
        <p className="text-xs text-zinc-500">
          Use the part types panel to add optional extras to this bicycle.
        </p>

        {extras.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No extras added.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {extras.map((model, index) => (
              <li
                key={`${model._id}-${index}`}
                className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2 text-sm"
              >
                <span>
                  {model.modelName} (₹{model.currentPrice})
                </span>
                <button
                  onClick={() => onRemoveExtra(index)}
                  className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Recommended price</span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-40"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
          <span>
            {recommendedLoading
              ? "Calculating..."
              : recommendedPrice === null
              ? "Pick components to see a recommendation"
              : `₹${recommendedPrice}`}
          </span>

          {recommendedPrice !== null && !recommendedLoading && (
            <button
              type="button"
              onClick={() => onSalePriceChange(String(recommendedPrice))}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Use this
            </button>
          )}
        </div>

        <label className="mt-4 block text-sm font-medium">
          Combined bicycle price
          <input
            type="number"
            min="0"
            value={salePrice}
            onChange={(e) => onSalePriceChange(e.target.value)}
            placeholder="Enter the agreed price"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Payment method
          <select
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        </label>

        {paymentMethod === "online" && (
          <label className="mt-3 block text-sm font-medium">
            Transaction ID
            <input
              className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value)}
              placeholder="Transaction ID"
            />
          </label>
        )}

        <button
          onClick={() => onSubmitSale(selection)}
          disabled={!canSubmit || loading}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Submitting..." : "Sell Bicycle"}
        </button>
      </div>
    </div>
  );
}

export default BicycleBuilderPanel;
