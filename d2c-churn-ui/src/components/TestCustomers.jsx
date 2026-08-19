import React, { useMemo, useState } from "react";
import { TEST_CUSTOMERS } from "../data/testCustomers.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "low", label: "Low Risk" },
  { key: "medium", label: "Medium Risk" },
  { key: "high", label: "High Risk" },
];

const RISK_CONFIG = {
  low: {
    label: "LOW RISK",
    dot: "bg-vital-low",
    text: "text-vital-low",
    border: "border-vital-low/30",
    bg: "bg-vital-low/5",
  },
  medium: {
    label: "MEDIUM RISK",
    dot: "bg-vital-mid",
    text: "text-vital-mid",
    border: "border-vital-mid/30",
    bg: "bg-vital-mid/5",
  },
  high: {
    label: "HIGH RISK",
    dot: "bg-vital-high",
    text: "text-vital-high",
    border: "border-vital-high/30",
    bg: "bg-vital-high/5",
  },
};

function CustomerCard({ customer, onLoad }) {
  const config = RISK_CONFIG[customer.riskCategory];

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} p-4 transition hover:-translate-y-0.5 hover:bg-surface-raised`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${config.dot}`}
              aria-hidden="true"
            />

            <span className="font-mono text-[11px] font-semibold text-ink2-faint">
              {customer.id}
            </span>

            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider ${config.border} ${config.text}`}
            >
              {config.label}
            </span>
          </div>

          <h3 className="font-display text-sm font-semibold text-ink2-primary">
            {customer.name}
          </h3>

          <p className="mt-1 font-body text-xs font-medium text-ink2-muted">
            {customer.title}
          </p>

          <p className="mt-2 max-w-xl font-body text-xs leading-5 text-ink2-faint">
            {customer.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onLoad(customer)}
          className="shrink-0 rounded-lg bg-signal px-3.5 py-2 font-body text-xs font-semibold text-white shadow-glow transition hover:bg-signal-dim"
        >
          Load Customer →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-surface-border pt-3 sm:grid-cols-4">
        <Metric label="Purchases" value={customer.metrics.purchases} />
        <Metric label="Revenue" value={customer.metrics.revenue} />
        <Metric label="Sessions" value={customer.metrics.sessions} />
        <Metric label="Last visit" value={customer.metrics.lastVisit} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="font-body text-[10px] uppercase tracking-wide text-ink2-faint">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-xs font-medium text-ink2-primary">
        {value}
      </p>
    </div>
  );
}

export default function TestCustomers({ onLoadCustomer }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filteredCustomers = useMemo(() => {
    if (filter === "all") return TEST_CUSTOMERS;

    return TEST_CUSTOMERS.filter(
      (customer) => customer.riskCategory === filter
    );
  }, [filter]);

  function handleRandomCustomer() {
    const randomCustomer =
      TEST_CUSTOMERS[Math.floor(Math.random() * TEST_CUSTOMERS.length)];

    onLoadCustomer(randomCustomer);
    setOpen(true);
  }

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-panel">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-raised"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-soft text-signal">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"
                strokeLinecap="round"
              />
              <rect
                x="4"
                y="7"
                width="16"
                height="13"
                rx="2"
              />
              <path
                d="M4 12h16M10 12v2h4v-2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-sm font-semibold text-ink2-primary">
              Test Customers
            </h2>
            <p className="mt-0.5 truncate font-body text-xs text-ink2-faint">
              Try the model with pre-configured low, medium, and high-risk
              customer profiles.
            </p>
          </div>
        </div>

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-raised text-ink2-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="m5 7.5 5 5 5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-surface-border px-5 pb-5 pt-4">
          <div className="mb-4 rounded-xl border border-surface-border bg-surface-raised/60 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-display text-xs font-semibold text-ink2-primary">
                  How to test
                </p>

                <p className="mt-1 max-w-2xl font-body text-xs leading-5 text-ink2-faint">
                  Select a sample customer, load their data into the form, then
                  run the churn score. The prediction is generated by the same
                  ML API used for manually entered customers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRandomCustomer}
                className="shrink-0 rounded-lg border border-surface-border px-3.5 py-2 font-body text-xs font-medium text-ink2-muted transition hover:border-signal hover:text-ink2-primary"
              >
                🎲 Random customer
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 font-body text-[11px] text-ink2-faint">
              <span>1. Choose customer</span>
              <span>→</span>
              <span>2. Load data</span>
              <span>→</span>
              <span>3. Run score</span>
              <span>→</span>
              <span>4. Review prediction</span>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition ${
                  filter === item.key
                    ? "bg-signal text-white shadow-glow"
                    : "bg-surface-raised text-ink2-muted hover:text-ink2-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onLoad={onLoadCustomer}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}