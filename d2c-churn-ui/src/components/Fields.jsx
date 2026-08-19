import React from "react";

export function NumberField({ field, value, onChange, error }) {
  return (
    <label className="group flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="font-body text-sm text-ink2-primary">{field.label}</span>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink2-faint">
          {field.unit}
        </span>
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={`w-full rounded-lg border bg-ink px-3 py-2 font-mono text-sm text-ink2-primary
          outline-none transition placeholder:text-ink2-faint
          focus:border-signal focus:bg-surface-raised
          ${error ? "border-vital-high" : "border-surface-border"}`}
      />
      {error ? (
        <span className="font-body text-xs text-vital-high">{error}</span>
      ) : (
        <span className="font-body text-xs text-ink2-faint group-focus-within:text-ink2-muted">
          {field.help}
        </span>
      )}
    </label>
  );
}

export function SelectField({ field, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-sm text-ink2-primary">{field.label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="w-full appearance-none rounded-lg border border-surface-border bg-ink px-3 py-2
            pr-9 font-body text-sm text-ink2-primary outline-none transition
            focus:border-signal focus:bg-surface-raised"
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink2-faint"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </label>
  );
}
