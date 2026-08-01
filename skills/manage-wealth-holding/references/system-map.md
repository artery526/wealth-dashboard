# Empire holding system map

## Sources of truth

| Surface | Location | Role |
| --- | --- | --- |
| Holding row | Google Sheet `1MTPLhPA9j4kb2pllDDL1z7xaCD1UmIZutT0eVOHZd30`, `月度戰情室!A12:O24` | Live label, balances, shares, price, returns |
| Backend | `D:\WebApp\WebApp.gs` | Config, normalization, ledger and dividend writes |
| Frontend | `D:\wealth-dashboard\index.html` | Booking selectors, fallback lists, metadata, Pangtong parsing |
| Live API | Canonical deployment URL declared in `index.html` | Production read/write verification |
| Live site | `https://artery526.github.io/wealth-dashboard/` | Published frontend verification |

## Backend touchpoints

- `getTradeHoldingSymbols_`: derives selector holdings from the live monthly holding rows.
- `normalizeInvestmentSymbol_`: maps labels and aliases to canonical symbols.
- `getDividendDisplayLabel_`: maps canonical symbols to emoji display labels.
- `findAdvisorDividendHolding_`: resolves Pangtong dividend memo targets from live holdings.

## Frontend touchpoints

- `DIVIDEND_SYMBOLS`: offline/fallback dividend selector list.
- `STOCK_SYMBOLS`: offline/fallback booking and stock-trade selector list.
- `HOLDING_META`: emoji and visible holding name.
- `advisorAITransferAliases()`: account/holding alias resolution for transfers and stock legs.
- `advisorAIResolveInvestmentSymbol()`: shared canonical resolver for dividend entry, dividend memo, stock buy, and stock sell.
- `renderBookingForm()`: consumes API holdings for expense, income, and bank-stock transfer selectors.

## Deployment workflows

- Apps Script: follow `C:\Users\actio\.codex\memories\skills\apps-script-live-deploy-verify\SKILL.md`.
- GitHub Pages: follow `C:\Users\actio\.codex\memories\skills\github-pages-live-publish-verify\SKILL.md`.

## User-defined removal boundary

For `移除標的`, perform only these changes:

- remove the holding option from Domestic expense, Domestic income, and bank-stock transfer selectors
- delete the complete matching row from `月度戰情室`
- delete the complete matching configuration row from `武將資料`

Do not inspect, edit, migrate, clear, or delete `資料庫` history. Do not remove Pangtong aliases, investment resolvers, or backend canonical/display mappings unless the user separately expands the scope.
