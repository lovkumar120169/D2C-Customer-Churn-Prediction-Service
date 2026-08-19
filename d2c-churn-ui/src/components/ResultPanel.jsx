import React from "react";
import RiskGauge from "./RiskGauge.jsx";

const RISK_STYLES = {
  Low: {
    dot: "bg-vital-low",
    text: "text-vital-low",
    ring: "border-vital-low/40 bg-vital-low/10",
  },
  Medium: {
    dot: "bg-vital-mid",
    text: "text-vital-mid",
    ring: "border-vital-mid/40 bg-vital-mid/10",
  },
  High: {
    dot: "bg-vital-high",
    text: "text-vital-high",
    ring: "border-vital-high/40 bg-vital-high/10",
  },
};

export default function ResultPanel({ result, loading, apiError, apiOnline }) {
  const riskStyle = result ? RISK_STYLES[result.risk_level] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-ink2-muted">
          Readout
        </h2>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink2-faint">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              apiOnline === false ? "bg-vital-high" : apiOnline ? "bg-vital-low" : "bg-ink2-faint"
            }`}
          />
          {apiOnline === false ? "API offline" : apiOnline ? "API online" : "Checking…"}
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-xl border border-surface-border bg-ink/40 px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-ink2-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-signal border-t-transparent" />
            <span className="font-body text-sm">Scoring customer…</span>
          </div>
        )}

        {!loading && apiError && (
          <div className="text-center">
            <div className="mb-3 text-3xl">⚠</div>
            <p className="font-body text-sm text-vital-high">{apiError}</p>
          </div>
        )}

        {!loading && !apiError && !result && (
          <div className="text-center text-ink2-faint">
            <div className="mb-3 text-3xl">◎</div>
            <p className="font-body text-sm">
              Fill in the customer's signals and run a score to see the dial move.
            </p>
          </div>
        )}

        {!loading && !apiError && result && (
          <>
            <RiskGauge
              probabilityPct={result.churn_probability * 100}
              riskLevel={result.risk_level}
              animate
            />

            <div
              className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 ${riskStyle.ring}`}
            >
              <span className={`h-2 w-2 rounded-full ${riskStyle.dot}`} />
              <span className={`font-body text-sm font-semibold ${riskStyle.text}`}>
                {result.risk_level} risk
              </span>
              <span className="font-mono text-xs text-ink2-faint">
                · class {result.predicted_class}
              </span>
            </div>

            <p className="mt-4 max-w-xs text-center font-body text-sm leading-relaxed text-ink2-muted">
              {result.risk_explanation}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
