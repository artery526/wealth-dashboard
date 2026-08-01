# App 開發日誌

更新日期：2026-07-27  
範圍：`D:\WebApp\EmpireAndroid` Android App、App 專用素材與手動 APK 建置流程。

> 之後只要修 Android App，就先讀這一份。不要再讀舊混合日誌。

## 1. 專案定位

Empire Android 是帝國指揮所的手機端入口。它不是完整重寫網頁，而是以原生 Android 介面承接常用模組、讀取既有 Apps Script API 與 ArkOS 城牆 API，逐步把高頻功能做成手機可用的操作面板。

目前 App 專案與 Web 專案分離：

| 類別 | 路徑 |
| --- | --- |
| Android 專案 | `D:\WebApp\EmpireAndroid` |
| 主程式 | `D:\WebApp\EmpireAndroid\src\com\empire\control\MainActivity.java` |
| 建置腳本 | `D:\WebApp\EmpireAndroid\build-apk.ps1` |
| 安裝腳本 | `D:\WebApp\EmpireAndroid\install-apk.ps1` |
| Debug APK | `D:\WebApp\EmpireAndroid\build\empire-debug.apk` |
| 中文發行 APK | `D:\WebApp\EmpireAndroid\build\帝國 Empire.apk` |

## 2. 目前功能

### 首頁與模組

首頁使用六宮格卡片進入主要模組：

| 模組 | 現況 |
| --- | --- |
| 財政 | 讀取 API 顯示國庫、月度、年度財報、糧倉概要 |
| 內政 | 支援快速記帳、最近記錄與常用內政操作 |
| 軍機處 | 部隊陣容、市場快報、總經戰情、軍師摘要 |
| 醫館 | 快速紀錄、抽牌、牌卡統計、疼痛地圖 |
| 司天監 | 紫微星盤、事件編年 |
| 城牆 | 今日回憶、日記列表、圖片/影片檢視 |

### API 設定

App 設定集中在 `MainActivity.java` 的設定對話框與 `SharedPreferences`。

| 設定 | 用途 |
| --- | --- |
| `api_url` | Apps Script Web App API |
| `write_token` | 寫入用密鑰 |
| `wall_api_url` | ArkOS 城牆 API |
| `wall_read_token` | 城牆讀取通行令 |

預設 WebApp API 與城牆 API 目前直接寫在 `MainActivity.java` 常數區；後續若要加強安全性，可改成首次開啟時要求設定。

### 城牆

已接入 ArkOS 城牆：

- 讀取 `/api/photo-library/anniversaries/{month}/{day}` 顯示今日回憶。
- 讀取 `/api/expeditions` 顯示日記列表。
- 日記詳情支援 Markdown 本文與圖片/影片附件。
- 圖片優先使用 `originalUrl`，再 fallback 到 `url` / `thumbnailUrl`。
- 圖片點擊使用既有原圖檢視器。
- URL 會透過 `wallAbsoluteUrl()` 補上 read token。

### 影片下載輔助

App 有安全版影片下載 helper：

- 支援 TikTok、Threads、Facebook 連結。
- 行為是複製原始影片網址，並開啟外部下載網站。
- 不做 App 內爬取、WebView 自動化或直接下載。

### 醫館

App 醫館目前走主 WebApp API：

- 快速紀錄
- 抽牌紀錄
- 牌卡統計
- 疼痛地圖

寫入仍需要 API URL 與記帳密鑰。

## 3. 建置與安裝

常用命令：

```powershell
powershell -ExecutionPolicy Bypass -File D:\WebApp\EmpireAndroid\build-apk.ps1
powershell -ExecutionPolicy Bypass -File D:\WebApp\EmpireAndroid\install-apk.ps1
```

手動安裝 Debug APK：

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r D:\WebApp\EmpireAndroid\build\empire-debug.apk
```

若遇到 `INSTALL_PARSE_FAILED_NO_CERTIFICATES`，先重建 APK，再用 `adb install -r --no-incremental ...` 嘗試。

## 4. 開發紀錄

### 2026-07-16

- 建立獨立 `EmpireAndroid` 專案。
- 使用 Android Studio JBR、Android SDK、ADB，以手動腳本建置 APK。
- 建立六宮格手機入口，避免影響既有 WebApp。
- 完成 APK 編譯、ADB 安裝與 App 啟動驗證。

### 2026-07-16 至 2026-07-23

- 事件編年在 Android 端新增日期由新到舊排序。
- Android 城牆日記詳情圖片改為開啟既有原圖檢視器。
- 圖片 URL fallback 順序調整為 `originalUrl` -> `url` -> `thumbnailUrl`。
- 保留 `wallAbsoluteUrl()` 的 read-token 處理。

### 2026-07-22

- 首頁背景與 overscroll 顯示調整。
- 新增安全版影片下載 helper：複製網址並交給外部網站，不做直接下載。

### 2026-07-27

- App 筆記整理為本檔。
- 舊混合日誌不再作為 App 開發依據。

## 5. 後續注意

- App 端大多數功能依賴 `MainActivity.java`，改動前先用 `rg` 定位目標 renderer。
- 城牆 renderer 與網頁 Wall renderer 不共用程式，不能假設點擊與 URL 行為相同。
- 每次 App 修改後至少要跑一次建置；涉及實機互動時再安裝並啟動驗證。
- 不要把影片下載 helper 擴大成 App 內爬蟲或自動下載，除非主公明確要求並接受風險。

## 6. 讀檔規則

App 相關任務只需要先讀：

1. `D:\WebApp\APP_DEV_LOG.md`
2. 目標程式附近的 `MainActivity.java` 片段

除非任務同時牽涉 Web API 或前端發布，否則不需要讀 `WEB_DEV_LOG.md`。
