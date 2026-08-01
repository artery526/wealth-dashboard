---
name: manage-wealth-holding
description: Add, remove, rename, or audit Empire Finance investment holdings across the command spreadsheet, D:\WebApp Apps Script backend, D:\wealth-dashboard frontend booking selectors, and Pangtong advisor aliases. Use when the user says 新增標的, 移除標的, 新增試算表標的, 刪除持股, 更新持股名稱, or asks to synchronize an investment symbol everywhere and publish it live.
---

# Manage Wealth Holding

Treat one user command as an end-to-end holding change. Keep the spreadsheet label, backend canonical symbol, frontend display label, and Pangtong aliases consistent.

## Required context

Read [references/system-map.md](references/system-map.md) before editing. Read the Google Sheets skill before spreadsheet reads or writes. For live publication, use the Apps Script and GitHub Pages deployment skills named in the system map.

Parse these inputs from the request:

- operation: add, remove, rename, or audit
- display label including emoji, for example `🧸統一高股息基金`
- canonical name without decorative emoji
- aliases; derive only obvious aliases and preserve any exact mappings supplied by the user
- price source/formula and currency when adding

If a new holding lacks a discoverable, stable price source or its identity is ambiguous, pause and ask one concise question. Do not invent a ticker, fund class, currency, or pricing formula.

## Add workflow

1. Inspect the live spreadsheet metadata and bounded `月度戰情室!A12:O24` cells. Confirm the target is absent and find the intended row without shifting unrelated holdings.
2. Inspect comparable domestic-fund or foreign-security rows before choosing formulas. Preserve existing formulas, formats, and reference behavior. Write the display label and only the formulas required for the new row.
3. Re-read the row and verify label, price, and calculation cells. A blank or error price is not complete.
4. Update `D:\WebApp\WebApp.gs` canonical normalization and display mapping.
5. Update `D:\wealth-dashboard\index.html` fallback dividend list, fallback stock list, holding metadata, Pangtong transfer/trade aliases, and investment-symbol resolver.
6. Run `scripts/audit_holding_surfaces.ps1` with `-Expected present`. Fix every failed code-surface check.
7. Syntax-check both files. Deploy Apps Script through the existing production deployment and verify live `action=config` contains the display label.
8. Commit only the intended frontend file, push `main`, wait for Pages, and verify the public HTML contains the display label and aliases.
9. Report spreadsheet, backend deployment, git push, Pages, and live verification as separate statuses.

## Remove workflow

1. Resolve the canonical name, display label, and aliases from live sources; do not rely on the user's emoji alone.
2. Read the exact matching rows in `月度戰情室` and `武將資料`. Do not inspect, edit, migrate, or delete any `資料庫` records.
3. Delete the complete corresponding holding row from `月度戰情室`, then re-read the shifted area and verify neighboring formulas and totals remain correct.
4. Delete the complete corresponding setting row from `武將資料`, then verify the holding no longer appears in the army configuration.
5. Remove the holding only from the frontend selector sources used by Domestic expense, Domestic income, and bank-stock transfer: `DIVIDEND_SYMBOLS` and `STOCK_SYMBOLS` when entries exist. Leave Pangtong aliases, investment resolvers, backend normalization/display mappings, and all historical database data unchanged.
6. Run `scripts/audit_holding_surfaces.ps1` with `-Scope selectors -Expected absent`. Verify the live `action=config` no longer lists the holding after cache refresh.
7. If frontend selector source changed, syntax-check, commit, push, wait for Pages, and verify the public HTML. Do not deploy Apps Script when no backend code changed.

## Rename workflow

Treat rename as a migration, not remove-plus-add. Inspect history, update canonical references deliberately, preserve the old name as an alias unless the user forbids it, and verify old records still resolve to the new display label.

## Safety rules

- Use `D:\wealth-dashboard\index.html` as frontend source of truth and `D:\WebApp\WebApp.gs` as backend source of truth.
- Never hardcode current price values when a formula or stable source is required.
- Never claim completion from a local diff alone.
- For `移除標的`, never touch `資料庫`; the removal scope is only the three Domestic holding selectors, the full matching `月度戰情室` row, and the matching `武將資料` row.
- Preserve unrelated dirty files and the intentional deletion of `Goldpack.png`.
- Do not create commits or deployments for audit-only requests.

## Examples

- `新增標的 🧸統一高股息基金，別名：統一高股息、高股息基金，價格來源：<URL>`
- `移除標的 🤖AIPI`
- `稽核標的 🌐國泰高股息B`
