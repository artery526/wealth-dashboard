// ============================================================
//  Empire Command — manual Apps Script maintenance helpers
//  These functions are not Web App API routes.
// ============================================================

function authorizeCalendar() {
  var calendars = CalendarApp.getAllCalendars();
  return 'Google Calendar 授權成功，可讀取行事曆數量：' + calendars.length;
}

function authorizeGoogleTasks() {
  var lists = Tasks.Tasklists.list({ maxResults: 10 }).items || [];
  return 'Google Tasks 授權成功，可讀取待辦清單數量：' + lists.length;
}

function testMacroWebhook() {
  return writeMacroWebhook(getExternalDbSpreadsheet_(), buildMacroWebhookTestPayload_());
}

function repairMacroDataRows() {
  var ss = getExternalDbSpreadsheet_();
  var sheets = ensureMacroSheets_(ss);
  var fixed = repairShiftedMacroDataRows_(sheets.data);
  return '總經資料庫欄位修復完成，修正 ' + fixed + ' 列';
}

function installDailyMacroTrigger() {
  deleteDailyMacroTriggers_();
  ScriptApp.newTrigger('dailyMacroBriefing')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .nearMinute(0)
    .create();
  return '已建立 dailyMacroBriefing 每日 09:00 觸發器';
}

function deleteDailyMacroTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'dailyMacroBriefing') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function marketDashboardCloseRefresh() {
  return refreshMarketDashboard();
}

function installMarketDashboardCloseRefreshTrigger() {
  var deleted = deleteMarketDashboardCloseRefreshTriggers_();
  ScriptApp.newTrigger('marketDashboardCloseRefresh')
    .timeBased()
    .everyDays(1)
    .atHour(14)
    .nearMinute(0)
    .create();
  return {
    message: '已建立 marketDashboardCloseRefresh 每日 14:00 觸發器',
    deleted: deleted,
    status: getMarketDashboardCloseRefreshTriggerStatus()
  };
}

function getMarketDashboardCloseRefreshTriggerStatus() {
  var triggers = ScriptApp.getProjectTriggers()
    .filter(function(trigger) {
      return trigger.getHandlerFunction() === 'marketDashboardCloseRefresh';
    })
    .map(function(trigger) {
      return {
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType()),
        source: String(trigger.getTriggerSource()),
        uid: trigger.getUniqueId ? trigger.getUniqueId() : ''
      };
    });

  return {
    handler: 'marketDashboardCloseRefresh',
    count: triggers.length,
    installed: triggers.length > 0,
    triggers: triggers
  };
}

function deleteMarketDashboardCloseRefreshTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'marketDashboardCloseRefresh') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
}

function repairCubeBalanceFormula() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  moon.getRange('B10')
    .setFormula('=SUMIFS(\'資料庫\'!G:G,\'資料庫\'!I:I,A10,\'資料庫\'!B:B,"收入")+SUMIFS(\'資料庫\'!C:C,\'資料庫\'!E:E,A10,\'資料庫\'!B:B,"支出")+SUMIFS(\'資料庫\'!O:O,\'資料庫\'!N:N,A10,\'資料庫\'!B:B,"轉帳")-SUMIFS(\'資料庫\'!O:O,\'資料庫\'!M:M,A10,\'資料庫\'!B:B,"轉帳")-SUMIFS(\'資料庫\'!O:O,\'資料庫\'!M:M,A10,\'資料庫\'!B:B,"買入股票")+SUMIFS(\'資料庫\'!O:O,\'資料庫\'!N:N,A10,\'資料庫\'!B:B,"賣出股票")')
    .setFontColor('#D85A30')
    .setNumberFormat('#,##0;[Red]-#,##0;0');
  SpreadsheetApp.flush();

  return {
    cell: '月度戰情室!B10',
    formula: moon.getRange('B10').getFormula(),
    value: moon.getRange('B10').getDisplayValue()
  };
}

