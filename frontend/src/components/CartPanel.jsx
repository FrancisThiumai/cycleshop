function CartPanel({
  cartItems,
  cartTotal,
  cartCount,
  onAdd,
  onRemove,
  paymentMethod,
  onPaymentMethodChange,
  transactionId,
  onTransactionIdChange,
  onSubmitSale,
  loading,
}) {
  return (
    <aside className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Cart</h2>
        <span className="text-sm text-zinc-500">{cartCount} items</span>
      </div>

      <div className="mt-4 space-y-3">
        {cartItems.length === 0 ? (
          <p className="text-sm text-zinc-500">Cart is empty.</p>
        ) : (
          cartItems.map(({ model, quantity }) => (
            <div
              key={model._id}
              className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3"
            >
              <div>
                <div className="text-sm font-medium">{model.modelName}</div>
                <div className="text-xs text-zinc-500">
                  ₹{model.currentPrice} × {quantity}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRemove(model._id)}
                  className="rounded border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => onAdd(model)}
                  className="rounded border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>₹{cartTotal}</span>
        </div>

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
          onClick={onSubmitSale}
          disabled={cartItems.length === 0 || loading}
          className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Submitting..." : "Submit Sale"}
        </button>
      </div>
    </aside>
  );
}

export default CartPanel;
