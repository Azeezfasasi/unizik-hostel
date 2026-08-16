"use client";

/**
 * Shared page-header block: eyebrow icon, title, subtitle, and right-aligned
 * actions (buttons). Used at the top of every dashboard page for a
 * consistent, professional header treatment.
 */
export default function PageHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-blue-900/5 text-blue-900 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