function removeUsCloseReportSheetAndTriggers() {
  var deletedTriggers = deleteDailyUsCloseReportTriggers_();
  var ss = getExternalDbSpreadsheet_();
  var sheet = ss.getSheetByName('副軍師美股日報');
  var deletedSheet = false;
  if (sheet && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet);
    deletedSheet = true;
  }
  return {
    deletedTriggers: deletedTriggers,
    deletedSheet: deletedSheet,
    message: '副軍師美股日報分頁與 dailyUsCloseReport 觸發器已清理'
  };
}

function installDailyUsCloseReportTrigger() {
  return removeUsCloseReportSheetAndTriggers();
}

function deleteDailyUsCloseReportTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'dailyUsCloseReport') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
}

function backupMonthlyBattleRoomBValues() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var tz = ss.getSpreadsheetTimeZone ? ss.getSpreadsheetTimeZone() : 'Asia/Taipei';
  var stamp = Utilities.formatDate(new Date(), tz || 'Asia/Taipei', 'yyyyMMdd_HHmmss');
  var backupName = '備份_月度B欄_' + stamp;
  var backup = ss.insertSheet(backupName);
  var endRow = typeof MOON_ACCOUNT_END_ROW === 'number' ? MOON_ACCOUNT_END_ROW : 11;
  var lastRow = Math.max(moon.getLastRow(), endRow);
  var labels = moon.getRange(1, 1, lastRow, 1).getDisplayValues();
  var values = moon.getRange(1, 2, lastRow, 1).getDisplayValues();
  var formulas = moon.getRange(1, 2, lastRow, 1).getFormulas();
  var rows = [['列號', 'A欄標籤', 'B欄顯示值', 'B欄公式']];

  for (var i = 0; i < lastRow; i++) {
    rows.push([i + 1, labels[i][0], values[i][0], formulas[i][0]]);
  }

  backup.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  backup.setFrozenRows(1);
  backup.autoResizeColumns(1, 4);

  return {
    sheet: backupName,
    range: '月度戰情室!A1:B' + lastRow,
    rows: lastRow
  };
}

function repairMonthlyBattleRoomAccountFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var backup = backupMonthlyBattleRoomBValues();
  var startRow = typeof MOON_ACCOUNT_START_ROW === 'number' ? MOON_ACCOUNT_START_ROW : 3;
  var endRow = typeof MOON_ACCOUNT_END_ROW === 'number' ? MOON_ACCOUNT_END_ROW : 11;
  var formulas = [];

  for (var row = startRow; row <= endRow; row++) {
    formulas.push(['=SUMIFS(\'資料庫\'!G:G,\'資料庫\'!I:I,A' + row + ',\'資料庫\'!B:B,"收入")'
      + '+SUMIFS(\'資料庫\'!C:C,\'資料庫\'!E:E,A' + row + ',\'資料庫\'!B:B,"支出")'
      + '+SUMIFS(\'資料庫\'!O:O,\'資料庫\'!N:N,A' + row + ',\'資料庫\'!B:B,"轉帳")'
      + '-SUMIFS(\'資料庫\'!O:O,\'資料庫\'!M:M,A' + row + ',\'資料庫\'!B:B,"轉帳")'
      + '-SUMIFS(\'資料庫\'!O:O,\'資料庫\'!M:M,A' + row + ',\'資料庫\'!B:B,"買入股票")'
      + '+SUMIFS(\'資料庫\'!O:O,\'資料庫\'!N:N,A' + row + ',\'資料庫\'!B:B,"賣出股票")']);
  }

  moon.getRange(startRow, 2, formulas.length, 1)
    .setFormulas(formulas)
    .setFontColor('#D85A30')
    .setNumberFormat('#,##0;[Red]-#,##0;0');
  SpreadsheetApp.flush();

  return {
    backup: backup,
    formulaRange: '月度戰情室!B' + startRow + ':B' + endRow,
    firstFormula: moon.getRange(startRow, 2).getFormula()
  };
}

