import { useEffect, useMemo, useState } from "react";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import Header from "./components/Header";
import Alert from "./components/Alert";
import SalesTable from "./components/SalesTable";
import AdminPanel from "./components/admin/AdminPanel";
import PartTypesPanel from "./components/PartTypesPanel";
import ModelsPanel from "./components/ModelsPanel";
import CartPanel from "./components/CartPanel";
import BicycleBuilderPanel from "./components/BicycleBuilderPanel";
import SaleDetailModal from "./components/SaleDetailModal";
import * as authService from "./services/authService";
import * as salesService from "./services/salesService";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const loggedIn = user !== null;

  // "login" | "signup" — which auth screen to show when logged out.
  const [authView, setAuthView] = useState("login");
  const [authMessage, setAuthMessage] = useState("");

  const [partTypes, setPartTypes] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedPartType, setSelectedPartType] = useState(null);
  const [cart, setCart] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [showSales, setShowSales] = useState(false);
  const [salesMode, setSalesMode] = useState("my");
  const [showAdmin, setShowAdmin] = useState(false);

  // "parts" | "bicycle" — which sale flow is currently active.
  const [saleMode, setSaleMode] = useState("parts");
  const [bicycleExtras, setBicycleExtras] = useState([]);
  const [bicycleSalePrice, setBicycleSalePrice] = useState("");
  const [saleDetail, setSaleDetail] = useState(null);

  const cartItems = useMemo(() => {
    const grouped = new Map();

    for (const model of cart) {
      const existing = grouped.get(model._id);

      if (existing) {
        existing.quantity += 1;
      } else {
        grouped.set(model._id, { model, quantity: 1 });
      }
    }

    return [...grouped.values()];
  }, [cart]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.model.currentPrice * item.quantity,
        0
      ),
    [cartItems]
  );

  const handleLogin = async (email, password) => {
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await authService.login(email, password);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async ({ name, email, password }) => {
    setError("");
    setAuthMessage("");
    setLoading(true);

    try {
      await authService.signup({ name, email, password });
      setAuthMessage("Account created. You can log in now.");
      setAuthView("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedIn) return;

    const loadPartTypes = async () => {
      try {
        setPartTypes(await salesService.fetchPartTypes());
      } catch (err) {
        setError(err.message);
      }
    };

    loadPartTypes();
  }, [loggedIn]);

  const loadModels = async (partType) => {
    setSelectedPartType(partType);
    setModels([]);
    setError("");

    try {
      setModels(await salesService.fetchModels(partType));
    } catch (err) {
      setError(err.message);
    }
  };

  const addToCart = (model) => {
    if (saleMode === "bicycle") {
      setBicycleExtras((extras) => [...extras, model]);
      return;
    }

    setCart((items) => [...items, model]);
    setMessage("");
  };

  const removeBicycleExtra = (index) => {
    setBicycleExtras((extras) => [
      ...extras.slice(0, index),
      ...extras.slice(index + 1),
    ]);
  };

  const removeFromCart = (modelId) => {
    setCart((items) => {
      const index = items.findIndex((item) => item._id === modelId);
      if (index === -1) return items;

      return [...items.slice(0, index), ...items.slice(index + 1)];
    });
  };

  const loadSales = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    const canViewAllSales = user.role === "admin" || user.role === "manager";
    const nextMode = canViewAllSales && salesMode === "my" ? "all" : "my";

    try {
      const nextSales =
        nextMode === "all"
          ? await salesService.fetchAllSales()
          : await salesService.fetchSales();

      setSales(nextSales);
      setSalesMode(nextMode);
      setShowSales(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerified = async (saleId) => {
    setError("");

    try {
      const updatedSale = await salesService.verifySale(saleId);
      setSales((currentSales) =>
        currentSales.map((sale) =>
          sale._id === updatedSale._id ? updatedSale : sale
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    setError("");

    try {
      await authService.logout();
    } catch (err) {
      setError(err.message);
      return;
    }

    localStorage.removeItem("user");
    setUser(null);
    setPartTypes([]);
    setModels([]);
    setSelectedPartType(null);
    setCart([]);
    setSales([]);
    setShowSales(false);
    setSalesMode("my");
    setShowAdmin(false);
    setSaleMode("parts");
    setBicycleExtras([]);
    setBicycleSalePrice("");
    setSaleDetail(null);
  };

  const submitSale = async () => {
    if (cartItems.length === 0) return;

    if (paymentMethod === "online" && !transactionId.trim()) {
      setError("Enter the transaction ID for an online payment.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await salesService.createSale({
        items: cartItems.map(({ model, quantity }) => ({
          modelId: model._id,
          quantity,
        })),
        paymentMethod,
        transactionId: paymentMethod === "online" ? transactionId.trim() : null,
      });

      setCart([]);
      setTransactionId("");
      setMessage("Sale created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitBicycleSale = async (selection) => {
    if (paymentMethod === "online" && !transactionId.trim()) {
      setError("Enter the transaction ID for an online payment.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await salesService.createBicycleSale({
        components: {
          frame: selection.frame,
          gear: selection.gear,
          brake: selection.brake,
          tyre1: selection.tyre1,
          tyre2: selection.tyre2,
          extras: bicycleExtras.map((model) => model._id),
        },
        salePrice: Number(bicycleSalePrice),
        paymentMethod,
        transactionId: paymentMethod === "online" ? transactionId.trim() : null,
      });

      setBicycleExtras([]);
      setBicycleSalePrice("");
      setTransactionId("");
      setMessage("Bicycle sale created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewSale = async (saleId) => {
    setError("");

    try {
      setSaleDetail(await salesService.fetchSaleDetail(saleId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!loggedIn) {
    if (authView === "signup") {
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onSwitchToLogin={() => {
            setAuthView("login");
            setError("");
          }}
          loading={loading}
          error={error}
          message={authMessage}
        />
      );
    }

    return (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToSignUp={() => {
          setAuthView("signup");
          setError("");
          setAuthMessage("");
        }}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-7">
      <Header
        user={user}
        onShowSales={() => {
          setShowAdmin(false);
          loadSales();
        }}
        salesMode={salesMode}
        onOpenAdmin={() => {
          setShowSales(false);
          setShowAdmin(true);
        }}
        onLogout={logout}
        loading={loading}
      />

      <Alert variant="error">{error}</Alert>
      <Alert variant="success">{message}</Alert>

      {showSales && (
        <SalesTable
          sales={sales}
          mode={salesMode}
          showVerification={salesMode === "all" && (user.role === "admin" || user.role === "manager")}
          onToggleVerified={toggleVerified}
          onViewSale={viewSale}
          onClose={() => setShowSales(false)}
        />
      )}

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      <SaleDetailModal detail={saleDetail} onClose={() => setSaleDetail(null)} />

      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
          <button
            onClick={() => setSaleMode("bicycle")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              saleMode === "bicycle" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            Sell Bicycle
          </button>
          <button
            onClick={() => setSaleMode("parts")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              saleMode === "parts" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            Sell Parts Only
          </button>
        </div>
      </div>

      {saleMode === "bicycle" ? (
        <section className="grid gap-4 lg:grid-cols-[180px_1fr_1fr]">
          <PartTypesPanel
            partTypes={partTypes}
            selectedPartType={selectedPartType}
            onSelect={loadModels}
          />

          <ModelsPanel
            models={models}
            selectedPartType={selectedPartType}
            onSelectModel={addToCart}
          />

          <BicycleBuilderPanel
            extras={bicycleExtras}
            onRemoveExtra={removeBicycleExtra}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            transactionId={transactionId}
            onTransactionIdChange={setTransactionId}
            salePrice={bicycleSalePrice}
            onSalePriceChange={setBicycleSalePrice}
            onSubmitSale={submitBicycleSale}
            loading={loading}
          />
        </section>
      ) : (
        <section className="grid gap-4 lg:grid-cols-[180px_1fr_320px]">
          <PartTypesPanel
            partTypes={partTypes}
            selectedPartType={selectedPartType}
            onSelect={loadModels}
          />

          <ModelsPanel
            models={models}
            selectedPartType={selectedPartType}
            onSelectModel={addToCart}
          />

          <CartPanel
            cartItems={cartItems}
            cartTotal={cartTotal}
            cartCount={cart.length}
            onAdd={addToCart}
            onRemove={removeFromCart}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            transactionId={transactionId}
            onTransactionIdChange={setTransactionId}
            onSubmitSale={submitSale}
            loading={loading}
          />
        </section>
      )}
    </main>
  );
}

export default App;
