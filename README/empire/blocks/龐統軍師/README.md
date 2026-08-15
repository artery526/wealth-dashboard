# 龐統軍師區塊

> 文件狀態：目前版，已依目前前端與 Apps Script 原始碼整理
>
> 最後整理：2026-08-15

## 功能範圍

龐統軍師是 Empire 的指令入口與跨區塊調閱助手，目前包含：

- 軍師 AI：將自然語句解析為查詢、導頁或待確認寫入指令。
- 今日簡報：顯示每日軍師提醒與糧倉／財政摘要。
- 快速查詢：快速轉帳、配息記錄、載具、超商會員、退稅查詢與其他保留查詢入口。
- 財務寫入：收入、轉帳、股票買賣與配息備忘；支出改由龐統上方的快速支出表單直接寫入，不再使用支出口令辨識。
- 跨區塊導頁：由 `open` 指令開啟財政、內政、軍機處、司天監、醫館等面板。

龐統軍師不是獨立資料庫；它主要協調 Empire 前端、Apps Script、Google Sheets 與外部 AI 服務。

## 系統邊界

| 系統 | 來源 |
| --- | --- |
| 前端 | `D:\wealth-dashboard\index.html` |
| Apps Script | `D:\WebApp\WebApp.gs` |
| 主要 AI 服務 | DeepSeek API；金鑰只存 Apps Script Properties |
| 主要資料 | Empire 主試算表、外部資料試算表、Google Calendar／Tasks |

## 前端入口

| 入口／函式 | 用途 |
| --- | --- |
| `openAdvisorAIFromOrb()` | 從龐統角色入口開啟獨立軍師面板 |
| `openAdvisorAI()` | 建立軍師 AI 指令面板 |
| `runAdvisorAICommand()` | 執行本地解析、V2 AI 解析、查詢或寫入流程 |
| `advisorAICommand()` | V1 本地口令解析器 |
| `advisorAIDeepSeekCommand()` | 呼叫後端 `advisorAiParse` 進行 V2 JSON 解析 |
| `advisorAIRequireWrite()` | 寫入前確認 API URL 與 WRITE_TOKEN |
| `loadAdvisorAIGranaryBrief()` | 讀取糧倉摘要並使用前端快取 |
| `advisorAIRecordQuickExpense()` | 由快速支出列直接寫入 `expense` |
| `advisorAIRecordQuickTransfer()` | 由快速轉帳表單直接寫入 `transfer` |
| `advisorAIOpenDividendRecord()` | 開啟配息標的、比例與預估金額表單 |

## 文件索引

- [指令解析與快速查詢](./指令解析與快速查詢.md)
- [寫入、確認與傳輸規則](./寫入確認與傳輸規則.md)
- [API、AI 服務與快取](./API_AI服務與快取.md)

## 維修總原則

- 先判斷是本地 V1 解析、DeepSeek V2 解析、API 查詢，還是寫入確認流程。
- GET 讀取、POST 寫入、GET fallback 與正式部署要分開驗證。
- 寫入請求若逾時，先回查最近紀錄與試算表，再決定是否重試，避免重複記帳。
- 不把 `WRITE_TOKEN`、DeepSeek API key、API URL 中的秘密參數或個人財務內容寫入公開文件。

## 目前介面與快捷流程（2026-08-15）

- 龐統圖縮小並置中於獨立軍師面板頂端，面板在手機版採接近滿寬顯示。
- 快捷卷軸影片按鈕採無外框、無文字的純影片樣式，固定放在網頁最左側並融合背景；與龐統入口共用點擊後的快捷分頁選單。
- 快捷卷軸改用 `menu.png` 靜態圖示並放大；手機快捷選單開啟時會回到最上方，標題列與關閉按鈕固定在可操作位置。
- 龐統上方固定顯示快速支出列：消費項目、支出帳戶、金額與 `📝` 記錄按鈕；此流程直接使用 `expense` API，不經 AI 解析。
- 「常用查詢」目前依序提供：快速轉帳、配息記錄、顯示載具、超商會員、退稅查詢、複製載具。
- 「配息記錄」使用 `✍️➡️🪙` 圖示，開啟後可選標的、輸入每股配息比例、自動估算金額，再按 `📝` 新增待入帳配息；記錄成功後會強制刷新配息中心快取，支援連續記錄不同標的。
- 「超商會員」會關閉龐統面板並開啟獨立會員畫面；桌面版三張會員卡並列，手機版改為大圖直向滑動，提供 7-11、全家與萊爾富條碼。
- 「快速轉帳」使用兩個帳戶下拉選單、金額與 `↔️` 按鈕，直接使用 `transfer` API，不經口令解析。
- 龐統資金提示沿用 `💰`、`💲`、`🛖`、`💳` 圖示；部分數值採快取優先、背景更新。
