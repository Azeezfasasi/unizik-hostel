"use client";
import { Inbox } from "lucide-react";

/**
 * Shared "no data" placeholder for tables/lists — replaces the bare
 * "No X found" text pages currently use with a consistent, friendlier state.
 */
export default function EmptyState({ icon: Icon = Inbox, title = "Nothing here yet", message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white rounded-xl border border-dashed border-gray-200">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 text-gray-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {message && <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
