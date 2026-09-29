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

function renderCouncilPanel(initialTab){
  setPanelHead('📜','War Room · Command','軍機處');
  var panelExtra=document.getElementById('p-extra');
  if(panelExtra)panelExtra.innerHTML='';
  setEmpireCardApiPendingStatus('council');
  setPanelMenuTabs([
    {key:'battle-brief',label:'戰情總匯報'},
    {key:'council-roster',label:'部隊陣容'},
    {key:'market-watch',label:'產業輪動'},
    {key:'macro-overview',label:'美股總經'},
    {key:'taiwan-macro',label:'台灣總體經濟'},
    {key:'external-intelligence',label:'外部情報'}
  ]);
  var targetTab=['battle-brief','council-roster','market-watch','macro-overview','taiwan-macro','external-intelligence'].indexOf(initialTab)>=0?initialTab:'battle-brief';
  currentTab=targetTab;
  var apiReady=hasMainApiCredentials();
  var lockedNotice=setupNotice();
  document.getElementById('p-body').innerHTML=`
    <div class="pane ${targetTab==='battle-brief'?'active':''}" id="pane-battle-brief">
      <div id="battle-freshness">${dataFreshnessHtml()}</div>
      <div id="battle-brief-content"><div class="skel-line skel"></div><div class="skel-line skel" style="width:82%"></div><div class="skel-line skel" style="width:68%"></div></div>
    </div>
    <div class="pane ${targetTab==='council-roster'?'active':''}" id="pane-council-roster">
      <div id="council-roster-freshness">${dataFreshnessHtml()}</div>
      <div id="council-content">${apiReady?'':lockedNotice}</div>
    </div>
    <div class="pane ${targetTab==='market-watch'?'active':''}" id="pane-market-watch">
      <div class="market-sector-rotation"><div class="sec-title">產業輪動</div><div id="market-sector-rotation-body"><div class="market-sector-meta">產業輪動快照讀取中…</div></div></div>
    </div>
    <div class="pane ${targetTab==='macro-overview'?'active':''}" id="pane-macro-overview">
      <div id="macro-freshness">${dataFreshnessHtml()}</div>
      <div id="macro-content"><div class="skel-line skel"></div><div class="skel-line skel" style="width:82%"></div><div class="skel-line skel" style="width:68%"></div></div>
    </div>
    <div class="pane ${targetTab==='taiwan-macro'?'active':''}" id="pane-taiwan-macro">
      <div id="taiwan-macro-content"><div class="skel-line skel"></div><div class="skel-line skel" style="width:82%"></div><div class="skel-line skel" style="width:68%"></div></div>
    </div>
    <div class="pane ${targetTab==='external-intelligence'?'active':''}" id="pane-external-intelligence">
      <div class="api-bar"><div class="api-dot pending" id="intelligence-dot"></div><span class="api-label" id="intelligence-label">載入外部情報…</span></div>
      <div id="intelligence-content"><div class="skel-line skel"></div><div class="skel-line skel" style="width:82%"></div><div class="skel-line skel" style="width:68%"></div></div>
    </div>
    <div class="pane" id="pane-council-task">
      ${renderRetiredTaskNotice()}
    </div>`;
  var initialButton=document.querySelector('.ptab[onclick*="'+targetTab+'"]');
  if(initialButton)initialButton.classList.add('active');
  var initialMenuItem=document.querySelector('.panel-menu-item[data-panel-tab="'+targetTab+'"]');
  if(initialMenuItem)initialMenuItem.classList.add('active');
  if(apiReady){
    if(targetTab==='battle-brief')loadBattleBrief();
    else if(targetTab==='council-roster')loadCouncilDashboard();
    else if(targetTab==='market-watch')loadMarketSectorRotation();
    else if(targetTab==='macro-overview')loadMacroOverview();
    else if(targetTab==='taiwan-macro')loadTaiwanMacro();
    else if(targetTab==='external-intelligence')loadExternalIntelligence();
  }
}

function cacheCouncilDashboardResults(results){
  results=results||{};
  councilDashboardCache={
    heroes:results.heroes||[],
    holdings:results.holdings||[],
    assetSnapshot:results.assetSnapshot||null,
    dividendProjection:results.dividendProjection||null,
    holdingsLoaded:results.holdingsLoaded
  };
  councilDashboardFetchedAt=Date.now();
  holdingsCache=results.holdings&&results.holdings.length?results.holdings:holdingsCache;
  writeCouncilRosterStorageCache(councilDashboardCache);
  return councilDashboardCache;
}

async function loadCouncilDashboard(){
  var el=document.getElementById('council-content');
  if(!el)return;
  if(!hasMainApiCredentials()&&!arkWallReadToken()){
    el.innerHTML=setupNotice();
    var dot=document.getElementById('council-dot');
    var lbl=document.getElementById('council-label');
    if(dot)dot.className='api-dot err';
    if(lbl)lbl.textContent='尚未設定 API';
    setEmpireCardStatus('council','err','尚未設定 API');
    return;
  }
  var cached=councilDashboardCache||readCouncilRosterStorageCache();
  if(!councilDashboardCache&&cached)councilDashboardCache=cached;
  var cachedFetchedAt=councilDashboardFetchedAt||(cached&&cached.cachedAt)||0;
  var cacheFresh=cached&&(Date.now()-cachedFetchedAt<COUNCIL_DASHBOARD_CACHE_TTL);
  if(cached){
    holdingsCache=cached.holdings.length?cached.holdings:holdingsCache;
    setDataFreshness('council-roster-freshness',dataFreshnessMeta(cached,cachedFetchedAt,true));
    renderCouncilRoster(mergeCouncilRows(cached.holdings,cached.heroes,{}),el,cached.assetSnapshot,cached.dividendProjection);
    setEmpireCardStatus('council','pending',cacheFresh&&cached.holdingsLoaded&&API_URL?'已顯示快取 · 背景更新中':'已顯示上次資料 · 背景更新中');
  }else{
    el.innerHTML='<div class="skel-line skel"></div><div class="skel-line skel" style="width:82%"></div><div class="skel-line skel" style="width:70%"></div>';
  }
  if(!cacheFresh)setEmpireCardStatus('council','pending',cached?'已顯示上次資料 · 背景更新中':'部隊陣容讀取中');
  try{
    var results=await loadCouncilDashboardData();
    var heroes=results.heroes;
    var holdings=results.holdings;
    var armySettings={};
    // 持股與武將是首屏必要資料；摘要資料沿用快取，稍後獨立背景更新。
    var assetSnapshot=(councilDashboardCache&&councilDashboardCache.assetSnapshot)||results.assetSnapshot||null;
    var dividendProjection=(councilDashboardCache&&councilDashboardCache.dividendProjection)||results.dividendProjection||null;
    if(results.holdingsLoaded)cacheCouncilDashboardResults(Object.assign({},results,{assetSnapshot:assetSnapshot,dividendProjection:dividendProjection}));
    setDataFreshness('council-roster-freshness',dataFreshnessMeta(results,councilDashboardFetchedAt,false));
    var hasRosterData=results.holdingsLoaded&&holdings.length;
    var fallbackCache=!hasRosterData&&councilDashboardCache&&councilDashboardCache.holdings&&councilDashboardCache.holdings.length;
    renderCouncilRoster(mergeCouncilRows(fallbackCache?councilDashboardCache.holdings:holdings,fallbackCache?councilDashboardCache.heroes:heroes,armySettings),el,fallbackCache?councilDashboardCache.assetSnapshot:assetSnapshot,fallbackCache?councilDashboardCache.dividendProjection:dividendProjection);
    var dot=document.getElementById('council-dot');
    var lbl=document.getElementById('council-label');
    var rosterConnected=results.holdingsLoaded&&(API_URL||results.source==='NAS');
    if(dot)dot.className='api-dot '+(rosterConnected?'ok':'err');
    if(lbl)lbl.textContent=rosterConnected?(results.source==='NAS'?'NAS 快取 · 武將與持股同步':'已連線 · 武將與持股同步'):'已載入武將資料 · 尚未連接資料來源';
    setEmpireCardStatus('council',rosterConnected?'ok':'err',rosterConnected?(results.source==='NAS'?'NAS 快取已載入':'武將與持股同步'):'尚未連接資料來源');
    // 月總配息與日漲跌不再阻塞首屏；完成後只重繪摘要區與更新摘要快取。
    loadCouncilDashboardSummaryData().then(function(summary){
      if(!summary)return;
      var currentCache=councilDashboardCache||{};
      var summarySnapshot=summary.assetSnapshot||currentCache.assetSnapshot||null;
      var summaryProjection=summary.dividendProjection||currentCache.dividendProjection||null;
      if(results.holdingsLoaded){
        cacheCouncilDashboardResults({
          heroes:currentCache.heroes||heroes,
          holdings:currentCache.holdings||holdings,
          assetSnapshot:summarySnapshot,
          dividendProjection:summaryProjection,
          holdingsLoaded:true
        });
      }
      if(el.isConnected){
        var latestRows=mergeCouncilRows((currentCache.holdings&&currentCache.holdings.length?currentCache.holdings:holdings),(currentCache.heroes&&currentCache.heroes.length?currentCache.heroes:heroes),armySettings);
        renderCouncilRoster(latestRows,el,summarySnapshot,summaryProjection);
      }
    }).catch(function(error){
      console.warn('council summary background refresh failed:',error);
      // 首屏持股已可用時，摘要失敗不覆蓋部隊陣容，也不把狀態改成整體失敗。
    });
  }catch(e){
    setEmpireCardStatus('council','err',e.message||'讀取失敗');
    el.innerHTML=`<div style="color:var(--coral);font-family:var(--sans);font-size:12px;padding:12px 0">${esc(e.message)}</div>`;
  }
}