function repairMonthlyBattleRoomDividendIncomeFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moon = ss.getSheetByName('月度戰情室');
  if (!moon) throw new Error('找不到月度戰情室');

  var startRow = 12;
  var endRow = 23;
  var formulas = [];

  for (var row = startRow; row <= endRow; row++) {
    formulas.push([
      '=IF($A' + row + '="","",IFERROR(SUMPRODUCT('
        + 'N(\'資料庫\'!$G$2:$G),'
        + '--ISNUMBER(SEARCH(REGEXREPLACE(TO_TEXT($A' + row + '),"^[^A-Za-z0-9一-龥]+",""),TO_TEXT(\'資料庫\'!$F$2:$F)))'
        + '),0))'
    ]);
  }

  moon.getRange(startRow, 7, formulas.length, 1)
    .setFormulas(formulas)
    .setNumberFormat('#,##0');
  SpreadsheetApp.flush();

  return {
    range: '月度戰情室!G' + startRow + ':G' + endRow,
    firstFormula: moon.getRange(startRow, 7).getFormula()
  };
}

function repairIncomeAccountColumnAndValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ledger = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!ledger) throw new Error('找不到資料庫');
  if (!moon) throw new Error('找不到月度戰情室');

  var holdingStart = getMoonHoldingStartRow_(moon);
  var accountEnd = Math.max(MOON_ACCOUNT_START_ROW, holdingStart - 1);
  var accountRange = moon.getRange(MOON_ACCOUNT_START_ROW, MOON_ACCOUNT_NAME_COL, accountEnd - MOON_ACCOUNT_START_ROW + 1, 1);
  var lastRow = Math.max(ledger.getLastRow(), 2);

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(accountRange, true)
    .setAllowInvalid(false)
    .build();
  ledger.getRange(2, 9, Math.max(lastRow - 1, 1), 1).setDataValidation(rule);

  if (lastRow < 2) {
    return { migrated: 0, validationRange: '資料庫!I2:I' + lastRow };
  }

  var rows = ledger.getRange(2, 1, lastRow - 1, 16).getValues();
  var updates = [];
  var migrated = 0;

  rows.forEach(function(row) {
    var type = String(row[1] || '').trim();
    if (type !== '收入') {
      updates.push([row[8] || '']);
      return;
    }
    var currentIncomeAccount = String(row[8] || '').trim();
    var legacyAccount = String(row[12] || '').trim();
    var nextAccount = currentIncomeAccount || legacyAccount;
    if (!currentIncomeAccount && legacyAccount) migrated++;
    updates.push([nextAccount]);
  });

  if (updates.length) {
    ledger.getRange(2, 9, updates.length, 1)
      .setValues(updates)
      .setNumberFormat('@')
      .setDataValidation(rule);
  }
  SpreadsheetApp.flush();

  return {
    migrated: migrated,
    validationRange: '資料庫!I2:I' + lastRow,
    accountSourceRange: '月度戰情室!A' + MOON_ACCOUNT_START_ROW + ':A' + accountEnd
  };
}

function repairExpenseAccountColumnAndValidation() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ledger = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!ledger) throw new Error('找不到資料庫');
  if (!moon) throw new Error('找不到月度戰情室');

  var holdingStart = getMoonHoldingStartRow_(moon);
  var accountEnd = Math.max(MOON_ACCOUNT_START_ROW, holdingStart - 1);
  var accountRange = moon.getRange(MOON_ACCOUNT_START_ROW, MOON_ACCOUNT_NAME_COL, accountEnd - MOON_ACCOUNT_START_ROW + 1, 1);
  var lastRow = Math.max(ledger.getLastRow(), 2);

  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(accountRange, true)
    .setAllowInvalid(false)
    .build();
  ledger.getRange(2, 5, Math.max(lastRow - 1, 1), 1).setDataValidation(rule);

  if (lastRow < 2) {
    return { migrated: 0, validationRange: '資料庫!E2:E' + lastRow };
  }

  var rows = ledger.getRange(2, 1, lastRow - 1, 16).getValues();
  var updates = [];
  var migrated = 0;

  rows.forEach(function(row) {
    var type = String(row[1] || '').trim();
    if (type !== '支出') {
      updates.push([row[4] || '']);
      return;
    }
    var currentExpenseAccount = String(row[4] || '').trim();
    var legacyAccount = String(row[12] || '').trim();
    var nextAccount = legacyAccount || currentExpenseAccount;
    if (legacyAccount && currentExpenseAccount !== legacyAccount) migrated++;
    updates.push([nextAccount]);
  });

  if (updates.length) {
    ledger.getRange(2, 5, updates.length, 1)
      .setValues(updates)
      .setNumberFormat('@')
      .setDataValidation(rule);
  }
  SpreadsheetApp.flush();

  return {
    migrated: migrated,
    validationRange: '資料庫!E2:E' + lastRow,
    accountSourceRange: '月度戰情室!A' + MOON_ACCOUNT_START_ROW + ':A' + accountEnd
  };
}

