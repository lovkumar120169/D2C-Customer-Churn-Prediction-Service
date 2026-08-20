import React, { useRef, useState } from "react";
import { batchPredictChurn } from "../api.js";
import {
  downloadCsvTemplate,
  downloadResultsCsv,
  downloadTestCsv,
  parseCustomerCsv,
} from "../csv.js";

const RISK_BADGE = {
  Low: "border-vital-low/30 bg-vital-low/5 text-vital-low",
  Medium: "border-vital-mid/30 bg-vital-mid/5 text-vital-mid",
  High: "border-vital-high/30 bg-vital-high/5 text-vital-high",
};

function SummaryChip({ label, count, className }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] ${className}`}
    >
      <span className="font-semibold">{count}</span>
      {label}
    </div>
  );
}

export default function BatchPredictPanel() {
  const fileInputRef = useRef(null);

  const [fileName, setFileName] = useState(null);
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [results, setResults] = useState(null); // predictions[] aligned to rows
  const [batchError, setBatchError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);

  function resetOutcome() {
    setResults(null);
    setBatchError(null);
  }

  async function handleFileSelected(file) {
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    resetOutcome();
    setRows([]);

    const { rows: parsedRows, error } = await parseCustomerCsv(file);

    if (error) {
      setParseError(error);
      return;
    }

    setRows(parsedRows);
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    handleFileSelected(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFileSelected(file);
  }

  function handleClear() {
    setFileName(null);
    setRows([]);
    setParseError(null);
    resetOutcome();
  }

  async function handleRunBatch() {
    if (validRows.length === 0) return;

    setLoading(true);
    setBatchError(null);
    setResults(null);

    try {
      const res = await batchPredictChurn(validRows.map((r) => r.customer));
      setResults(res.predictions);
    } catch (err) {
      setBatchError(
        err.message || "Something went wrong while scoring this batch."
      );
    } finally {
      setLoading(false);
    }
  }

  const summary = results
    ? results.reduce(
      (acc, p) => {
        acc[p.risk_level] = (acc[p.risk_level] || 0) + 1;
        return acc;
      },
      { Low: 0, Medium: 0, High: 0 }
    )
    : null;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-ink2-muted">
            Batch Predict
          </h2>
          <p className="mt-2 max-w-xl font-body text-sm text-ink2-muted">
            Upload a CSV of customers to score them all at once against the
            same <code className="text-ink2-primary">/batch_predict</code>{" "}
            endpoint used for single-customer scoring.
          </p>
        </div>


        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="shrink-0 rounded-lg border border-surface-border px-3.5 py-2 font-body text-xs font-medium text-ink2-muted transition hover:border-signal hover:text-ink2-primary"
          >
            ↓ Download CSV template
          </button>
          <button
            type="button"
            onClick={downloadTestCsv}
            className="shrink-0  rounded-lg border border-surface-border px-3.5 py-2 font-body text-xs font-medium text-ink2-muted transition hover:border-signal hover:text-ink2-primary"
          >
            ↓ Download Test CSV
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-surface-border bg-ink/40 px-6 py-10 text-center transition hover:border-signal"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal-soft text-signal">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <p className="font-body text-sm text-ink2-primary">
            Drag and drop a CSV file here, or{" "}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="font-semibold text-signal underline-offset-2 hover:underline"
            >
              browse
            </button>
          </p>
          <p className="mt-1 font-body text-xs text-ink2-faint">
            Needs the same fields as the single-customer form. Use the
            template above if you're not sure of the columns.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {fileName && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-border bg-surface-raised/60 px-4 py-2.5">
          <span className="font-mono text-xs text-ink2-muted">
            📄 {fileName}
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="font-body text-xs text-ink2-faint transition hover:text-ink2-primary"
          >
            Clear
          </button>
        </div>
      )}

      {parseError && (
        <div className="mt-4 rounded-lg border border-vital-high/30 bg-vital-high/5 px-4 py-3 font-body text-sm text-vital-high">
          ⚠ {parseError}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <SummaryChip
              label="rows parsed"
              count={rows.length}
              className="border-surface-border bg-surface-raised text-ink2-muted"
            />
            <SummaryChip
              label="valid"
              count={validRows.length}
              className="border-vital-low/30 bg-vital-low/5 text-vital-low"
            />
            {invalidRows.length > 0 && (
              <SummaryChip
                label="invalid — will be skipped"
                count={invalidRows.length}
                className="border-vital-high/30 bg-vital-high/5 text-vital-high"
              />
            )}
          </div>

          {/* Preview / validation table */}
          <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-surface-border">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-surface-raised">
                <tr>
                  <th className="px-3 py-2 font-body text-[11px] uppercase tracking-wide text-ink2-faint">
                    Customer
                  </th>
                  <th className="px-3 py-2 font-body text-[11px] uppercase tracking-wide text-ink2-faint">
                    Status
                  </th>
                  <th className="px-3 py-2 font-body text-[11px] uppercase tracking-wide text-ink2-faint">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const prediction = results?.[i];
                  return (
                    <tr
                      key={row.rowIndex}
                      className="border-t border-surface-border"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-ink2-primary">
                        {row.customerId}
                      </td>
                      <td className="px-3 py-2 font-body text-xs">
                        {row.errors.length === 0 ? (
                          <span className="text-vital-low">Valid</span>
                        ) : (
                          <span
                            title={row.errors.join("; ")}
                            className="cursor-help text-vital-high"
                          >
                            {row.errors.length} issue
                            {row.errors.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-body text-xs">
                        {prediction ? (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${RISK_BADGE[prediction.risk_level]
                              }`}
                          >
                            {(prediction.churn_probability * 100).toFixed(1)}%
                            · {prediction.risk_level}
                          </span>
                        ) : (
                          <span className="text-ink2-faint">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRunBatch}
              disabled={loading || validRows.length === 0}
              className="rounded-lg bg-signal px-5 py-2.5 font-body text-sm font-semibold text-white shadow-glow transition hover:bg-signal-dim disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Scoring batch…"
                : `Run batch score (${validRows.length})`}
            </button>

            {results && (
              <button
                type="button"
                onClick={() => downloadResultsCsv(rows, results)}
                className="rounded-lg border border-surface-border px-3.5 py-2 font-body text-xs font-medium text-ink2-muted transition hover:border-signal hover:text-ink2-primary"
              >
                ↓ Export results CSV
              </button>
            )}
          </div>

          {batchError && (
            <div className="mt-4 rounded-lg border border-vital-high/30 bg-vital-high/5 px-4 py-3 font-body text-sm text-vital-high">
              ⚠ {batchError}
            </div>
          )}

          {summary && (
            <div className="mt-5 flex flex-wrap gap-2">
              <SummaryChip
                label="low risk"
                count={summary.Low}
                className="border-vital-low/30 bg-vital-low/5 text-vital-low"
              />
              <SummaryChip
                label="medium risk"
                count={summary.Medium}
                className="border-vital-mid/30 bg-vital-mid/5 text-vital-mid"
              />
              <SummaryChip
                label="high risk"
                count={summary.High}
                className="border-vital-high/30 bg-vital-high/5 text-vital-high"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