function loadCouncilDashboardData(){
  if(councilDashboardPromise)return councilDashboardPromise;
  councilDashboardPromise=Promise.resolve().then(function(){
    return loadCouncilRosterFromNas_().then(function(nas){
      if(nas)return {nas:nas};
      return Promise.allSettled([loadHeroSheet(),loadCouncilHoldingsOverview()]);
    });
  }).then(function(results){
      if(results&&results.nas)return results.nas;
      // 龐統城門已在進入卡片前完成驗證；資料載入失敗時只顯示卡片錯誤，
      // 不再由軍機處自行觸發第二次驗證，避免手機端長時間卡在驗證中。
      return results;
    }).then(function(results){
      // NAS 優先路徑已經是整理好的資料物件；Google fallback 才是 allSettled 陣列。
      // 兩者都要在這裡正規化，避免直接讀取不存在的 results[0].status。
      if(results&&!Array.isArray(results))return results;
      return {
        heroes:results[0].status==='fulfilled'?results[0].value:[],
        holdings:results[1].status==='fulfilled'?(results[1].value||[]):[],
        holdingsLoaded:results[1].status==='fulfilled'
      };
    }).finally(function(){
      councilDashboardPromise=null;
    });
  return councilDashboardPromise;
}

function loadCouncilDashboardSummaryData(){
  if(councilDashboardSummaryPromise)return councilDashboardSummaryPromise;
  councilDashboardSummaryPromise=Promise.allSettled([
    loadAssetSnapshotFromNas_().then(function(nas){return nas||loadAssetSnapshot();})
  ]).then(function(results){
    return {
      assetSnapshot:results[0].status==='fulfilled'?results[0].value:null,
      // 月總配息主值已由 holdingsOverview 的月配息欄位加總；
      // NAS 資產快照中的 latest.monthlyDiv 作為摘要備援，不再額外阻塞一支 Google Sheet 請求。
      dividendProjection:null
    };
  }).finally(function(){
    councilDashboardSummaryPromise=null;
  });
  return councilDashboardSummaryPromise;
}

function renderRetiredTaskNotice(){
  return `<div class="advisor-task-card">
    <div class="advisor-task-note">\u8ecd\u5e2b\u5de5\u55ae\u6d41\u7a0b\u5df2\u505c\u7528\u3002\u6b64\u9801\u4e0d\u518d\u5efa\u7acb\u6216\u5beb\u5165 Google Sheet \u7684\u300c\u8ecd\u5e2b\u5de5\u55ae\u300d\u5206\u9801\u3002</div>
  </div>`;
}

function resetRetiredTaskStatus(){
  // Advisor task intake is retired; keep this hook harmless for tab switching.
}

async function loadHeroSheet(force){
  if(!hasMainApiCredentials())return [];
  if(!force&&heroCache.length)return heroCache;
  var rows=await apiGet({action:'heroes'});
  heroCache=rows.map(normalizeHeroRow).filter(function(h){return h.symbol&&h.enabled;}).sort(function(a,b){return a.sortOrder-b.sortOrder;});
  return heroCache;
}

function normalizeHeroRow(row){
  return {
    symbol:normalizeKey(row['代號']),
    assetName:String(row['資產名稱']||''),
    heroName:String(row['武將名稱']||''),
    heroType:String(row['武將定位']||''),
    riskLevel:String(row['風險屬性']||''),
    icon:String(row['小圖示']||''),
    avatarUrl:String(row['頭像URL']||''),
    skill1Name:String(row['技能名稱']||row['技能1名稱']||''),
    skill1Desc:String(row['技能描述']||row['技能1描述']||''),
    accentColor:String(row['顏色主色']||'#B8892E'),
    enabled:String(row['啟用']).toUpperCase()!=='FALSE',
    sortOrder:parseFloat(row['排序'])||999
  };
}

function collectCouncilKeys(values){
  var seen={};
  var keys=[];
  (values||[]).forEach(function(value){
    var key=normalizeKey(value);
    if(!key||seen[key])return;
    seen[key]=true;
    keys.push(key);
  });
  return keys;
}

function mergeCouncilRows(holdings,heroes,armySettings){
  var holdingsByKey={};
  var aliasToKey={};
  (holdings||[]).filter(function(r){
    return !isRetiredHoldingSymbol(r&& (r.symbol||r.name||r.assetName||r.account));
  }).forEach(function(r,idx){
    var keys=collectCouncilKeys([r.symbol,r.name,r.assetName,r.account]);
    var canonicalKey=keys[0]||('holding-'+idx);
    var extra=(armySettings&&armySettings[canonicalKey])||{};
    var holding=Object.assign({},r,{
      formationDate:r.formationDate||extra.formationDate||'',
      elapsedDays:r.elapsedDays||extra.elapsedDays||'',
      yuanPerDay:r.yuanPerDay||extra.yuanPerDay||''
    });
    holdingsByKey[canonicalKey]=holding;
    keys.forEach(function(key){
      aliasToKey[key]=canonicalKey;
    });
  });
  var used={};
  var rows=(heroes||[]).filter(function(hero){
    return !isRetiredHoldingSymbol(hero&& (hero.symbol||hero.assetName||hero.heroName));
  }).map(function(hero){
    var heroKeys=collectCouncilKeys([hero.symbol,hero.assetName,hero.heroName]);
    var canonicalKey='';
    for(var i=0;i<heroKeys.length;i++){
      if(aliasToKey[heroKeys[i]]){
        canonicalKey=aliasToKey[heroKeys[i]];
        break;
      }
    }
    var h=canonicalKey?holdingsByKey[canonicalKey]:null;
    if(canonicalKey)used[canonicalKey]=true;
    return Object.assign({},hero,{holding:h});
  });
  Object.keys(holdingsByKey).forEach(function(k){
    if(used[k])return;
    rows.push({symbol:k,heroName:holdingMeta(k,k).name,heroType:'未編制',riskLevel:'待設定',icon:holdingMeta(k,k).emoji,accentColor:'#B8892E',sortOrder:999,holding:holdingsByKey[k]});
  });
  return rows;
}

function snapshotMarketValue(snapshot,fallbackValue){
  var latest=snapshot&&snapshot.latest;
  var value=latest&&(latest.investmentMarketValue!=null?latest.investmentMarketValue:latest.marketValue);
  value=Number(value);
  if(!isNaN(value)&&isFinite(value)&&value>0)return value;
  return fallbackValue;
}

function renderCouncilMarketDelta(snapshot){
  var latest=snapshot&&snapshot.latest;
  var previous=snapshot&&snapshot.previous;
  if(!latest||!previous){
    return '<div class="council-stat-delta flat">日漲跌 --%</div><div class="council-stat-note">較昨 --</div>';
  }
  var latestValue=Number(latest.investmentMarketValue!=null?latest.investmentMarketValue:latest.marketValue);
  var previousValue=Number(previous.investmentMarketValue!=null?previous.investmentMarketValue:previous.marketValue);
  if(isNaN(latestValue)||isNaN(previousValue)||!isFinite(latestValue)||!isFinite(previousValue)||previousValue===0){
    return '<div class="council-stat-delta flat">日漲跌 --%</div><div class="council-stat-note">較昨 --</div>';
  }
  var diff=latestValue-previousValue;
  var pct=diff/previousValue*100;
  var tone=diff>0?'up':(diff<0?'down':'flat');
  var arrow=diff>0?'▲':(diff<0?'▼':'');
  var verb=diff>0?'增':(diff<0?'減':'持平');
  var pctText=(diff>0?'+':'')+pct.toFixed(2)+'%';
  var amountText=diff===0?'$0':fmtFull(Math.abs(diff));
  return `<div class="council-stat-delta ${tone}">日漲跌 ${pctText}${arrow?' '+arrow:''}</div><div class="council-stat-note">較昨${verb} ${amountText}</div>`;
}

function renderCouncilMonthlyDividendHtml(totalMonthly,projection){
  var base=Number(totalMonthly);
  if(!isFinite(base))base=0;
  var roughEstimate=base+6500;
  return '月總配息 '+fmtFull(base)+'<span class="council-stat-trial">（粗估 '+fmtFull(roughEstimate)+'）</span>';
}