function swapTransferFromToColumnsForNewSchema() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ledger = ss.getSheetByName('資料庫');
  var moon = ss.getSheetByName('月度戰情室');
  if (!ledger) throw new Error('找不到資料庫');
  if (!moon) throw new Error('找不到月度戰情室');

  var lastRow = ledger.getLastRow();
  if (lastRow < 2) return { swapped: 0, range: '資料庫!M:N' };

  var targetRange = ledger.getRange(2, 13, lastRow - 1, 2);
  targetRange.clearDataValidations();

  var rows = ledger.getRange(2, 1, lastRow - 1, 16).getValues();
  var updates = [];
  var swapped = 0;

  rows.forEach(function(row) {
    var type = String(row[1] || '').trim();
    var m = row[12] || '';
    var n = row[13] || '';
    if (type === '轉帳' || type === '買入股票' || type === '賣出股票' || type === '配息收入') {
      updates.push([n, m]);
      swapped++;
    } else {
      updates.push([m, n]);
    }
  });

  targetRange
    .setValues(updates)
    .setNumberFormat('@');

  var accountEnd = Math.max(moon.getLastRow(), MOON_ACCOUNT_START_ROW);
  accountEnd = Math.min(accountEnd, 200);
  var accountRange = moon.getRange(MOON_ACCOUNT_START_ROW, MOON_ACCOUNT_NAME_COL, accountEnd - MOON_ACCOUNT_START_ROW + 1, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(accountRange, true)
    .setAllowInvalid(true)
    .build();
  targetRange.setDataValidation(rule);

  SpreadsheetApp.flush();

  return {
    swapped: swapped,
    range: '資料庫!M2:N' + lastRow,
    schema: 'M=轉出帳戶，N=轉入帳戶',
    accountSourceRange: '月度戰情室!A' + MOON_ACCOUNT_START_ROW + ':A' + accountEnd
  };
}

function installDailyAssetSnapshotTrigger() {
  deleteDailyAssetSnapshotTriggers_();
  ScriptApp.newTrigger('recordDailyAssetSnapshot')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .nearMinute(10)
    .create();
  return '已建立 recordDailyAssetSnapshot 每日 09:10 觸發器';
}

function getDailyAssetSnapshotTriggerStatus() {
  var triggers = ScriptApp.getProjectTriggers()
    .filter(function(trigger) {
      return trigger.getHandlerFunction() === 'recordDailyAssetSnapshot';
    })
    .map(function(trigger) {
      return {
        handler: trigger.getHandlerFunction(),
        eventType: String(trigger.getEventType()),
        source: String(trigger.getTriggerSource()),
        uid: trigger.getUniqueId ? trigger.getUniqueId() : ''
      };
    });

  return {
    handler: 'recordDailyAssetSnapshot',
    count: triggers.length,
    installed: triggers.length > 0,
    triggers: triggers
  };
}

function deleteDailyAssetSnapshotTriggers_() {
  var count = 0;
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'recordDailyAssetSnapshot') {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  return count;
}

function repairCubeBalanceFormula() {
  return repairMonthlyBattleRoomAccountFormulas();
}

function getSheetByIdForMaintenance_(ss, sheetId) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === sheetId) return sheets[i];
  }
  return null;
}

