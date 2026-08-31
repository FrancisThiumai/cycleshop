import { useEffect, useState } from "react";
import PartTypesPanel from "../PartTypesPanel";
import ModelsPanel from "../ModelsPanel";
import * as salesService from "../../services/salesService";

function ModelPicker({ selectedModel, onSelectModel }) {
  const [partTypes, setPartTypes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedPartType, setSelectedPartType] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    salesService
      .fetchPartTypes()
      .then(setPartTypes)
      .catch((err) => setError(err.message));
  }, []);

  const loadModels = async (partType) => {
    setSelectedPartType(partType);
    setModels([]);
    setError("");

    try {
      setModels(await salesService.fetchModels(partType, true));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <PartTypesPanel
          partTypes={partTypes}
          selectedPartType={selectedPartType}
          onSelect={loadModels}
        />
        <ModelsPanel
          models={models}
          selectedPartType={selectedPartType}
          onSelectModel={onSelectModel}
        />
      </div>

      {selectedModel && (
        <p className="mt-2 text-sm text-zinc-600">
          Selected: <span className="font-medium">{selectedModel.modelName}</span>{" "}
          (₹{selectedModel.currentPrice})
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default ModelPicker;
