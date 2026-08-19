import React, { useMemo, useState } from "react";
import { CATEGORICAL_FIELDS, NUMERIC_GROUPS } from "../schema.js";
import { NumberField, SelectField } from "./Fields.jsx";

const TABS = ["Profile", ...NUMERIC_GROUPS.map((g) => g.title)];

export default function ChurnForm({
  values,
  onChange,
  onSubmit,
  loading,
  errors,
}) {
  const [tab, setTab] = useState(TABS[0]);

  const tabIndex = useMemo(() => TABS.indexOf(tab), [tab]);

  function goNext() {
    if (tabIndex < TABS.length - 1) {
      setTab(TABS[tabIndex + 1]);
    }
  }

  function goPrevious() {
    if (tabIndex > 0) {
      setTab(TABS[tabIndex - 1]);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex h-full flex-col"
    >
      <div className="flex flex-wrap gap-1.5 border-b border-surface-border pb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition ${
              tab === t
                ? "bg-signal text-white shadow-glow"
                : "bg-surface-raised text-ink2-muted hover:text-ink2-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {tab === "Profile" && (
          <div>
            <div className="mb-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-sm font-semibold text-ink2-primary">
                    Customer Profile
                  </p>

                  <p className="mt-1 font-body text-sm text-ink2-muted">
                    Who this customer is — used as segmentation context
                    alongside their behavior.
                  </p>
                </div>

                <span className="font-mono text-[10px] text-ink2-faint">
                  1 / {TABS.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CATEGORICAL_FIELDS.map((field) => (
                <SelectField
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        )}

        {NUMERIC_GROUPS.map(
          (group) =>
            tab === group.title && (
              <div key={group.title}>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-semibold text-ink2-primary">
                      {group.title}
                    </p>

                    <p className="mt-1 font-body text-sm text-ink2-muted">
                      {group.caption}
                    </p>
                  </div>

                  <span className="shrink-0 font-mono text-[10px] text-ink2-faint">
                    {tabIndex + 1} / {TABS.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <NumberField
                      key={field.name}
                      field={field}
                      value={values[field.name]}
                      onChange={onChange}
                      error={errors?.[field.name]}
                    />
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      <div className="border-t border-surface-border pt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[10px] text-ink2-faint">
            SECTION {tabIndex + 1} OF {TABS.length}
          </span>

          <div className="flex gap-1">
            {TABS.map((_, index) => (
              <span
                key={index}
                className={`h-1 w-6 rounded-full ${
                  index <= tabIndex ? "bg-signal" : "bg-surface-raised"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {tabIndex > 0 && (
              <button
                type="button"
                onClick={goPrevious}
                className="rounded-lg border border-surface-border px-3.5 py-2 font-body text-xs text-ink2-muted transition hover:border-signal hover:text-ink2-primary"
              >
                ← Previous
              </button>
            )}

            {tabIndex < TABS.length - 1 && (
              <button
                type="button"
                onClick={goNext}
                className="rounded-lg border border-surface-border px-3.5 py-2 font-body text-xs text-ink2-muted transition hover:border-signal hover:text-ink2-primary"
              >
                Next section →
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-signal px-5 py-2.5 font-body text-sm font-semibold text-white shadow-glow transition hover:bg-signal-dim disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Scoring…" : "Run churn score"}
          </button>
        </div>
      </div>
    </form>
  );
}