function quoteSheetNameForFormula_(name) {
  return "'" + String(name || '').replace(/'/g, "''") + "'";
}

function monthlyBattleRoomAccountFormulaV2_(row, ledgerName, baseName) {
  var ledger = quoteSheetNameForFormula_(ledgerName);
  var base = quoteSheetNameForFormula_(baseName);
  var account = 'A' + row;
  return '=LET(acct,' + account
    + ',base,IFNA(VLOOKUP(acct,' + base + '!$A:$E,2,FALSE),0)'
    + ',baseRow,IFNA(VLOOKUP(acct,' + base + '!$A:$E,5,FALSE),1)'
    + ',base'
    + '+IFNA(SUM(FILTER(' + ledger + '!G:G,' + ledger + '!B:B="收入",' + ledger + '!I:I=acct,ROW(' + ledger + '!B:B)>baseRow)),0)'
    + '+IFNA(SUM(FILTER(' + ledger + '!C:C,' + ledger + '!B:B="支出",' + ledger + '!E:E=acct,ROW(' + ledger + '!B:B)>baseRow)),0)'
    + '+IFNA(SUM(FILTER(' + ledger + '!O:O,' + ledger + '!B:B="轉帳",' + ledger + '!N:N=acct,ROW(' + ledger + '!B:B)>baseRow)),0)'
    + '-IFNA(SUM(FILTER(' + ledger + '!O:O,' + ledger + '!B:B="轉帳",' + ledger + '!M:M=acct,ROW(' + ledger + '!B:B)>baseRow)),0)'
    + '-IFNA(SUM(FILTER(' + ledger + '!O:O,' + ledger + '!B:B="買入股票",' + ledger + '!M:M=acct,ROW(' + ledger + '!B:B)>baseRow)),0)'
    + '+IFNA(SUM(FILTER(' + ledger + '!O:O,' + ledger + '!B:B="賣出股票",' + ledger + '!N:N=acct,ROW(' + ledger + '!B:B)>baseRow)),0)'
    + ')';
}

function repairMonthlyBattleRoomAccountFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moon = getSheetByIdForMaintenance_(ss, 1525278727);
  var ledger = getSheetByIdForMaintenance_(ss, 482251636);
  var base = ss.getSheetByName('帳戶基準');
  if (!moon) throw new Error('Missing 月度戰情室 sheet');
  if (!ledger) throw new Error('Missing 資料庫 sheet');
  if (!base) throw new Error('Missing 帳戶基準 sheet');

  var startRow = typeof MOON_ACCOUNT_START_ROW === 'number' ? MOON_ACCOUNT_START_ROW : 3;
  var endRow = typeof MOON_ACCOUNT_END_ROW === 'number' ? MOON_ACCOUNT_END_ROW : 11;
  var formulas = [];
  for (var row = startRow; row <= endRow; row++) {
    formulas.push([monthlyBattleRoomAccountFormulaV2_(row, ledger.getName(), base.getName())]);
  }

  moon.getRange(startRow, 2, formulas.length, 1)
    .setFormulas(formulas)
    .setFontColor('#D85A30')
    .setNumberFormat('#,##0;[Red]-#,##0;0');
  SpreadsheetApp.flush();

  return {
    formulaRange: moon.getName() + '!B' + startRow + ':B' + endRow,
    firstFormula: moon.getRange(startRow, 2).getFormula(),
    cubeValue: moon.getRange('B10').getDisplayValue()
  };
}

function repairCubeBalanceFormula() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var moon = getSheetByIdForMaintenance_(ss, 1525278727);
  var ledger = getSheetByIdForMaintenance_(ss, 482251636);
  var base = ss.getSheetByName('帳戶基準');
  if (!moon) throw new Error('Missing 月度戰情室 sheet');
  if (!ledger) throw new Error('Missing 資料庫 sheet');
  if (!base) throw new Error('Missing 帳戶基準 sheet');

  moon.getRange('B10')
    .setFormula(monthlyBattleRoomAccountFormulaV2_(10, ledger.getName(), base.getName()))
    .setFontColor('#D85A30')
    .setNumberFormat('#,##0;[Red]-#,##0;0');
  SpreadsheetApp.flush();

  return {
    cell: moon.getName() + '!B10',
    formula: moon.getRange('B10').getFormula(),
    value: moon.getRange('B10').getDisplayValue()
  };
}
