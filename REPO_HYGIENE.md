# D:\WebApp repo hygiene map

This file is a maintenance map only. It does not delete or move any files.

## Keep as source

- `WebApp.gs`: Apps Script backend source.
- `Maintenance.gs`: Apps Script maintenance helpers.
- `appsscript.json`: Apps Script manifest.
- `.claspignore`: clasp upload filter.
- `APP_DEV_LOG.md`: Android/app notes.
- `WEB_DEV_LOG.md`: Web, Apps Script, Sheets, Pages, and work-order notes.
- `EmpireAndroid/`: Android app project.
- `skills/`: local workflow skill files.
- `tools/`: local maintenance/reporting scripts.

## Review before tracking

- `.clasp.json`: needed by clasp locally; contains the Apps Script project id. Track only if this repository is private and the project id is acceptable to share.
- Root `*.mp4` and `*.png` assets: many are large and may be active UI/app media. Do not delete or ignore them globally until each file is mapped to a current consumer.

## Current large-file observations

Checked on 2026-07-29 without deleting or moving files.

- Largest root files are media assets, especially `finance-cardv2.mp4`, `domestic-cardv2.mp4`, `military-controlv2.mp4`, `medical-cardv2.mp4`, `wallapp.mp4`, and the Android `*app.mp4` set.
- `EmpireAndroid/src/com/empire/control/MainActivity.java` references Android packaged resources such as `R.raw.starsapp`, `R.raw.wallapp`, `R.drawable.background`, and `R.drawable.houtou_photoroom`.
- Root-level `*v2.mp4` files were not found as direct text references inside `D:\WebApp` during this pass. Treat them as archive/review candidates, not deletion candidates.
- Root-level generated image names such as `ChatGPT Image 2026...png` were not found as direct text references inside `D:\WebApp` during this pass.

## Cleanup performed on 2026-07-29

Deleted only root-level old media or duplicate media from `D:\WebApp`; no Android packaged resources and no `D:\wealth-dashboard` files were deleted.

Removed duplicate root copies that matched Android packaged resources:

- `domestic-cardapp.mp4`
- `finance-cardapp.mp4`
- `medical-cardapp.mp4`
- `military-controlapp.mp4`
- `starsapp.mp4`
- `wallapp.mp4`
- `background.png`
- `starsapp.png`

Removed unreferenced root-level old/generated image assets:

- `houtou-Photoroom.png`
- `Empirelogo.png`
- `每日練習.png`
- `ChatGPT Image 2026年7月14日 下午04_31_25.png`
- `ChatGPT Image 2026年7月14日 下午05_10_53.png`

Approximate space freed: 83.57 MB.

Post-cleanup verification:

- Android resource copies still existed under `EmpireAndroid/res/raw/` and `EmpireAndroid/res/drawable/`.
- `D:\wealth-dashboard` copies of `finance-cardv2.mp4`, `domestic-cardv2.mp4`, `military-controlv2.mp4`, `medical-cardv2.mp4`, `starsv2.mp4`, `wallv2.mp4`, `Kongmingmenuv2.mp4`, `pangtongmenuv2.mp4`, `bg-inkwash.png`, and `advisor-zhuge.png` still existed.

## Ignored local/generated files

- `.codex/`, `.agents/`, `.codex-remote-attachments/`: local assistant/task state.
- `outputs/`: generated reports, previews, and exports.
- `.clasp.wrong.json`: mistaken local clasp config.
- OS/editor noise such as `Thumbs.db`, `desktop.ini`, `*.tmp`, and `*.log`.

## Current cleanup rule

Do not use `git clean -fd` in this repository without first running:

```powershell
git clean -nd
```

The dry run must be reviewed because important current source files may still be untracked.

## Suggested next maintenance steps

1. Decide whether to track `.clasp.json`.
2. Add the current source files intentionally.
3. For old tracked deletions, either restore the old files or commit the deletion after confirming they are obsolete.
4. Build an asset inventory for the root media files before any media cleanup.

## Safe asset cleanup path

1. Search for each asset name in `D:\WebApp` and `D:\wealth-dashboard`.
2. If no reference is found, move it to a dated archive folder outside the app path rather than deleting it.
3. Run the Android build or Apps Script/Pages verification appropriate to the affected surface.
4. Only delete from the archive after a separate confirmation.
