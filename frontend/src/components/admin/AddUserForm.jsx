import { useState } from "react";

function AddUserForm({ onSubmit, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seller");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, email, password, role });
    setName("");
    setEmail("");
    setPassword("");
    setRole("seller");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">
        Name
        <input
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="text-sm font-medium">
        Email
        <input
          type="email"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="text-sm font-medium">
        Password
        <input
          type="password"
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>

      <label className="text-sm font-medium">
        Role
        <select
          className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="seller">Seller</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <button
        className="self-end rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 sm:col-span-2"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add user"}
      </button>
    </form>
  );
}

export default AddUserForm;
