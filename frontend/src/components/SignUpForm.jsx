import { useState } from "react";
import Alert from "./Alert";

function SignUpForm({ onSignUp, onSwitchToLogin, loading, error, message }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSignUp({ name, email, password });
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-7 shadow-sm"
      >
        <h1 className="text-2xl font-semibold">Cycle Shop</h1>
        <p className="mt-1 text-sm text-zinc-500">Create a seller account</p>

        <label className="mt-6 block text-sm font-medium">
          Name
          <input
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-600"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Email
          <input
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-600"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Password
          <input
            className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-600"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        <Alert variant="error">{error}</Alert>
        <Alert variant="success">{message}</Alert>

        <button
          className="mt-5 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Back to login
        </button>
      </form>
    </main>
  );
}

export default SignUpForm;