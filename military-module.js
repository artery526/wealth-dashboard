function renderTaiexDynamicValuation(data){
  data=data||{};
  var taiexNumber=function(value){if(value===null||value===undefined||String(value).trim()==='')return null;var n=Number(value);return isFinite(n)?n:null;};
  var pe=taiexNumber(data.trailingPE), indexValue=taiexNumber(data.indexValue), earningsBase=taiexNumber(data.earningsBase);
  var zone=data.valuationZone||{};
  var gaugeMin=14,gaugeMax=30;
  var gaugePosition=isFinite(pe)?Math.max(0,Math.min(100,(pe-gaugeMin)/(gaugeMax-gaugeMin)*100)):null;
  var signed=function(value){var n=taiexNumber(value);return n!==null?(n>0?'+':'')+n.toFixed(1)+'%':'資料暫缺';};
  var num=function(value,digits){var n=taiexNumber(value);return n!==null?n.toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'資料暫缺';};
  var scenarioCards=(data.trailingScenarios||[]).map(function(item){var change=Number(item.changePct);return '<div class="taiex-valuation-card '+esc(item.tone||'')+'"><div class="taiex-valuation-card-label">'+esc(item.multiple+'× · '+item.label)+'</div><div class="taiex-valuation-card-price">'+num(item.indexLevel,0)+' 點</div><div class="taiex-valuation-card-change '+(isFinite(change)?change>=0?'up':'down':'flat')+'">'+esc(signed(change))+' 對目前指數</div></div>';}).join('');
  var forwardReady=taiexNumber(data.forwardEarnings2026)!==null;
  var forwardCards=(data.forwardScenarios||[]).map(function(item){return '<p><b>'+esc(item.multiple+'×')+'</b> → '+num(item.indexLevel,0)+' 點（'+esc(signed(item.changePct))+'）</p>';}).join('');
  var history=data.historicalPE||{}, concentration=data.concentration||{};
  var pct=taiexNumber(data.pePercentile)!==null?taiexNumber(data.pePercentile).toFixed(1)+'%':'資料暫缺';
  var summary='目前無可靠 Trailing P/E 或歷史估值資料，因此暫不產生估值判讀。';
  if(pe!==null&&earningsBase!==null&&data.trailingScenarios&&data.trailingScenarios.length){
    var s18=data.trailingScenarios.find(function(item){return Number(item.multiple)===18;});
    var s20=data.trailingScenarios.find(function(item){return Number(item.multiple)===20;});
    var s22=data.trailingScenarios.find(function(item){return Number(item.multiple)===22;});
    summary='加權指數目前 '+num(indexValue,0)+' 點，Trailing P/E '+pe.toFixed(1)+' 倍，目前估值位於'+esc(zone.label||'資料暫缺')+'。Earnings Base 約 '+num(earningsBase,0)+' 點；18／20／22 倍情境分別約 '+num(s18&&s18.indexLevel,0)+'／'+num(s20&&s20.indexLevel,0)+'／'+num(s22&&s22.indexLevel,0)+' 點。這是估值情境比較，不是點位預測。';
  }
  return '<section class="taiex-valuation" aria-label="台股加權動態估值">'+
    '<div class="taiex-valuation-head"><div><div class="taiex-valuation-title">🇹🇼 台股加權動態估值</div><div class="taiex-valuation-subtitle">以已實現近四季獲利與目前市場估值倍數判斷「現在貴不貴」；不是年底點位預測。</div></div><div class="taiex-valuation-status '+(data.hasData?'ready':'')+'">'+esc(data.status||'資料暫缺')+'</div></div>'+
    '<div class="taiex-valuation-kpis">'+
      '<div class="taiex-valuation-kpi"><div class="taiex-valuation-kpi-label">目前加權指數</div><div class="taiex-valuation-kpi-value accent">'+num(indexValue,0)+' 點</div></div>'+
      '<div class="taiex-valuation-kpi"><div class="taiex-valuation-kpi-label">Trailing P/E</div><div class="taiex-valuation-kpi-value">'+(pe!==null?pe.toFixed(1)+'×':'資料暫缺')+'</div></div>'+ 
      '<div class="taiex-valuation-kpi"><div class="taiex-valuation-kpi-label">P/B</div><div class="taiex-valuation-kpi-value">'+(taiexNumber(data.pb)!==null?taiexNumber(data.pb).toFixed(2)+'×':'資料暫缺')+'</div></div>'+ 
      '<div class="taiex-valuation-kpi"><div class="taiex-valuation-kpi-label">Earnings Base</div><div class="taiex-valuation-kpi-value">'+num(earningsBase,0)+' 點</div></div>'+ 
      '<div class="taiex-valuation-kpi"><div class="taiex-valuation-kpi-label">Forward P/E</div><div class="taiex-valuation-kpi-value">'+(taiexNumber(data.forwardPE)!==null?taiexNumber(data.forwardPE).toFixed(1)+'×':'資料暫缺')+'</div></div>'+ 
      '<div class="taiex-valuation-kpi"><div class="taiex-valuation-kpi-label">資料日期</div><div class="taiex-valuation-kpi-value">'+esc(data.indexDate||'資料暫缺')+'</div></div>'+ 
    '</div>'+ 
    '<div class="taiex-valuation-gauge" aria-label="Trailing P/E 估值尺"><div class="taiex-valuation-gauge-marker" '+(gaugePosition==null?'hidden':'style="left:'+gaugePosition.toFixed(2)+'%"')+'></div></div><div class="taiex-valuation-gauge-scale"><span>14× 低估</span><span>18×</span><span>22× 合理</span><span>24×</span><span>30× 高估</span></div><div class="taiex-valuation-gauge-label">目前位置：'+esc(zone.label||'資料暫缺')+'</div>'+ 
    '<div class="taiex-valuation-grid">'+(scenarioCards||'<div class="taiex-valuation-note">Trailing P/E 或 Earnings Base 暫缺，估值情境暫不計算。</div>')+'</div>'+ 
    '<div class="taiex-valuation-columns">'+
      '<div class="taiex-valuation-box"><h4>歷史 P/E 比較</h4><p>目前：'+(pe!==null?pe.toFixed(1)+'×':'資料暫缺')+'</p><p>5年中位數：'+(taiexNumber(history.fiveYear)!==null?taiexNumber(history.fiveYear).toFixed(1)+'×':'資料暫缺')+'</p><p>10年中位數：'+(taiexNumber(history.tenYear)!==null?taiexNumber(history.tenYear).toFixed(1)+'×':'資料暫缺')+'</p><p>20年中位數：'+(taiexNumber(history.twentyYear)!==null?taiexNumber(history.twentyYear).toFixed(1)+'×':'資料暫缺')+'</p><p>歷史百分位：'+pct+'</p></div>'+ 
      '<div class="taiex-valuation-box"><h4>Forward 估值</h4>'+(forwardReady?'<p>2026 Forward Earnings：'+num(data.forwardEarnings2026,2)+'</p><p>Forward Earnings YoY：'+(taiexNumber(data.forwardEarningsYoY)!==null?taiexNumber(data.forwardEarningsYoY).toFixed(1)+'%':'資料暫缺')+'</p>'+forwardCards:'<p>Forward Earnings：資料暫缺</p><p>不以 Trailing Earnings 代替。</p>')+'</div>'+ 
      '<div class="taiex-valuation-box"><h4>市場集中度</h4><p>台積電權重：'+(taiexNumber(concentration.tsmc)!==null?taiexNumber(concentration.tsmc).toFixed(2)+'%':'資料暫缺')+'</p><p>前5大：'+(taiexNumber(concentration.top5)!==null?taiexNumber(concentration.top5).toFixed(2)+'%':'資料暫缺')+'</p><p>前10大：'+(taiexNumber(concentration.top10)!==null?taiexNumber(concentration.top10).toFixed(2)+'%':'資料暫缺')+'</p><p>半導體：'+(taiexNumber(concentration.semiconductor)!==null?taiexNumber(concentration.semiconductor).toFixed(2)+'%':'資料暫缺')+'</p></div>'+ 
    '</div>'+ 
    '<div class="taiex-valuation-note">'+esc(summary)+'</div>'+ 
    '<div class="taiex-valuation-meta">指數來源：'+esc(data.indexSource||'資料暫缺')+' · 估值來源：'+esc(data.source||'資料暫缺')+' · 更新：'+esc(data.updatedAt||'資料暫缺')+'</div>'+ 
    (data.sourceUrl?'<div class="taiex-valuation-source">來源：<a href="'+esc(data.sourceUrl)+'" target="_blank" rel="noopener">'+esc(data.sourceUrl)+'</a></div>':'<div class="taiex-valuation-source">估值來源網址尚未填入；缺少可靠資料時不自行代填。</div>')+ 
  '</section>';
}
function renderBattleBrief(data,el){
  data=data||{};
  var summary=data.summary||{};
  var holdings=(data.holdings||[]);
  battleFinanceSnapshotState.liveFunds=Array.isArray(data.funds)?data.funds:[];
  battleBriefHoldings=holdings;
  var etfHoldingChange=data.etfHoldingChange||{};
  el.innerHTML=`<div class="battle-report-head">
    <div>
      <div class="battle-report-title">戰情總匯報</div>
      <div class="battle-report-date">日期 ${esc(data.date||'--')} · 更新 ${esc(data.updatedAt||'--')} · ${esc(summary.storageMode||'今日／昨日比較')}</div>
    </div>
    <div class="battle-kpis">
      <span class="battle-kpi">${esc(summary.marketStance||'觀望')}</span>
      <span class="battle-kpi up">上漲 ${esc(summary.upCount||0)}</span>
      <span class="battle-kpi down">下跌 ${esc(summary.downCount||0)}</span>
      <button class="battle-report-refresh" type="button" onclick="loadBattleBrief(true)">重新整理</button>
    </div>
  </div>
  ${battleReviewSummaryHtml(data)}
  ${renderQqqDynamicValuation(data.qqqValuation)}
  ${renderTaiexDynamicValuation(data.taiexValuation)}
  <div class="battle-report-grid">
    ${battleEtfChangeHtml(etfHoldingChange).replace('class="battle-section wide"','id="battle-review-etf" class="battle-section wide"')}
    <div class="battle-section">
      <div class="battle-section-title">基金淨值</div>
      <div id="battle-fund-snapshot-host"></div>
      <div id="battle-holdings-left-snapshot-host"></div>
    </div>
    <div class="battle-section">
      <div class="battle-section-title">台股融資與維持率</div>
      <div id="battle-margin-snapshot-host"></div>
      <div id="battle-holdings-right-snapshot-host"></div>
    </div>
  </div>`;
  // 戰情只讀固定排程更新的最新值，不再於開啟頁面時讀取 NAS 歷史快照。
  var fundHost=document.getElementById('battle-fund-snapshot-host');
  var marginHost=document.getElementById('battle-margin-snapshot-host');
  var holdingsLeftHost=document.getElementById('battle-holdings-left-snapshot-host');
  var holdingsRightHost=document.getElementById('battle-holdings-right-snapshot-host');
  if(fundHost)fundHost.innerHTML=battleLiveFundSnapshotHtml(data.funds);
  if(marginHost)marginHost.innerHTML=battleLiveMarketSnapshotHtml(data.market);
  if(holdingsLeftHost)holdingsLeftHost.innerHTML=battleLiveHoldingSnapshotHtml(data.holdings,'left');
  if(holdingsRightHost)holdingsRightHost.innerHTML=battleLiveHoldingSnapshotHtml(data.holdings,'right');
}

