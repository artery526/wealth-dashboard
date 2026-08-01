import fs from "node:fs/promises";
import path from "node:path";

const ROOT = "D:/WebApp";
const DASHBOARD = path.join(ROOT, "outputs", "asset-growth-2024-2026-dashboard.html");

const SOURCES = {
  annual:
    "https://docs.google.com/spreadsheets/d/1MTPLhPA9j4kb2pllDDL1z7xaCD1UmIZutT0eVOHZd30/gviz/tq?tqx=out:csv&sheet=" +
    encodeURIComponent("年度財報"),
  snapshot:
    "https://docs.google.com/spreadsheets/d/1BPnjwZKlBmxMkHmLDk6MSV28kfcAtQhGuZdufv5T7FY/gviz/tq?tqx=out:csv&sheet=" +
    encodeURIComponent("每日資產快照"),
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((v) => String(v).trim() !== ""));
}

function toNumber(value) {
  if (value === undefined || value === null) return 0;
  const normalized = String(value).replace(/[,$\s]/g, "");
  if (!normalized || normalized === "—") return 0;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDate(value) {
  const m = String(value || "").match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!m) return String(value || "");
  return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
}

async function fetchCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return parseCsv(await res.text());
}

function parseAnnual(rows, currentYear) {
  const wantedYears = ["2024", "2025", String(currentYear)];
  const annual = wantedYears.map((year) => {
    const row = rows.find((r) => String(r[0]).trim() === year);
    if (!row) throw new Error(`Annual row not found: ${year}`);
    return {
      year: year === String(currentYear) ? `${year} YTD` : year,
      income: toNumber(row[1]),
      expense: toNumber(row[2]),
      net: toNumber(row[3]),
      asset: toNumber(row[4]),
    };
  });

  const monthlyRows = rows
    .filter((r) => new RegExp(`^${currentYear}/\\d{2}$`).test(String(r[0]).trim()))
    .map((r) => {
      const monthIndex = Number(String(r[0]).slice(5, 7)) - 1;
      return {
        month: MONTHS[monthIndex] || String(r[0]),
        income: toNumber(r[1]),
        expense: toNumber(r[2]),
        net: toNumber(r[3]),
      };
    })
    .filter((r) => r.income !== 0 || r.expense !== 0 || r.net !== 0);

  if (!monthlyRows.length) throw new Error(`No monthly rows found for ${currentYear}`);
  return { annual, monthlyRows };
}

function parseLatestSnapshot(rows) {
  const candidates = rows
    .filter((r) => /^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(String(r[0]).trim()))
    .map((r) => ({
      date: normalizeDate(r[0]),
      investmentMarketValue: toNumber(r[1]),
      totalAsset: toNumber(r[8]),
      exposure: String(r[6] || ""),
      debtRatio: String(r[7] || ""),
    }))
    .filter((r) => r.totalAsset > 0);

  if (!candidates.length) throw new Error("No snapshot row with total asset found");
  return candidates[candidates.length - 1];
}

function buildData({ annual, monthlyRows, latest }) {
  const current = annual[annual.length - 1];
  const previous = annual[annual.length - 2];
  const firstAsset = previous.asset;
  const currentRecordAsset = current.asset;
  const lastMonth = monthlyRows[monthlyRows.length - 1].month;

  return {
    generatedAt: latest.date,
    ytdLabel: `截至 ${current.year.replace(" YTD", "")}/${String(monthlyRows.length).padStart(2, "0")} 最新讀取月份`,
    latestAssetDate: latest.date,
    annual: annual.map(({ year, income, expense, net }) => ({ year, income, expense, net })),
    monthly: monthlyRows.map(({ month, net }) => ({ month, net })),
    assets: [
      { label: "2025 record", value: firstAsset },
      { label: `${current.year.replace(" YTD", "")} record`, value: currentRecordAsset },
      { label: latest.date, value: latest.totalAsset },
    ],
    latestMeta: {
      month: lastMonth,
      investmentMarketValue: latest.investmentMarketValue,
      exposure: latest.exposure,
      debtRatio: latest.debtRatio,
    },
  };
}

async function main() {
  const [annualRows, snapshotRows] = await Promise.all([fetchCsv(SOURCES.annual), fetchCsv(SOURCES.snapshot)]);
  const latest = parseLatestSnapshot(snapshotRows);
  const currentYear = Number(latest.date.slice(0, 4));
  const parsed = parseAnnual(annualRows, currentYear);
  const data = buildData({ ...parsed, latest });

  const html = await fs.readFile(DASHBOARD, "utf8");
  const replacement =
    `// REPORT_DATA_START\n` +
    `    const REPORT_DATA = ${JSON.stringify(data, null, 6).replace(/\n/g, "\n    ")};\n` +
    `    // REPORT_DATA_END`;

  const next = html.replace(/\/\/ REPORT_DATA_START[\s\S]*?\/\/ REPORT_DATA_END/, replacement);
  if (next === html) throw new Error("REPORT_DATA marker not found");
  await fs.writeFile(DASHBOARD, next, "utf8");
  console.log(JSON.stringify({ ok: true, dashboard: DASHBOARD, generatedAt: data.generatedAt, latestAsset: latest.totalAsset }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
