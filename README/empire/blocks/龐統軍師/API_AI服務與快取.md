# API、AI 服務與快取

> 最後整理：2026-08-15

## Apps Script API 索引

來源：[D:\WebApp\WebApp.gs](D:/WebApp/WebApp.gs)

| action | 用途 | 分類 |
| --- | --- | --- |
| `todayAdvisorReminder` | 取得／產生今日軍師提醒 | 讀取但可能建立當日提醒 |
| `advisorAiParse` | 將自然語句解析為安全 JSON 指令 | 受 token 保護 |
| `advisorDividendMemo` | 配息備忘試算或寫入 | 受 token 保護 |
| `accounts` | 查帳 | 讀取 |
| `foodhouseDashboard` | 糧倉／本月財務摘要 | 讀取 |
| `marketDashboard` | 市場與維持率 | 讀取 |
| `todayCalendar`、`todayTasks` | 今日行程與待辦 | 讀取／外部授權 |
| `expense`、`income`、`transfer` | 財務寫入 | 受 token 保護 |

支出目前由龐統快速支出列或內政快速記帳直接呼叫 `expense`；前端不再把 `expense` 當作 AI 口令 intent。Apps Script 的 `expense` action 仍需保留，因為它是正式寫入 API，不等於重新啟用支出口令訓練。

## 今日軍師提醒

後端使用主試算表／外部資料試算表中的 `每日軍師提醒` 分頁：

```text
日期｜提醒內容｜字數｜產生方式｜建立時間
```

`getTodayAdvisorReminder()` 會先找今日既有列；沒有時才使用 DeepSeek 產生，並用 Script Lock 避免同日重複建立。DeepSeek 失敗時使用後端 fallback 提醒。此流程可能因 GET 讀取而建立資料，維修時不可把它當成純讀取 API。

## AI 服務

`parseAdvisorAICommandWithDeepSeek_()` 與每日提醒都呼叫 DeepSeek Chat Completions。設定從 Apps Script Properties 讀取：

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL`，目前限制 `deepseek-v4-pro` 或 `deepseek-v4-flash`

金鑰不可寫入前端、README、Git、錯誤訊息或測試輸出。

## 前端快取

| 用途 | localStorage key | 說明 |
| --- | --- | --- |
| 今日提醒 | `empire_today_advisor_reminder_v1` | 顯示上次提醒，再嘗試更新 |
| 糧倉簡報 | `empire_advisor_ai_granary_brief_v1` | 快取上次本月財政／配息摘要 |
| V2 指令解析 | `empire_advisor_ai_parse_v1_...` | 以輸入指令摘要組成 key，TTL 24 小時 |
| 網頁驗證狀態 | `wealth_web_verify_status`、`wealth_web_verify_message`、`wealth_web_verify_checked_at` | 驗證成功後記住狀態；重新整理或重新進入頁面時自動恢復並在背景重新驗證，失敗才重新鎖定 |

後端也會以 Script Cache 快取相同原始指令的 AI JSON 解析結果。快取不是正式資料來源；遇到指令或財務結果不一致時，應清除快取並回查正式 API／試算表。

網頁驗證成功後，API URL 與 WRITE_TOKEN 由瀏覽器既有設定保存；前端載入時會立即恢復本次瀏覽器的帝國解鎖狀態與綠色燈號，再以較快的 `verifyWriteToken` 背景確認，不阻擋使用者點擊卡片。若密鑰已失效，會自動鎖回並要求重新驗證。

## 驗證流程

1. 先確認前端 API URL、WRITE_TOKEN 是否由使用者在設定面板提供，且沒有寫入原始碼。
2. 分別驗證 `todayAdvisorReminder`、`advisorAiParse`、查詢 action 與寫入 action。
3. AI 解析只驗證 intent 與欄位結構，不把真實財務指令貼到公開回報。
4. 寫入型 action 必須另外確認 token、正式回應與試算表／最近紀錄。
5. 若 DeepSeek 不可用，確認 fallback 或安全拒絕行為，不把 AI 失敗當成可直接寫入。