// Council review: comparable holdings, explicit missing values, no extra requests.
var councilReviewMode='cards',councilReviewSort='marketValue',councilReviewContext=null;
function councilReviewNumber(value){
  if(value==null||typeof value==='boolean'||String(value).trim()==='')return null;
  var number=Number(value);return Number.isFinite(number)?number:null;
}
function councilReviewSigned(value,suffix){
  var number=councilReviewNumber(value);
  return number===null?'—':(number>0?'+':'')+number.toFixed(2)+(suffix||'');
}
function setCouncilReview(mode,sort){
  if(mode==='cards'||mode==='compare')councilReviewMode=mode;
  if(['marketValue','weight','returnPct','monthlyDiv'].indexOf(sort)>=0)councilReviewSort=sort;
  var ctx=councilReviewContext;
  if(ctx&&ctx.el.isConnected)renderCouncilRoster(ctx.rows,ctx.el,ctx.snapshot,ctx.projection);
}
function councilReviewDetail(index){
  var ctx=councilReviewContext,host=document.getElementById('council-review-detail');
  if(!ctx||!host||!ctx.rows[index])return;
  host.innerHTML='<button type="button" class="battle-report-refresh" onclick="this.parentElement.hidden=true">收合詳情</button>'+renderHeroCard(ctx.rows[index],ctx.totalCost);
  host.hidden=false;host.focus();host.scrollIntoView({block:'nearest'});
}
function councilComparisonHtml(rows){
  var items=rows.map(function(row,index){
    var h=row.holding;if(!h)return null;
    var cost=councilReviewNumber(h.cost),ret=councilReviewNumber(h.totalReturn);
    return {row:row,index:index,marketValue:councilReviewNumber(h.marketValue),monthlyDiv:councilReviewNumber(h.monthlyDiv),returnPct:cost!==null&&cost>0&&ret!==null?ret/cost*100:null};
  }).filter(Boolean);
  var complete=items.every(function(item){return item.marketValue!==null&&item.marketValue>=0;});
  var total=items.reduce(function(sum,item){return sum+(item.marketValue||0);},0);
  items.forEach(function(item){item.weight=complete&&total>0?item.marketValue/total*100:null;});
  items.sort(function(a,b){var x=a[councilReviewSort],y=b[councilReviewSort];return x===null?(y===null?a.index-b.index:1):y===null?-1:y-x||a.index-b.index;});
  var money=function(value){return value===null?'—':esc(fmtFull(value));};
  return '<div class="council-review-note">市值占比以本表持股市值合計計算；含息報酬率＝含息報酬 ÷ 投資成本。月配息為參考值，非實際入帳。'+(!complete?' 市值資料不全，暫不計算占比。':'')+'</div><div class="council-review-scroll" tabindex="0" aria-label="持股比較表，可左右捲動"><table class="council-review-table"><thead><tr><th scope="col">標的／資料日</th><th scope="col">市值</th><th scope="col">市值占比</th><th scope="col">含息報酬率</th><th scope="col">月配息參考</th></tr></thead><tbody>'+items.map(function(item){
    var h=item.row.holding,symbol=h.symbol||h.name||item.row.symbol||'未命名';
    return '<tr><th scope="row"><button type="button" onclick="councilReviewDetail('+item.index+')">'+esc(symbol)+'</button><small>'+esc(h.dataDate||'資料日未提供')+'</small></th><td>'+money(item.marketValue)+'</td><td>'+(item.weight===null?'—':item.weight.toFixed(1)+'%')+'</td><td>'+councilReviewSigned(item.returnPct,'%')+'</td><td>'+money(item.monthlyDiv)+'</td></tr>';
  }).join('')+(items.length?'':'<tr><td colspan="5">目前沒有持股資料</td></tr>')+'</tbody></table></div><div id="council-review-detail" tabindex="-1" hidden></div>';
}
function renderCouncilRoster(rows,el,assetSnapshot,dividendProjection){
  var active=rows.filter(function(r){return r.holding||r.enabled;});
  var holdings=active.filter(function(r){return r.holding;}).map(function(r){return r.holding;});
  var totalCost=holdings.reduce(function(s,r){return s+toNum(r.cost);},0);
  var holdingsMarket=holdings.reduce(function(s,r){return s+toNum(r.marketValue);},0);
  var totalMarket=snapshotMarketValue(assetSnapshot,holdingsMarket);
  var snapshotDate=latestSnapshotShortDate(assetSnapshot);
  var snapshotDateBadge=snapshotDate?`<span class="council-snapshot-date">${esc(snapshotDate)}</span>`:'';
  var totalMonthly=holdings.reduce(function(s,r){return s+toNum(r.monthlyDiv);},0);
  var totalReturn=holdings.reduce(function(s,r){return s+toNum(r.totalReturn);},0);
  councilReviewContext={rows:rows,el:el,snapshot:assetSnapshot,projection:dividendProjection,totalCost:totalCost};
  el.innerHTML=`
    <div class="council-summary">
      <div class="council-stat"><div class="council-stat-l">持有數</div><div class="council-stat-v">${holdings.length||active.length} 檔</div><div class="council-stat-sub">${renderCouncilMonthlyDividendHtml(totalMonthly,dividendProjection)}</div></div>
      <div class="council-stat"><div class="council-stat-l">總投資成本</div><div class="council-stat-v">${fmtFull(totalCost)}</div><div class="council-stat-sub ${totalReturn>=0?'up':'down'}">含息報酬 ${totalReturn>=0?'+':'-'}${fmtFull(Math.abs(totalReturn))}</div></div>
      <div class="council-stat"><div class="council-stat-l council-stat-label-row"><span>投資市值</span>${snapshotDateBadge}</div><div class="council-stat-v">${fmtFull(totalMarket)}</div>${renderCouncilMarketDelta(assetSnapshot)}</div>
    </div>
    <div class="council-review-toolbar"><span class="council-army-title">軍團檢閱</span><button type="button" class="battle-report-refresh" aria-pressed="${councilReviewMode==='cards'}" onclick="setCouncilReview('cards')">武將卡片</button><button type="button" class="battle-report-refresh" aria-pressed="${councilReviewMode==='compare'}" onclick="setCouncilReview('compare')">精簡比較</button>${councilReviewMode==='compare'?'<label>排序 <select aria-label="持股比較排序" onchange="setCouncilReview(undefined,this.value)">'+[['marketValue','市值高至低'],['weight','占比高至低'],['returnPct','報酬率高至低'],['monthlyDiv','月配息高至低']].map(function(option){return '<option value="'+option[0]+'"'+(councilReviewSort===option[0]?' selected':'')+'>'+option[1]+'</option>';}).join('')+'</select></label>':''}</div>
    ${councilReviewMode==='compare'?councilComparisonHtml(rows):renderCouncilRosterGroups(active,totalCost)}`;
}

function councilRosterGroups(){
  return [
    {label:'\u6307\u6578\u6210\u9577\u578b',keys:['QQQI','SPYI','00997A','國泰高股息B','路博邁台灣5G'],aliases:['QQQI','SPYI','00997A','國泰高股息','路博邁台灣5G','5G'],order:['QQQI','00997A','國泰高股息B','路博邁台灣5G','SPYI']},
    {label:'\u671f\u6b0a\u6536\u76ca\u578b',keys:['CHPY','AIPI','PLTY'],aliases:['CHPY','AIPI','PLTY'],order:['PLTY','AIPI','CHPY']},
    {label:'\u9632\u79a6\u6536\u76ca\u578b',keys:['00985B','IAU','GDXW','GLDW','MLPI','00998A','施羅德收益成長A2'],aliases:['00985B','IAU','GDXW','GLDW','MLPI','00998A','施羅德','收益成長','A2'],order:['00985B','施羅德收益成長A2','MLPI','00998A','IAU','GDXW','GLDW']}
  ];
}

function councilRowKeys(row){
  var h=row&&row.holding||{};
  return collectCouncilKeys([row&&row.symbol,row&&row.assetName,row&&row.heroName,h.symbol,h.name,h.assetName,h.account]);
}

function councilRowText(row){
  var h=row&&row.holding||{};
  return [row&&row.symbol,row&&row.assetName,row&&row.heroName,h.symbol,h.name,h.assetName,h.account].join(' ');
}

function councilRowInGroup(row,group){
  var keys=councilRowKeys(row);
  var wanted=(group.keys||[]).map(normalizeKey);
  if(keys.some(function(key){return wanted.indexOf(key)>=0;}))return true;
  var text=councilRowText(row);
  return (group.aliases||[]).some(function(alias){return alias&&text.indexOf(alias)>=0;});
}

function renderCouncilRosterGroups(active,totalCost){
  var used=[];
  var groups=councilRosterGroups().map(function(group){
    var rows=(active||[]).filter(function(row){
      if(used.indexOf(row)>=0)return false;
      return councilRowInGroup(row,group);
    });
    rows=sortCouncilRosterRows(rows,group);
    rows.forEach(function(row){used.push(row);});
    return Object.assign({},group,{rows:rows});
  });
  groups.forEach(function(group){
    if(!group.useRemaining)return;
    var existing=group.rows||[];
    (active||[]).forEach(function(row){
      if(used.indexOf(row)>=0)return;
      existing.push(row);
      used.push(row);
    });
    group.rows=existing;
  });
  return `<div class="council-roster-groups">
    ${groups.map(function(group){return renderCouncilRosterGroup(group,totalCost);}).join('')}
  </div>`;
}