async function loadBattleBrief(force){
  var el=document.getElementById('battle-brief-content');
  if(!el)return null;
  if(!API_URL){
    el.innerHTML=setupNotice();
    setCouncilPanelStatusIfActive('err','尚未設定 API');
    return null;
  }
  var cachedEntry=readMarketCacheEntry(BATTLE_BRIEF_CACHE_KEY,false);
  var cached=cachedEntry?cachedEntry.data:null;
  if(cached&&!el.querySelector('.battle-report-head')){
    setDataFreshness('battle-freshness',dataFreshnessMeta(cached,cachedEntry.savedAt,true));
    renderBattleBrief(cached,el);
  }
  if(cached&&!force){
    setCouncilPanelStatusIfActive('ok','戰情總匯報快取已載入');
    return Promise.resolve(cached);
  }
  setCouncilPanelStatusIfActive('pending',cached&&!force?'戰情快取更新中':'戰情總匯報讀取中');
  if(!battleBriefPromise)battleBriefPromise=apiGet({action:'battleBrief'},45000).finally(function(){battleBriefPromise=null;});
  var warning=el.querySelector('.battle-refresh-warning');
  if(warning)warning.remove();
  el.querySelectorAll('.battle-report-refresh').forEach(function(button){button.disabled=true;});
  return battleBriefPromise.then(function(data){
    if(!data)throw new Error('戰情總匯報暫時無法更新');
    writeTimedMarketCache(BATTLE_BRIEF_CACHE_KEY,data);
    if(document.getElementById('battle-brief-content')!==el)return data;
    setDataFreshness('battle-freshness',dataFreshnessMeta(data,false,false));
    renderBattleBrief(data,el);
    setCouncilPanelStatusIfActive('ok','戰情總匯報已更新');
    return data;
  }).catch(function(e){
    if(document.getElementById('battle-brief-content')!==el)return null;
    var retained=!!el.querySelector('.battle-report-head');
    var oldWarning=el.querySelector('.battle-refresh-warning');
    if(oldWarning)oldWarning.remove();
    var message='<div class="battle-refresh-warning" role="status">'+(retained?'更新失敗，保留上次成功資料。':'戰情總匯報讀取失敗。')+esc(e.message||'請稍後再試')+'</div>';
    if(retained)el.insertAdjacentHTML('afterbegin',message);
    else el.innerHTML=message+'<button class="battle-report-refresh" type="button" onclick="loadBattleBrief(true)">重試</button>';
    setCouncilPanelStatusIfActive('err',retained?'更新失敗，顯示上次戰情':'戰情總匯報讀取失敗');
    return null;
  }).finally(function(){
    el.querySelectorAll('.battle-report-refresh').forEach(function(button){button.disabled=false;});
  });
}

window.MilitaryModuleLoaded={name:'military',version:'20260929-v1'};
