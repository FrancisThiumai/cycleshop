import { useEffect, useState } from "react";
import * as adminService from "../../services/adminService";
import Alert from "../Alert";
import DataTable from "./DataTable";
import AddUserForm from "./AddUserForm";
import AddPartModelForm from "./AddPartModelForm";
import AddPartInfoForm from "./AddPartInfoForm";
import AddPriceHistoryForm from "./AddPriceHistoryForm";

const COLUMNS = {
  users: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ],
  partModels: [
    { key: "modelName", label: "Model" },
    { key: "partType", label: "Type" },
    { key: "currentPrice", label: "Price", render: (row) => `₹${row.currentPrice}` },
  ],
  partInfo: [
    { key: "modelId", label: "Model", render: (row) => row.modelId?.modelName || "—" },
    { key: "cost", label: "Cost", render: (row) => `₹${row.cost}` },
    {
      key: "purchaseDate",
      label: "Purchased",
      render: (row) => new Date(row.purchaseDate).toLocaleDateString(),
    },
    {
      key: "soldPrice",
      label: "Status",
      render: (row) => (row.soldPrice != null ? `Sold · ₹${row.soldPrice}` : "In stock"),
    },
  ],
  priceHistory: [
    { key: "modelId", label: "Model", render: (row) => row.modelId?.modelName || "—" },
    { key: "price", label: "Price", render: (row) => `₹${row.price}` },
    { key: "date", label: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
  ],
};

function AdminPanel({ onClose }) {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState("");
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminService
      .fetchResources()
      .then((list) => {
        setResources(list);
        if (list.length > 0) setSelectedResource(list[0].key);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedResource) return;
    loadRows(selectedResource);
  }, [selectedResource]);

  const loadRows = async (resource) => {
    setError("");
    setRowsLoading(true);

    try {
      setRows(await adminService.fetchRows(resource));
    } catch (err) {
      setError(err.message);
    } finally {
      setRowsLoading(false);
    }
  };

  const handleAdd = async (payload) => {
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      await adminService.createRow(selectedResource, payload);
      setMessage("Added successfully.");
      await loadRows(selectedResource);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");
    setDeletingId(id);

    try {
      await adminService.deleteRow(selectedResource, id);
      setRows((current) => current.filter((row) => row._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResourceChange = (resource) => {
    setSelectedResource(resource);
    setError("");
    setMessage("");
  };

  const renderAddForm = () => {
    switch (selectedResource) {
      case "users":
        return <AddUserForm onSubmit={handleAdd} loading={submitting} />;
      case "partModels":
        return <AddPartModelForm onSubmit={handleAdd} loading={submitting} />;
      case "partInfo":
        return <AddPartInfoForm onSubmit={handleAdd} loading={submitting} />;
      case "priceHistory":
        return <AddPriceHistoryForm onSubmit={handleAdd} loading={submitting} />;
      default:
        return null;
    }
  };

  return (
    <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">Manage data</h2>
          <select
            value={selectedResource}
            onChange={(e) => handleResourceChange(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm"
          >
            {resources.map((resource) => (
              <option key={resource.key} value={resource.key}>
                {resource.label}
              </option>
            ))}
          </select>
        </div>

        <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-900">
          Close
        </button>
      </div>

      <Alert variant="error">{error}</Alert>
      <Alert variant="success">{message}</Alert>

      <div className="mb-4 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
        {renderAddForm()}
      </div>

      {rowsLoading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS[selectedResource] || []}
          rows={rows}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </section>
  );
}

export default AdminPanel;
