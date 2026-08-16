"use client";

// Central status-color map so the same status word always renders with the
// same color everywhere in the dashboard (requests, complaints, damage
// reports, donations, contact, newsletters, etc all reuse this).
const TONE_MAP = {
  // neutral / pending
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  open: "bg-amber-50 text-amber-700 border-amber-200",
  new: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-gray-100 text-gray-600 border-gray-200",
  // in progress
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  "in progress": "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  // positive / done
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  occupied: "bg-emerald-50 text-emerald-700 border-emerald-200",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // negative
  declined: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
  // closed / archived
  closed: "bg-gray-100 text-gray-600 border-gray-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const DEFAULT_TONE = "bg-gray-100 text-gray-600 border-gray-200";

export default function StatusBadge({ status, className = "" }) {
  const key = (status || "").toString().trim().toLowerCase();
  const tone = TONE_MAP[key] || DEFAULT_TONE;
  const label = status
    ? status.toString().replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${tone} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
