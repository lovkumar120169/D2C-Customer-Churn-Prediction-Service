import React, { useEffect, useState } from "react";
import ChurnForm from "./components/ChurnForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import TestCustomers from "./components/TestCustomers.jsx";
import { checkHealth, predictChurn } from "./api.js";
import { buildDefaultPayload, NUMERIC_GROUPS } from "./schema.js";

const ALL_NUMERIC_FIELDS = NUMERIC_GROUPS.flatMap((g) => g.fields);

function validate(values) {
  const errors = {};

  ALL_NUMERIC_FIELDS.forEach((field) => {
    const raw = values[field.name];
    const num = Number(raw);

    if (raw === "" || Number.isNaN(num)) {
      errors[field.name] = "Required";
    } else if (field.min !== undefined && num < field.min) {
      errors[field.name] = `Min ${field.min}`;
    } else if (field.max !== undefined && num > field.max) {
      errors[field.name] = `Max ${field.max}`;
    }
  });

  return errors;
}

export default function App() {
  const [values, setValues] = useState(buildDefaultPayload());
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);

  const [loadedCustomer, setLoadedCustomer] = useState(null);

  useEffect(() => {
    checkHealth()
      .then((res) => setApiOnline(Boolean(res?.model_loaded)))
      .catch(() => setApiOnline(false));
  }, []);

  function handleChange(name, rawValue) {
    setValues((prev) => ({
      ...prev,
      [name]: rawValue,
    }));

    setResult(null);
    setApiError(null);
  }

  function handleLoadCustomer(customer) {
    setValues({ ...customer.data });
    setErrors({});
    setResult(null);
    setApiError(null);
    setLoadedCustomer(customer);

    window.setTimeout(() => {
      document
        .getElementById("customer-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function handleClearCustomer() {
    setValues(buildDefaultPayload());
    setErrors({});
    setResult(null);
    setApiError(null);
    setLoadedCustomer(null);
  }

  async function handleSubmit() {
    const validationErrors = validate(values);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setApiError(null);
      setResult(null);
      return;
    }

    const payload = { ...values };

    ALL_NUMERIC_FIELDS.forEach((field) => {
      payload[field.name] = Number(values[field.name]);
    });

    setLoading(true);
    setApiError(null);

    try {
      const res = await predictChurn(payload);

      setResult(res);
      setApiOnline(true);
    } catch (err) {
      setApiError(
        err.message || "Something went wrong while scoring this customer."
      );

      setResult(null);

      if (err.status === 0) {
        setApiOnline(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal shadow-glow">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M3 12h4l2-7 4 14 2-7h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="font-display text-lg font-semibold text-ink2-primary">
                Churn Signal
              </h1>

              <p className="font-body text-xs text-ink2-faint">
                Churn risk console for D2C retention teams
              </p>
            </div>
          </div>

          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] sm:flex ${
              apiOnline === true
                ? "border-vital-low/30 bg-vital-low/5 text-vital-low"
                : apiOnline === false
                  ? "border-vital-high/30 bg-vital-high/5 text-vital-high"
                  : "border-surface-border bg-surface text-ink2-faint"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                apiOnline === true
                  ? "bg-vital-low"
                  : apiOnline === false
                    ? "bg-vital-high"
                    : "bg-ink2-faint"
              }`}
            />

            {apiOnline === true
              ? "API ONLINE"
              : apiOnline === false
                ? "API OFFLINE"
                : "CHECKING API"}
          </div>
        </header>

        <TestCustomers onLoadCustomer={handleLoadCustomer} />

        {loadedCustomer && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-signal/30 bg-signal-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-white">
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="m5 10 3 3 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="font-display text-xs font-semibold text-ink2-primary">
                  Test customer loaded
                </p>

                <p className="mt-0.5 font-body text-xs text-ink2-muted">
                  {loadedCustomer.id} · {loadedCustomer.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearCustomer}
              className="self-start rounded-lg border border-surface-border px-3 py-1.5 font-body text-xs text-ink2-muted transition hover:border-signal hover:text-ink2-primary sm:self-auto"
            >
              Clear customer
            </button>
          </div>
        )}

        <main className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section
            id="customer-form"
            className="rounded-2xl border border-surface-border bg-surface p-6 shadow-panel"
          >
            <ChurnForm
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
              errors={errors}
            />
          </section>

          <aside className="rounded-2xl border border-surface-border bg-surface p-6 shadow-panel lg:sticky lg:top-8 lg:h-fit">
            <ResultPanel
              result={result}
              loading={loading}
              apiError={apiError}
              apiOnline={apiOnline}
            />
          </aside>
        </main>

        <footer className="mt-8 text-center font-body text-xs text-ink2-faint">
          Predictions are decision-support estimates, not guaranteed outcomes.
        </footer>
      </div>
    </div>
  );
}