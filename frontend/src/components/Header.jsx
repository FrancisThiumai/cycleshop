function Header({ user, onShowSales, onOpenAdmin, onLogout, loading, salesMode }) {
  const isAdmin = user.role === "admin";
  const canViewAllSales = user.role === "admin" || user.role === "manager";

  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">New Sale</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {user.name} · {user.role}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Admin
          </button>
        )}
        <button
          onClick={onShowSales}
          disabled={loading}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
        >
          {canViewAllSales && salesMode === "all" ? "All Sales" : "My Sales"}
        </button>
        <button
          onClick={onLogout}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export default Header;
