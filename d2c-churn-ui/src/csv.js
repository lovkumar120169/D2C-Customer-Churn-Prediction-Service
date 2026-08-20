import Papa from "papaparse";
import { CATEGORICAL_FIELDS, NUMERIC_GROUPS } from "./schema.js";

// Mirrors CustomerFeatures in app/main.py — same field set used by the
// single-customer form, so a batch CSV is scored with identical rules.
const CATEGORICAL_DEFAULTS = CATEGORICAL_FIELDS.reduce((acc, f) => {
  acc[f.name] = f.default;
  return acc;
}, {});

const ALL_NUMERIC_FIELDS = NUMERIC_GROUPS.flatMap((g) => g.fields);
const CATEGORICAL_NAMES = CATEGORICAL_FIELDS.map((f) => f.name);
const NUMERIC_NAMES = ALL_NUMERIC_FIELDS.map((f) => f.name);

// Columns the template/export use, in a friendly order. An optional
// "customer_id" column may also be present in an uploaded file — it is
// used only for display and is never sent to the API.
export const TEMPLATE_COLUMNS = [
  "customer_id",
  ...CATEGORICAL_NAMES,
  ...NUMERIC_NAMES,
];

function numericFieldMeta(name) {
  return ALL_NUMERIC_FIELDS.find((f) => f.name === name);
}

function coerceNumber(raw) {
  if (raw === null || raw === undefined || raw === "") return NaN;
  if (typeof raw === "number") return raw;
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
}

// Validates + normalizes one parsed CSV row into the exact shape the
// /predict and /batch_predict endpoints expect (CustomerFeatures).
function buildCustomerFromRow(row) {
  const errors = [];
  const customer = {};

  CATEGORICAL_NAMES.forEach((name) => {
    const raw = row[name];
    customer[name] =
      raw === undefined || raw === null || String(raw).trim() === ""
        ? CATEGORICAL_DEFAULTS[name]
        : String(raw).trim();
  });

  NUMERIC_NAMES.forEach((name) => {
    const meta = numericFieldMeta(name);
    const num = coerceNumber(row[name]);

    if (row[name] === undefined || row[name] === null || String(row[name]).trim() === "") {
      errors.push(`${name}: missing`);
    } else if (Number.isNaN(num)) {
      errors.push(`${name}: not a number`);
    } else if (meta.min !== undefined && num < meta.min) {
      errors.push(`${name}: min ${meta.min}`);
    } else if (meta.max !== undefined && num > meta.max) {
      errors.push(`${name}: max ${meta.max}`);
    } else {
      customer[name] = num;
    }
  });

  return { customer, errors };
}

// Parses a File (CSV) into { rows, error }. Each row is:
// { rowIndex, customerId, raw, customer, errors }
// customer/errors come from buildCustomerFromRow — errors is [] when valid.
export function parseCustomerCsv(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (results.errors?.length) {
          const first = results.errors[0];
          resolve({
            rows: [],
            error: `Could not parse CSV (row ${first.row ?? "?"}): ${first.message}`,
          });
          return;
        }

        const data = results.data || [];

        if (data.length === 0) {
          resolve({ rows: [], error: "The CSV file has no data rows." });
          return;
        }

        const headerNames = results.meta.fields || [];
        const missingRequired = NUMERIC_NAMES.filter(
          (name) => !headerNames.includes(name)
        );

        if (missingRequired.length > 0) {
          resolve({
            rows: [],
            error: `CSV is missing required columns: ${missingRequired.join(", ")}`,
          });
          return;
        }

        const rows = data.map((raw, index) => {
          const { customer, errors } = buildCustomerFromRow(raw);
          return {
            rowIndex: index,
            customerId: raw.customer_id?.trim?.() || `Row ${index + 1}`,
            raw,
            customer,
            errors,
          };
        });

        resolve({ rows, error: null });
      },
      error: (err) => {
        resolve({ rows: [], error: err.message || "Failed to read CSV file." });
      },
    });
  });
}

export function downloadCsvTemplate() {
  const exampleRow = {
    customer_id: "CUST00001",
    ...CATEGORICAL_DEFAULTS,
  };
  ALL_NUMERIC_FIELDS.forEach((f) => {
    exampleRow[f.name] = f.default;
  });

  const csv = Papa.unparse({
    fields: TEMPLATE_COLUMNS,
    data: [TEMPLATE_COLUMNS.map((col) => exampleRow[col])],
  });

  triggerCsvDownload(csv, "churn_batch_customers.csv");
}

export function downloadTestCsv() {
  const link = document.createElement("a");
  link.href = "/batch_test_customers.csv";
  link.download = "batch_test_customers.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



// Merges the original rows with the API's ordered prediction results and
// exports the combined table as a CSV the user can open in a spreadsheet.
export function downloadResultsCsv(rows, predictions) {
  const columns = [
    "customer_id",
    "churn_probability",
    "predicted_class",
    "risk_level",
    "risk_explanation",
  ];

  const data = rows.map((row, i) => {
    const prediction = predictions[i] || {};
    return [
      row.customerId,
      prediction.churn_probability ?? "",
      prediction.predicted_class ?? "",
      prediction.risk_level ?? "",
      prediction.risk_explanation ?? "",
    ];
  });

  const csv = Papa.unparse({ fields: columns, data });
  triggerCsvDownload(csv, "churn_batch_results.csv");
}

function triggerCsvDownload(csvString, filename) {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