function sortCouncilRosterRows(rows,group){
  var order=(group&&group.order||[]).map(normalizeKey);
  if(!order.length)return rows;
  return (rows||[]).slice().sort(function(a,b){
    var aKey=councilRowKeys(a).find(function(key){return order.indexOf(key)>=0;});
    var bKey=councilRowKeys(b).find(function(key){return order.indexOf(key)>=0;});
    var ai=aKey?order.indexOf(aKey):999;
    var bi=bKey?order.indexOf(bKey):999;
    if(ai!==bi)return ai-bi;
    return (Number(a.sortOrder)||999)-(Number(b.sortOrder)||999);
  });
}

function renderCouncilRosterGroup(group,totalCost){
  var rows=group.rows||[];
  var holdings=rows.filter(function(row){return row.holding;}).map(function(row){return row.holding;});
  var market=holdings.reduce(function(s,row){return s+toNum(row.marketValue);},0);
  var cost=holdings.reduce(function(s,row){return s+toNum(row.cost);},0);
  var costPct=totalCost>0?cost/totalCost*100:0;
  return `<div class="council-roster-group">
    <div>
      <div class="council-roster-head">
        <div class="council-roster-label">${esc(group.label)} <span class="council-roster-metrics">🪙${fmtFull(market)} 🧾${costPct.toFixed(1)}%</span></div>
        <div class="council-roster-count">${rows.length} \u6a94</div>
      </div>
      <div class="council-roster">
        ${rows.length?rows.map(function(row){return renderHeroCard(row,totalCost);}).join(''):'<div class="hero-add"><div><div class="hero-add-plus">+</div><div style="font-weight:800;color:#a89060;margin-bottom:4px">\u5c1a\u7121\u7de8\u5236</div><div style="font-size:11px">\u7b49\u5f85\u8cc7\u6599\u4f86\u6e90\u88dc\u9f4a</div></div></div>'}
      </div>
    </div>
  </div>`;
}

function renderCouncilPantry(items){
  items=(items||[]).filter(function(item){return item&&item.label&&item.displayValue;});
  if(!items.length)return '';
  var main=items.find(function(item){return item.type==='currency'||/糧倉|金額/.test(item.label);})||items[0];
  var ratio=items.find(function(item){return item!==main&&(item.type==='percent'||/比例|率/.test(item.label));})||null;
  var extras=items.filter(function(item){return item!==main&&item!==ratio;});
  var ratioPercent=ratio?pantryPercentValue(ratio):0;
  var gaugePct=Math.max(0,Math.min(100,ratioPercent));
  return `<div class="council-pantry">
    <div class="pantry-main">
      <div class="pantry-icon" aria-hidden="true"><span class="pantry-rice"><i></i><i></i><i></i></span></div>
      <div>
        <div class="pantry-label">${esc(main.label)}</div>
        <div class="pantry-value">${esc(main.displayValue)}</div>
      </div>
    </div>
    ${ratio?`<div class="pantry-gauge-wrap">
      <div class="pantry-gauge" style="--pct:${gaugePct.toFixed(1)}%">
        <span class="pantry-gauge-text">${Math.round(ratioPercent)}%</span>
      </div>
      <div>
        <div class="pantry-ratio-label">${esc(ratio.label)}</div>
        <div class="pantry-ratio-value">${esc(ratio.displayValue)}</div>
        <div class="pantry-bar" style="--pct:${gaugePct.toFixed(1)}%"><div class="pantry-bar-fill"></div></div>
      </div>
    </div>`:''}
    ${extras.length?`<div class="pantry-extra">${extras.map(function(item){
      return `<div class="pantry-extra-item">${esc(item.label)}<strong>${esc(item.displayValue)}</strong></div>`;
    }).join('')}</div>`:''}
  </div>`;
}

function pantryPercentValue(item){
  var n=Number(item&&item.value);
  if(!isNaN(n)&&isFinite(n))return Math.abs(n)<=2?n*100:n;
  var text=String(item&&item.displayValue||'').replace(/,/g,'');
  var match=text.match(/-?\d+(?:\.\d+)?/);
  return match?Number(match[0]):0;
}

function gvizCellValue(cell){
  if(!cell)return '';
  if(typeof cell.v==='number')return cell.v;
  if(cell.f!==null&&cell.f!==undefined)return cell.f;
  return cell.v!==null&&cell.v!==undefined?cell.v:'';
}
function gvizCellDisplayValue(cell){
  if(!cell)return '';
  if(cell.f!==null&&cell.f!==undefined)return cell.f;
  return cell.v!==null&&cell.v!==undefined?cell.v:'';
}

function gvizCellSortValue(cell,rowIndex){
  if(cell&&typeof cell.v==='number')return cell.v;
  var value=gvizCellValue(cell);
  var time=new Date(String(value||'').replace(/-/g,'/')).getTime();
  return isNaN(time)?rowIndex:time;
}

