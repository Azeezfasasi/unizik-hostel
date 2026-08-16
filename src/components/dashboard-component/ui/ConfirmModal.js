"use client";
import { AlertTriangle, X, Loader2 } from "lucide-react";

/**
 * Shared confirmation dialog for destructive/high-consequence actions
 * (delete, approve, decline, send, etc.) — replaces window.confirm()/alert()
 * usage across the dashboard with one consistent, accessible pattern.
 *
 * tone: "danger" (delete/decline — red) | "primary" (approve/send — blue)
 */
export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const toneStyles = {
    danger: {
      icon: "text-red-600 bg-red-50",
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    },
    primary: {
      icon: "text-blue-900 bg-blue-50",
      button: "bg-blue-900 hover:bg-blue-800 focus:ring-blue-700",
    },
  }[tone];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onClose?.()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 animate-fade-in">
        <div className="flex items-start justify-between p-5 pb-0">
          <div className={`flex items-center justify-center w-11 h-11 rounded-full ${toneStyles.icon}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-5">
          <h3 id="confirm-modal-title" className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          {message && <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{message}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${toneStyles.button}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
