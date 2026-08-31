function PartTypesPanel({ partTypes, selectedPartType, onSelect }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h2 className="mb-3 font-medium">Part Types</h2>

      <div className="space-y-2">
        {partTypes.map((partType) => (
          <button
            key={partType}
            onClick={() => onSelect(partType)}
            className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
              selectedPartType === partType
                ? "border-zinc-500 bg-zinc-100"
                : "border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {partType}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PartTypesPanel;