function snapshotDateKey(row){
  var raw=String(row&&row.date||'').trim();
  if(!raw)return '';
  var time=new Date(raw.replace(/-/g,'/')).getTime();
  if(isNaN(time))return raw.replace(/\//g,'-');
  var d=new Date(time);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function latestSnapshotShortDate(snapshot){
  var rows=snapshot&&snapshot.rows||[];
  var latest=rows.length?rows[rows.length-1]:null;
  var raw=String(latest&&latest.date||'').trim();
  if(!raw)return '';
  var time=new Date(raw.replace(/-/g,'/')).getTime();
  if(!isNaN(time)){
    var d=new Date(time);
    return (d.getMonth()+1)+'/'+d.getDate();
  }
  var match=raw.match(/(?:\d{4}[\/-])?(\d{1,2})[\/-](\d{1,2})/);
  return match?Number(match[1])+'/'+Number(match[2]):raw;
}

function latestSnapshotBeforeToday(rows){
  var todayKey=today();
  var filtered=(rows||[]).filter(function(row){
    return snapshotDateKey(row)!==todayKey;
  });
  return filtered.length?filtered[filtered.length-1]:null;
}

function percentNum(v){
  var n=toNum(v);
  if(typeof v==='string'&&v.indexOf('%')>=0)return n;
  return Math.abs(n)>0&&Math.abs(n)<=1?n*100:n;
}

function normalizeHoldingOverviewRow(row){
  row=row||{};
  var rawSymbol=row.symbol||row.name||row.assetName||row.account||'';
  var key=normalizeKey(rawSymbol);
  var meta=holdingMeta(key||rawSymbol,stripIconText(rawSymbol));
  return Object.assign({},row,{
    symbol:key||String(rawSymbol||'').trim(),
    name:row.name||meta.name||stripIconText(rawSymbol),
    shares:toNum(row.shares||row.units),
    cost:toNum(row.cost),
    marketValue:toNum(row.marketValue||row.mktVal),
    monthlyDiv:toNum(row.monthlyDiv),
    monthlyDivDisplay:row.monthlyDivDisplay||'',
    totalDiv:toNum(row.totalDiv||row.div),
    unrealized:toNum(row.unrealized),
    totalReturn:toNum(row.totalReturn),
    avgCost:toNum(row.avgCost),
    price:toNum(row.price),
    roi:percentNum(row.roi),
    formationDate:row.formationDate||'',
    elapsedDays:toNum(row.elapsedDays),
    yuanPerDay:toNum(row.yuanPerDay)
  });
}

async function loadMonthlyHoldingsSheet(){
  var rows=await apiGet({action:'holdingsOverview'});
  return (rows||[]).map(normalizeHoldingOverviewRow).filter(function(row){
    return row.symbol&&(row.shares>0||row.cost>0||row.marketValue>0||normalizeKey(row.symbol)==='00997A');
  });
}

async function loadMonthlyDividendProjection(){
  return apiGet({action:'monthlyDividendProjection'});
}

async function loadDailyAssetSnapshotSheet(){
  return apiGet({action:'assetSnapshot'});
}

async function loadCommandMarketSnapshot(){
  return apiGet({action:'assetSnapshot'});
}

async function loadCommandExposureAsset(){
  return apiGet({action:'assetSnapshot'});
}

function buildAssetSnapshotFromCommand(commandLatest,sheetSnapshot){
  var rows=sheetSnapshot&&sheetSnapshot.rows||[];
  var previous=latestSnapshotBeforeToday(rows);
  var dailyChangeAmount=null;
  var dailyChangePct=null;
  var totalAssetChangeAmount=null;
  var totalAssetChangePct=null;
  if(commandLatest&&previous){
    dailyChangeAmount=commandLatest.investmentMarketValue-previous.investmentMarketValue;
    if(previous.investmentMarketValue)dailyChangePct=dailyChangeAmount/previous.investmentMarketValue*100;
    if(commandLatest.totalAssetValue&&previous.totalAssetValue){
      totalAssetChangeAmount=commandLatest.totalAssetValue-previous.totalAssetValue;
      totalAssetChangePct=totalAssetChangeAmount/previous.totalAssetValue*100;
    }
  }
  return {
    sheetName:ASSET_SNAPSHOT_SHEET_NAME,
    rows:rows,
    latest:commandLatest,
    previous:previous,
    latestMarketValue:commandLatest?commandLatest.investmentMarketValue:null,
    previousMarketValue:previous?previous.investmentMarketValue:null,
    dailyChangeAmount:dailyChangeAmount,
    dailyChangePct:dailyChangePct,
    latestTotalAssetValue:commandLatest?commandLatest.totalAssetValue:null,
    previousTotalAssetValue:previous?previous.totalAssetValue:null,
    totalAssetChangeAmount:totalAssetChangeAmount,
    totalAssetChangePct:totalAssetChangePct,
    source:'commandI2'
  };
}

// 部隊陣容先使用輕量靜態頭像；點擊頭像後才延遲載入並播放對應 MP4。
var STATIC_HERO_AVATAR_FILES={
  '龐統':'龐統.webp',
  '張飛':'張飛.webp',
  '黃忠':'黃忠.webp',
  '陸遜':'陸遜.webp',
  '陳群':'陳群.webp',
  '關羽':'關羽.webp',
  '張遼':'張遼.webp',
  '趙雲':'趙雲.webp',
  '孫權':'孫權.webp',
  '諸葛亮':'諸葛亮.webp',
  '呂布':'呂布.webp',
  '荀彧':'荀彧.webp',
  '糜竺':'糜竺.webp',
  '司馬懿':'司馬懿.webp',
  '劉備':'劉備.webp'
};
function staticHeroAvatarUrl(name){
  var file=STATIC_HERO_AVATAR_FILES[String(name||'').trim()];
  return file?'./武將資料/'+encodeURIComponent(file)+'?v=20260919-roster-webp1':'';
}

var STATIC_HOLDING_AVATAR_FILES={
  '00985B':'00985B.webp',
  '00997A':'00997A.webp',
  '00998A':'00998A.webp',
  'AIPI':'AIPI.webp',
  'CHPY':'CHPY.webp',
  'GDXW':'GDXW.webp',
  'GLDW':'GLDW.webp',
  'MLPI':'MLPI.webp',
  'PLTY':'呂布.webp',
  'QQQI':'QQQI.webp',
  '國泰高股息B':'國泰高股息B.webp',
  '施羅德收益成長A2':'施羅德收益成長.webp',
  '路博邁台灣5G':'路博邁台灣5G.webp'
};
function staticHoldingAvatarUrl(symbol,name){
  var key=normalizeKey(symbol||name);
  var file=STATIC_HOLDING_AVATAR_FILES[key];
  if(!file)file=STATIC_HERO_AVATAR_FILES[String(name||'').trim()];
  return file?'./武將資料/'+encodeURIComponent(file)+'?v=20260919-roster-webp1':'';
}

var HOLDING_VIDEO_FILES={
  '00985B':'985B.mp4',
  '00997A':'997A.mp4',
  '00998A':'998A.mp4',
  'AIPI':'AIPI.mp4',
  'CHPY':'CHPY.mp4',
  'GDXW':'GDXW.mp4',
  'GLDW':'GLDW.mp4',
  'MLPI':'MLPI.mp4',
  'PLTY':'PLTY.mp4',
  'QQQI':'QQQI.mp4',
  '國泰高股息B':'國泰高股息B.mp4',
  '施羅德收益成長A2':'施羅德收益成長A2.mp4',
  '路博邁台灣5G':'路博邁台灣5G.mp4'
};
function holdingVideoUrl(symbol,name){
  var key=normalizeKey(symbol||name),file=HOLDING_VIDEO_FILES[key];
  return file?'./部隊陣容/'+encodeURIComponent(file)+'?v=20260920-roster-video1':'';
}

+async function loadExternalIntelligence(force){
  var content=document.getElementById('intelligence-content');
  var label=document.getElementById('intelligence-label');
  var dot=document.getElementById('intelligence-dot');
  if(!content)return;
  var cached=intelligenceCache;
  if(cached&&!force)renderExternalIntelligence(cached);
  if(!arkWallReadToken()&&!arkWallWriteToken()){
    content.innerHTML=setupNotice();
    if(dot)dot.className='api-dot err';
    if(label)label.textContent='尚未設定 NAS 通行令';
    return;
  }
  if(!intelligencePromise||force){
    intelligencePromise=arkWallFetch('/api/intelligence?limit=50').then(function(data){
      intelligenceCache=data;
      intelligenceStatus=data.status||null;
      renderExternalIntelligence(data);
      if(dot)dot.className='api-dot ok';
      if(label)label.textContent='已連線 · '+(data.total||0)+' 則情報';
      return data;
    }).catch(function(e){
      if(dot)dot.className='api-dot err';
      if(label)label.textContent='情報讀取失敗';
      if(!cached)content.innerHTML='<div class="battle-empty" style="color:var(--coral)">外部情報讀取失敗：'+esc(e.message)+'</div>';
      console.warn(e);
    }).finally(function(){intelligencePromise=null;});
  }
  return intelligencePromise;
}

function renderExternalIntelligence(data){
  var content=document.getElementById('intelligence-content');
  if(!content)return;
  var items=Array.isArray(data&&data.items)?data.items:[];
  if(intelligenceFilter)items=items.filter(function(item){return String(item.category||'')===intelligenceFilter;});
  var status=data&&data.status||{};
  var statusText=status.state==='completed'?'最近採集完成':status.state==='completed-with-errors'?'最近採集完成，但有來源失敗':status.state==='running'?'採集中…':'尚未執行採集';
  content.innerHTML=`
    <div class="api-bar"><div class="api-dot ${status.state==='completed'?'ok':status.state==='running'?'pending':'err'}" id="intelligence-status-dot"></div><span class="api-label">${esc(statusText)}${status.finishedAt?' · '+esc(new Date(status.finishedAt).toLocaleString('zh-TW')):''}</span></div>
    <div class="chronicle-toolbar"><select class="chronicle-search" onchange="intelligenceFilter=this.value;renderExternalIntelligence(intelligenceCache)"><option value="">全部分類</option><option value="市場">市場</option><option value="基金">基金</option><option value="總經">總經</option><option value="公司公告">公司公告</option></select><button class="cfg-verify-btn" type="button" onclick="refreshExternalIntelligence()">重新採集</button><span class="chronicle-count">${items.length} 則</span></div>
    <div class="intelligence-list">${items.length?items.map(renderIntelligenceCard).join(''):'<div class="battle-empty">目前沒有情報。請先在 NAS 設定來源並執行採集。</div>'}</div>`;
}

function renderIntelligenceCard(item){
  var sourceUrl=String(item.sourceUrl||'').trim();
  var tags=Array.isArray(item.tags)?item.tags.join(' · '):'';
  var navHtml=Array.isArray(item.navHistory)&&item.navHistory.length?renderIntelligenceNavHistory(item):'';
  return `<article class="battle-section" style="margin-bottom:12px"><div class="battle-section-title">${esc(item.title||'未命名情報')}</div><div style="color:var(--muted);font-size:12px;margin:4px 0 10px">${esc(item.category||'其他')} · ${esc(item.source||'未知來源')} · ${esc(item.publishedAt?new Date(item.publishedAt).toLocaleString('zh-TW'):'時間未知')}</div><div style="white-space:pre-wrap;line-height:1.7">${esc(item.summary||item.content||'')}</div>${navHtml}${tags?`<div style="color:var(--muted);font-size:11px;margin-top:8px">${esc(tags)}</div>`:''}<div class="chronicle-entry-actions" style="margin-top:10px"><a class="cfg-verify-btn" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">查看原文</a><button class="cfg-verify-btn" type="button" onclick="addIntelligenceToChronicle(${JSON.stringify(item.id||'')})">加入事件編年</button></div></article>`;
}

function renderIntelligenceNavHistory(item){
  var rows=(item.navHistory||[]).filter(function(row){return row&&Number.isFinite(Number(row.nav));}).slice(0,30);
  if(!rows.length)return '';
  var values=rows.map(function(row){return Number(row.nav);});
  var min=Math.min.apply(Math,values),max=Math.max.apply(Math,values),span=max-min||1;
  var points=rows.slice().reverse().map(function(row,index){
    var x=4+(index*292/Math.max(1,rows.length-1));
    var y=56-((Number(row.nav)-min)/span*48);
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  var latest=rows[0];
  var table=rows.map(function(row){return `<tr><td>${esc(row.date)}</td><td>${Number(row.nav).toFixed(2)}</td><td>${row.change==null?'--':Number(row.change).toFixed(2)}</td><td>${row.changePct==null?'--':Number(row.changePct).toFixed(2)+'%'}</td></tr>`;}).join('');
  return `<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(122,88,40,.18)"><div style="font-weight:700;margin-bottom:4px">近 30 日淨值</div><div style="color:var(--muted);font-size:12px;margin-bottom:6px">最新 ${Number(latest.nav).toFixed(2)} · 資料日 ${esc(latest.date)} · 共 ${rows.length} 筆</div><svg viewBox="0 0 300 64" width="100%" height="64" role="img" aria-label="近30日淨值走勢圖" style="display:block;overflow:visible"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".8"></polyline></svg><details><summary style="cursor:pointer;color:var(--muted);font-size:12px">查看每日明細</summary><div style="overflow:auto;margin-top:8px"><table style="width:100%;font-size:11px;border-collapse:collapse"><thead><tr><th style="text-align:left">日期</th><th style="text-align:right">淨值</th><th style="text-align:right">漲跌</th><th style="text-align:right">漲跌幅</th></tr></thead><tbody>${table}</tbody></table></div></details></div>`;
}

async function refreshExternalIntelligence(){
  try{
    await arkWallFetch('/api/intelligence/refresh',{method:'POST',wallWrite:true,headers:{'Content-Type':'application/json'},body:'{}'});
    var label=document.getElementById('intelligence-label');
    if(label)label.textContent='採集已排入背景工作';
    setTimeout(function(){loadExternalIntelligence(true);},1500);
  }catch(e){showMsg('intelligence-content','✗ '+(e.message||'重新採集失敗'),'err');}
}

async function addIntelligenceToChronicle(id){
  var item=(intelligenceCache&&intelligenceCache.items||[]).find(function(row){return String(row.id)===String(id);});
  if(!item)return;
  var name=String(item.title||'外部情報').slice(0,120);
  if(!confirm('將「'+name+'」加入事件編年？'))return;
  try{
    await eventChronicleApiRequest('POST','/api/event-chronicle',{name:name,date:String(item.publishedAt||today()).slice(0,10),price:1,mode:'單一事件耗時',durationDays:1,note:'來源：'+String(item.sourceUrl||'')},30000);
    alert('已加入事件編年史');
  }catch(e){alert('加入失敗：'+(e.message||'未知錯誤'));}
}

async function loadMarketDashboard(){
  var el=document.getElementById('market-content');
  if(!el)return;
  if(!API_URL){
    setCouncilPanelStatusIfActive('err','尚未設定 API');
    el.innerHTML=setupNotice();
    return;
  }
  var cachedEntry=readMarketCacheEntry(MARKET_DASHBOARD_CACHE_KEY,false);
  var cached=cachedEntry?cachedEntry.data:null;
  if(cached){
    setDataFreshness('market-freshness',dataFreshnessMeta(cached,cachedEntry.savedAt,true));
    renderMarketDashboard(cached,el);
  }
  if(cached){
    var cachedDot=document.getElementById('market-dot');
    var cachedLabel=document.getElementById('market-label');
    if(cachedDot)cachedDot.className='api-dot ok';
    if(cachedLabel)cachedLabel.textContent='快取資料 · 台美股大盤';
    setCouncilPanelStatusIfActive('ok','台美股大盤快取已載入');
    return Promise.resolve(cached);
  }
  setCouncilPanelStatusIfActive('pending',cached?'快取資料更新中':'台美股大盤讀取中');
  var dot=document.getElementById('market-dot');
  var lbl=document.getElementById('market-label');
  if(cached&&lbl)lbl.textContent='快取資料 · 更新中…';
  if(marketDashboardPromise){
    return marketDashboardPromise.then(function(data){
      if(data&&document.getElementById('market-content')){
        setDataFreshness('market-freshness',dataFreshnessMeta(data,false,false));
        renderMarketDashboard(data,document.getElementById('market-content'));
        ensureMarketMarginData(data).then(function(){
          writeTimedMarketCache(MARKET_DASHBOARD_CACHE_KEY,data);
          var current=document.getElementById('market-content');
          if(current)renderMarketDashboard(data,current);
        }).catch(function(e){console.warn('market margin refresh failed',e);});
      }
      return data;
    });
  }
  marketDashboardPromise=apiGet({action:'marketDashboard'}).then(function(data){
    setDataFreshness('market-freshness',dataFreshnessMeta(data,false,false));
    renderMarketDashboard(data,el);
    writeTimedMarketCache(MARKET_DASHBOARD_CACHE_KEY,data);
    var dot=document.getElementById('market-dot');
    var lbl=document.getElementById('market-label');
    if(dot)dot.className='api-dot ok';
    if(lbl)lbl.textContent='已連線 · 市場快報';
    setCouncilPanelStatusIfActive('ok','台美股大盤已連線');
    ensureMarketMarginData(data).then(function(){
      writeTimedMarketCache(MARKET_DASHBOARD_CACHE_KEY,data);
      var current=document.getElementById('market-content');
      if(current)renderMarketDashboard(data,current);
    }).catch(function(e){console.warn('market margin refresh failed',e);});
    return data;
  }).catch(function(e){
    if(!cached)el.innerHTML=`<div style="color:var(--coral);font-family:var(--sans);font-size:12px;padding:12px 0">${esc(e.message)}</div>`;
    var dot=document.getElementById('market-dot');
    var lbl=document.getElementById('market-label');
    if(dot)dot.className='api-dot err';
    if(lbl)lbl.textContent=cached?'快取資料 · 更新失敗':'市場快報讀取失敗';
    setCouncilPanelStatusIfActive(cached?'pending':'err',cached?'快取資料可用':'台美股大盤讀取失敗');
    return null;
  }).finally(function(){
    marketDashboardPromise=null;
  });
  return marketDashboardPromise;
}

function marketFormatNumber(value,digits){
  var fixed=Number(value||0).toFixed(digits==null?2:digits);
  var parts=fixed.split('.');
  parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return parts.join('.');
}

function marketParseNumber(value){
  return parseFloat(String(value||'').replace(/[$,\s]/g,'').replace('%',''))||0;
}

async function fetchTWSEMarginBalanceClient(){
  var url='https://www.twse.com.tw/exchangeReport/MI_MARGN?response=json&selectType=ALL';
  var res=await fetchWithTimeout(url,{cache:'no-store'},8000);
  if(!res.ok)return null;
  var json=await res.json();
  if(!json||json.stat!=='OK')return null;
  var tables=json.tables||[];
  for(var t=0;t<tables.length;t++){
    var table=tables[t]||{};
    var fields=table.fields||[];
    var data=table.data||[];
    var todayIdx=fields.indexOf('今日餘額');
    if(todayIdx<0)todayIdx=5;
    for(var r=0;r<data.length;r++){
      var row=data[r]||[];
      if(String(row[0]||'').indexOf('融資金額')<0)continue;
      var thousand=marketParseNumber(row[todayIdx]);
      if(!thousand)return null;
      var amount=thousand*1000;
      var dateText=String(json.date||'').replace(/^(\d{4})(\d{2})(\d{2})$/,'$1/$2/$3');
      var maintenance=await fetchTWSEMarginMaintenanceClient(json,amount);
      return {
        display:marketFormatNumber(amount/100000000,2)+' 億',
        value:amount,
        updatedAt:dateText,
        source:'TWSE',
        maintenanceRatio:maintenance.ratio,
        maintenanceText:maintenance.text
      };
    }
  }
  return null;
}

async function fetchTWSEMarginMaintenanceClient(marginJson,marginAmount){
  try{
    if(!marginJson||!marginJson.date||!marginAmount)return{ratio:0,text:''};
    var url='https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&type=ALLBUT0999&date='+encodeURIComponent(marginJson.date);
    var res=await fetchWithTimeout(url,{cache:'no-store'},8000);
    if(!res.ok)return{ratio:0,text:''};
    var priceJson=await res.json();
    if(!priceJson||priceJson.stat!=='OK')return{ratio:0,text:''};
    var priceMap={};
    (priceJson.tables||[]).forEach(function(table){
      var fields=table.fields||[];
      var codeIdx=fields.indexOf('證券代號');
      var closeIdx=fields.indexOf('收盤價');
      if(codeIdx<0||closeIdx<0)return;
      (table.data||[]).forEach(function(row){
        var code=String(row[codeIdx]||'').trim();
        var close=marketParseNumber(row[closeIdx]);
        if(code&&close)priceMap[code]=close;
      });
    });
    var marketValue=0;
    (marginJson.tables||[]).forEach(function(table){
      var fields=table.fields||[];
      var codeIdx=fields.indexOf('代號');
      var balanceIdx=fields.indexOf('今日餘額');
      if(codeIdx<0||balanceIdx<0)return;
      (table.data||[]).forEach(function(row){
        var code=String(row[codeIdx]||'').trim();
        var units=marketParseNumber(row[balanceIdx]);
        var price=priceMap[code]||0;
        if(code&&units&&price)marketValue+=units*price*1000;
      });
    });
    var ratio=marginAmount?marketValue/marginAmount*100:0;
    return{ratio:ratio,text:ratio?ratio.toFixed(2)+'%':''};
  }catch(e){
    console.warn('TWSE maintenance fallback failed',e);
    return{ratio:0,text:''};
  }
}

async function ensureMarketMarginData(data){
  var rows=(data&&data.rows)||[];
  var twse=rows.find(function(r){return r&&(r.isTWSE||r.code==='^TWII');});
  if(!twse||twse.marginBalanceText||twse.marginBalance)return;
  try{
    var margin=await fetchTWSEMarginBalanceClient();
    if(!margin)return;
    twse.marginBalance=margin.value;
    twse.marginBalanceText=margin.display;
    twse.marginBalanceUpdatedAt=margin.updatedAt;
    twse.marginBalanceSource=margin.source;
    twse.marginMaintenanceRatio=margin.maintenanceRatio;
    twse.marginMaintenanceText=margin.maintenanceText;
  }catch(e){
    console.warn('TWSE margin fallback failed',e);
  }
}

function marketDeltaTone(value){
  var n=Number(value||0);
  return n>0?'up':(n<0?'down':'');
}

function marketDeltaLine(value,text,prefix){
  text=String(text||'').trim();
  if(!text&&value!==null&&value!==undefined&&value!==''){
    var n=Number(value);
    if(isNaN(n)||!isFinite(n))return '';
    text=(n>0?'+':'')+n.toFixed(2);
  }
  if(!text)return '';
  return `<div class="market-metric-d ${marketDeltaTone(value)}">${esc(prefix||'較昨')} ${esc(text)}</div>`;
}

async function loadMacroOverview(){
  var el=document.getElementById('macro-content');
  if(!el)return;
  if(!API_URL){
    setCouncilPanelStatusIfActive('err','尚未設定 API');
    el.innerHTML=setupNotice();
    return;
  }
  var cachedEntry=readMarketCacheEntry(MARKET_MACRO_CACHE_KEY,false);
  var cached=cachedEntry?cachedEntry.data:null;
  if(cached){
    setDataFreshness('macro-freshness',dataFreshnessMeta(cached,cachedEntry.savedAt,true));
    renderMacroOverview(cached,el);
  }
  else el.innerHTML='<div class="skel-line skel"></div><div class="skel-line skel" style="width:82%"></div><div class="skel-line skel" style="width:68%"></div>';
  if(cached){
    var cachedDot=document.getElementById('macro-dot');
    var cachedLabel=document.getElementById('macro-label');
    if(cachedDot)cachedDot.className='api-dot ok';
    if(cachedLabel)cachedLabel.textContent='快取資料 · 美股總經';
    setCouncilPanelStatusIfActive('ok','美股總經快取已載入');
    return Promise.resolve(cached);
  }
  setCouncilPanelStatusIfActive('pending',cached?'快取資料更新中':'美股總經讀取中');
  var lbl=document.getElementById('macro-label');
  if(cached&&lbl)lbl.textContent='快取資料 · 更新中…';
  if(macroOverviewPromise){
    return macroOverviewPromise.then(function(data){
      if(data&&document.getElementById('macro-content')){
        setDataFreshness('macro-freshness',dataFreshnessMeta(data,false,false));
        renderMacroOverview(data,document.getElementById('macro-content'));
      }
      return data;
    });
  }
  macroOverviewPromise=apiGet({action:'macroOverview'}).then(function(data){
    setDataFreshness('macro-freshness',dataFreshnessMeta(data,false,false));
    renderMacroOverview(data,el);
    writeTimedMarketCache(MARKET_MACRO_CACHE_KEY,data);
    var dot=document.getElementById('macro-dot');
    var lbl=document.getElementById('macro-label');
    if(dot)dot.className='api-dot ok';
    if(lbl)lbl.textContent=data&&data.hasData?'已連線 · 美股總經':'已連線 · 尚未建立總經資料';
    setCouncilPanelStatusIfActive('ok',data&&data.hasData?'美股總經已連線':'尚未建立總經資料');
    return data;
  }).catch(function(e){
    if(!cached)el.innerHTML=`<div style="color:var(--coral);font-family:var(--sans);font-size:12px;padding:12px 0">${esc(e.message)}</div>`;
    var dot=document.getElementById('macro-dot');
    var lbl=document.getElementById('macro-label');
    if(dot)dot.className='api-dot err';
    if(lbl)lbl.textContent=cached?'快取資料 · 更新失敗':'美股總經讀取失敗';
    setCouncilPanelStatusIfActive(cached?'pending':'err',cached?'快取資料可用':'美股總經讀取失敗');
    return null;
  }).finally(function(){
    macroOverviewPromise=null;
  });
  return macroOverviewPromise;
}

async function createMacroSample(){
  var el=document.getElementById('macro-content');
  if(!API_URL){if(el)el.innerHTML=setupNotice();return;}
  try{
    if(el)el.innerHTML='<div class="battle-empty">正在寫入總經測試資料…</div>';
    await apiPost({
      action:'macroWebhook',
      date:today(),
      yield10y:4.62,
      oil:86.3,
      cpi:3.4,
      ppi:6.0,
      unemployment:4.1,
      joltsOpenings:6866,
      adpEmploymentChange:122,
      nfpPayrollChange:115,
      vix:19.8,
      dxy:105.2,
      creditSpread:1.7,
      consumerSentiment:49.8,
      source:'前端測試資料',
      scenario:'軟著陸',
      signal:'黃燈',
      score:42,
      summary:'利率與美元仍偏高，但就業與信用風險尚未明顯惡化，整體仍偏向軟著陸觀察格局。',
      mainRisk:'利率與美元仍偏高',
      suggestion:'維持核心配置，避免過度槓桿，等待通膨與利率壓力進一步降溫。'
    });
    await loadMacroOverview();
  }catch(e){
    if(el)el.innerHTML=`<div style="color:var(--coral);font-family:var(--sans);font-size:12px;line-height:1.8;padding:12px 0">測試資料寫入失敗：${esc(e.message)}<br><div class="setup-hint" style="margin-top:10px">請至龐統軍師 > 齒輪 > 驗證連線</div></div>`;
  }
}

function taiwanMacroTone(direction){
  var key=direction&&direction.key||'';
  return key==='improve'?'attack':key==='cool'?'defense':'watch';
}
function taiwanMacroDirectionText(direction){
  return direction&&direction.label?direction.label:'尚未更新';
}
function taiwanMacroValueText(value,suffix){
  if(value===null||value===undefined||value==='')return '--';
  var n=Number(value);
  if(isNaN(n))return esc(value);
  return (n>=0&&suffix==='%'?'+':'')+n.toFixed(2)+(suffix||'');
}
function taiwanMacroCard(name,code,value,direction,suffix,meta){
  var tone=taiwanMacroTone(direction);
  return `<div class="taiwan-macro-card">
    <div class="taiwan-macro-card-head"><div><div class="taiwan-macro-card-name">${name}</div><div class="taiwan-macro-card-code">${code}</div></div><div class="macro-indicator-status ${tone}">${esc(taiwanMacroDirectionText(direction))}</div></div>
    <div class="taiwan-macro-card-value">${taiwanMacroValueText(value,suffix)}</div>
    <div class="taiwan-macro-card-meta">${esc(meta||'')}</div>
  </div>`;
}
function taiwanMacroChart(rows,code,label){
  var chartRows=rows.map(function(row,index){
    var raw=row[code];
    if(raw===null||raw===undefined||String(raw).trim()==='')return {month:row.month||'',value:null,index:index};
    var value=Number(raw);
    return {month:row.month||'',value:isFinite(value)?value:null,index:index};
  });
  var points=chartRows.filter(function(item){return item.value!==null;});
  if(points.length<2){
    var message=points.length?'目前只有 '+points.length+' 期有效資料，其餘月份尚未公布':'尚未累積足夠歷史資料';
    return '<div class="taiwan-macro-chart"><div class="taiwan-macro-chart-head"><span>'+esc(label)+'</span><span>資料不足</span></div><div class="taiwan-macro-empty">'+message+'</div></div>';
  }
  var width=360,height=128,pad=14,min=Math.min.apply(null,points.map(function(item){return item.value;})),max=Math.max.apply(null,points.map(function(item){return item.value;})),span=max-min||1;
  var rowSpan=Math.max(1,rows.length-1),segments=[],segment=[];
  chartRows.forEach(function(item){
    if(item.value===null){if(segment.length)segments.push(segment);segment=[];return;}
    segment.push(item);
  });
  if(segment.length)segments.push(segment);
  var lineMarkup=segments.map(function(items){
    var coords=items.map(function(item){
      var x=pad+(item.index/rowSpan)*(width-pad*2),y=height-pad-((item.value-min)/span)*(height-pad*2);
      return x.toFixed(1)+','+y.toFixed(1);
    }).join(' ');
    return items.length>1?'<polyline points="'+coords+'" class="taiwan-macro-line"></polyline>':'';
  }).join('');
  var labelStep=Math.max(1,Math.ceil(points.length/12));
  var pointMarkup=points.map(function(item,pointIndex){
    var x=pad+(item.index/rowSpan)*(width-pad*2),y=height-pad-((item.value-min)/span)*(height-pad*2);
    var labelY=Math.max(11,y-7);
    var showLabel=pointIndex%labelStep===0||pointIndex===points.length-1;
    return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="2.5" class="taiwan-macro-point"><title>'+esc(item.month)+'：'+item.value.toFixed(2)+'</title></circle>'+(showLabel?'<text x="'+x.toFixed(1)+'" y="'+labelY.toFixed(1)+'" class="taiwan-macro-point-label">'+item.value.toFixed(2)+'</text>':'');
  }).join('');
  return '<div class="taiwan-macro-chart"><div class="taiwan-macro-chart-head"><span>'+esc(label)+'</span><span>'+min.toFixed(2)+' ～ '+max.toFixed(2)+'</span></div><svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+esc(label)+'歷史趨勢"><line x1="'+pad+'" y1="'+(height-pad)+'" x2="'+(width-pad)+'" y2="'+(height-pad)+'" class="taiwan-macro-axis"></line>'+lineMarkup+pointMarkup+'</svg></div>';
}
function renderTaiwanMacro(data,history,el,range){
  data=data||{}; history=history||{}; var latest=data.latest||{}; var d=latest.directions||{};
  if(!data.hasData){el.innerHTML='<div class="taiwan-macro-empty">台灣總體經濟資料尚未建立。<br><button class="battle-report-refresh" type="button" onclick="taiwanMacroUpdate()">同步官方資料</button></div>';return;}
  var meta='最新公布月份：'+(latest.month||'--')+' · 更新：'+(latest.updated_at||'--');
  var cards=[
    taiwanMacroCard('🚦 景氣燈號','business_cycle_light',latest.business_cycle_light,d.score,'', '綜合判斷 '+(latest.business_cycle_score||'--')+' 分'),
    taiwanMacroCard('📈 領先指標','leading_index_without_trend',latest.leading_index_without_trend,d.leading,'', '不含趨勢指數'),
    taiwanMacroCard('🧭 製造業 PMI','pmi',latest.pmi,d.pmi,'', '50 以上為擴張'),
    taiwanMacroCard('📦 出口','exports_yoy',latest.exports_yoy,d.exports,'%','年增率'),
    taiwanMacroCard('📝 外銷訂單','export_orders_yoy',latest.export_orders_yoy,d.orders,'%','年增率'),
    taiwanMacroCard('🏭 工業生產','industrial_production_yoy',latest.industrial_production_yoy,d.industrial,'%','年增率'),
    taiwanMacroCard('💱 新台幣','usdtwd',latest.usdtwd,{key:latest.usdtwd_trend==='台幣升值'?'improve':latest.usdtwd_trend==='台幣貶值'?'cool':'flat',label:latest.usdtwd_trend||'尚未更新'},'', '近 3 個月'),
    taiwanMacroCard('💰 M2','m2_yoy',latest.m2_yoy,d.m2,'%','年增率')
  ];
  el.innerHTML=`<div class="taiwan-macro-hero"><div><div class="taiwan-macro-kicker">🇹🇼 台灣總體經濟</div><div class="taiwan-macro-state">${esc(latest.overall_state||'資料不足')}</div><div class="taiwan-macro-meta">${esc(meta)}</div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button class="battle-report-refresh" type="button" onclick="taiwanMacroUpdate()">同步官方資料</button><button class="battle-report-refresh" type="button" onclick="loadTaiwanMacro(true)">重新整理</button></div></div>
    <div class="taiwan-macro-section-title">目前景氣</div><div class="taiwan-macro-grid">${cards[0]}${cards[5]}</div>
    <div class="taiwan-macro-section-title">未來景氣</div><div class="taiwan-macro-grid">${cards[1]}${cards[2]}${cards[3]}${cards[4]}</div>
    <div class="taiwan-macro-section-title">金融／資金環境</div><div class="taiwan-macro-grid">${cards[6]}${cards[7]}</div>
    <div class="taiwan-macro-history"><div class="taiwan-macro-history-head"><div class="taiwan-macro-section-title">歷史趨勢</div><div class="taiwan-macro-range">${['6M','1Y','3Y','5Y'].map(function(item){return '<button class="'+(range===item?'active':'')+'" type="button" onclick="loadTaiwanMacro(false,\''+item+'\')">'+item+'</button>';}).join('')}</div></div>${taiwanMacroChart(history.rows||[],'business_cycle_score','景氣綜合判斷分數')} ${taiwanMacroChart(history.rows||[],'exports_yoy','出口 YoY')}</div>`;
}
async function taiwanMacroUpdate(){
  if(taiwanMacroSyncPromise)return taiwanMacroSyncPromise;
  if(!API_URL){return Promise.reject(new Error('尚未設定 Web App API'));}
  setCouncilPanelStatusIfActive('pending','台灣總體經濟同步中');
  taiwanMacroSyncPromise=apiGet({action:'taiwanMacroUpdate'},120000).then(function(result){
    if(!result||result.ok===false)throw new Error(result&&result.error||'官方資料同步失敗');
    return loadTaiwanMacro(true);
  }).then(function(result){renderTaiwanMacroSections();return result;}).catch(function(error){
    setCouncilPanelStatusIfActive('err','台灣總體經濟同步失敗');
    var el=document.getElementById('taiwan-macro-content');
    if(el&&!el.textContent.trim())el.innerHTML='<div class="taiwan-macro-empty">同步失敗：'+esc(error&&error.message||'請稍後再試')+'</div>';
    throw error;
  }).finally(function(){taiwanMacroSyncPromise=null;});
  return taiwanMacroSyncPromise;
}
// Council stability: independent sections, shared requests and latest selected range.
var taiwanMacroView={range:'1Y',overview:null,history:{},errors:{},requests:{}};
function renderTaiwanMacroSections(){
  var el=document.getElementById('taiwan-macro-content');
  if(!el)return;
  var state=taiwanMacroView,range=state.range;
  if(!el.querySelector('[data-taiwan-overview]'))el.innerHTML='<div data-taiwan-overview></div><div data-taiwan-history></div>';
  var overview=el.querySelector('[data-taiwan-overview]');
  var history=el.querySelector('[data-taiwan-history]');
  if(state.overview){
    renderTaiwanMacro(state.overview,{},overview,range);
    var embedded=overview.querySelector('.taiwan-macro-history');
    if(embedded)embedded.remove();
  }else overview.innerHTML='<div class="taiwan-macro-empty">'+(state.requests.overview?'最新指標讀取中…':'最新指標尚未取得')+'</div>';
  function notice(key,hasData,part){
    if(!state.errors[key])return state.requests[key]?'<div role="status">'+(hasData?'更新中，顯示上次成功資料…':'讀取中…')+'</div>':'';
    return '<div class="taiwan-macro-empty" role="status">'+(hasData?'更新失敗，保留上次成功資料。':'讀取失敗。')+esc(state.errors[key])+' <button class="battle-report-refresh" type="button" onclick="loadTaiwanMacro(true,undefined,\''+part+'\')">重試此區</button></div>';
  }
  overview.insertAdjacentHTML('afterbegin',notice('overview',!!state.overview,'overview'));
  var controls=['6M','1Y','3Y','5Y'].map(function(item){return '<button class="'+(range===item?'active':'')+'" type="button" onclick="loadTaiwanMacro(false,\''+item+'\',\'history\')">'+item+'</button>';}).join('');
  var data=state.history[range];
  history.innerHTML='<div class="taiwan-macro-history"><div class="taiwan-macro-history-head"><div class="taiwan-macro-section-title">歷史趨勢</div><div class="taiwan-macro-range">'+controls+'</div></div>'+notice('history:'+range,!!data,'history')+(data?taiwanMacroChart(data.rows||[],'business_cycle_score','景氣綜合判斷分數')+taiwanMacroChart(data.rows||[],'exports_yoy','出口 YoY'):'')+'</div>';
  var pending=state.requests.overview||state.requests['history:'+range];
  var failed=state.errors.overview||state.errors['history:'+range];
  setCouncilPanelStatusIfActive(pending?'pending':failed?'err':'ok',pending?'台灣總體經濟更新中':failed?'部分資料更新失敗':'台灣總體經濟已連線');
}
async function loadTaiwanMacro(force,range,section){
  var el=document.getElementById('taiwan-macro-content');if(!el)return;
  if(!API_URL){el.innerHTML=setupNotice();return;}
  var state=taiwanMacroView;
  range=range||state.range;
  if(['6M','1Y','3Y','5Y'].indexOf(range)<0)range='1Y';
  state.range=range;
  function request(key,params,save){
    if(state.requests[key])return state.requests[key];
    delete state.errors[key];
    state.requests[key]=Promise.resolve().then(function(){return apiGet(params,30000);}).then(function(data){
      save(data);return data;
    }).catch(function(error){state.errors[key]=error&&error.message||'請稍後再試';return null;}).finally(function(){
      delete state.requests[key];renderTaiwanMacroSections();
    });
    return state.requests[key];
  }
  var jobs=[];
  if(section!=='history')jobs.push(request('overview',{action:'taiwanMacroOverview'},function(data){state.overview=data;}));
  if(section!=='overview')jobs.push(request('history:'+range,{action:'taiwanMacroHistory',range:range},function(data){state.history[range]=data;}));
  renderTaiwanMacroSections();
  var pending=Promise.all(jobs);
  taiwanMacroPromise=pending;
  return pending.finally(function(){if(taiwanMacroPromise===pending)taiwanMacroPromise=null;});
}

window.MilitaryModuleLoaded={name:'military',version:'20260929-v1'};
