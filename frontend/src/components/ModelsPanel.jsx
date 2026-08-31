function ModelsPanel({ models, selectedPartType, onSelectModel }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-3 font-medium">
        Models
        {selectedPartType && (
          <span className="font-normal text-zinc-500"> / {selectedPartType}</span>
        )}
      </h2>

      {models.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Select a part type to see available models.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <button
              key={model._id}
              onClick={() => onSelectModel(model)}
              className="rounded-lg border border-zinc-200 p-3 text-left hover:border-zinc-400 hover:bg-zinc-50"
            >
              <div className="font-medium">{model.modelName}</div>
              <div className="mt-1 text-sm text-zinc-500">₹{model.currentPrice}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModelsPanel;
