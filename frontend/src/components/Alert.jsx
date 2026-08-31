const VARIANT_CLASSES = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
};

function Alert({ variant = "error", children }) {
  if (!children) return null;

  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]}`}
    >
      {children}
    </div>
  );
}

export default Alert;
