import toast, { Toaster } from "react-hot-toast";

// Shared dashboard toast helpers — single source of truth for success/error/info
// feedback across the dashboard so every page reports the same way.
export const notify = {
  success: (message) =>
    toast.success(message, {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#0f172a",
        border: "1px solid #d1fae5",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)",
        padding: "12px 14px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#059669", secondary: "#fff" },
    }),
  error: (message) =>
    toast.error(message, {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#0f172a",
        border: "1px solid #fecaca",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)",
        padding: "12px 14px",
        fontSize: "14px",
      },
      iconTheme: { primary: "#dc2626", secondary: "#fff" },
    }),
  info: (message) =>
    toast(message, {
      icon: "ℹ️",
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#0f172a",
        border: "1px solid #dbeafe",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05)",
        padding: "12px 14px",
        fontSize: "14px",
      },
    }),
};

export function DashboardToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{ duration: 4000 }}
      containerStyle={{ top: 88 }}
    />
  );
}
