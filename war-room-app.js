/* Standalone War Room runtime: deliberately has no dependency on index.html. */
(function(){
  'use strict';
  var API_DEFAULT='https://script.google.com/macros/s/AKfycbyShZS0LibQvIiZyxiag7oGLnL41XCrPBp4ti2IFaHSI3E8gP3iznxix0k7G6wkPgzq/exec';
  var API_URL=normalizeApi(localStorage.getItem('wealth_api_url')||'')||API_DEFAULT;
  var tabs={
    'war-briefing':{title:'帝國晨報',load:loadBriefing},
    'war-roster':{title:'部隊陣容',load:loadWarRoster}
  };
  var currentTab='war-briefing',lastLoaded={},busy=false,nasdaqValuationPromise=null,taiwanValuationPromise=null,taiwanValuationLastAttempt=0,warRoomYtdDrawdownPromise=null,twseAfterHoursPromise=null,twseAfterHoursTimer=null,taiwanCloseReportPromise=null,usCloseReportPromise=null;
  var activeCloseReportTab='taiwan',closeReportMarkup={taiwan:'',us:''},usCloseReportLoaded=false;
  var NASDAQ_VALUATION_CACHE_KEY='wealth_nasdaq100_valuation_v1';
  var TAIWAN_VALUATION_CACHE_KEY='wealth_taiwan_valuation_v1';
  var WAR_ROOM_YTD_DRAWDOWN_CACHE_KEY='wealth_war_room_ytd_drawdown_v1';
  var TWSE_AFTER_HOURS_CACHE_KEY='wealth_war_room_twse_after_hours_v1';
  var TAIWAN_CLOSE_REPORT_CACHE_KEY='wealth_war_room_taiwan_close_report_v1';
  var US_CLOSE_REPORT_CACHE_KEY='wealth_war_room_us_close_report_v1';
  var content=document.getElementById('content'),status=document.getElementById('connection-status');
  function loadWarRoster(force){return window.warRosterModule.load(request,force,function(value){if(currentTab==='war-roster')setFreshness(value);},function(text,kind){if(currentTab==='war-roster')setStatus(text,kind);},function(){return currentTab==='war-roster';});}
  function normalizeApi(value){value=String(value||'').trim();return /script\.google\.com\/macros\/s\//i.test(value)?API_DEFAULT:value;}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function setStatus(text,kind){status.textContent=text;status.className='connection '+(kind||'pending');}
  function setFreshness(value){document.getElementById('freshness').textContent=value||'';}
  function dateText(value){if(!value)return '--';var date=new Date(value);return isNaN(date.getTime())?String(value):date.toLocaleString('zh-TW',{hour12:false});}
  function readCache(key){try{var item=JSON.parse(localStorage.getItem(key)||'null');return item&&item.data?item.data:null;}catch(e){return null;}}
  function writeCache(key,value){try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),data:value}));}catch(e){}}
  function credentials(){return {token:localStorage.getItem('wealth_write_token')||'',session:sessionStorage.getItem('wealth_web_session_token')||''};}
  function authFresh(){var checked=Number(localStorage.getItem('wealth_web_verify_checked_at')||0);return localStorage.getItem('wealth_web_verify_status')==='ok'&&Date.now()-checked<7*24*60*60*1000;}
  function authError(message){var error=new Error(message);error.status=401;return error;}
  async function request(params,timeout){
    var auth=credentials();if(!auth.token)throw authError('尚未設定城門 WRITE_TOKEN');
    var query=Object.assign({},params,{token:auth.token,_ts:Date.now()});if(auth.session)query.sessionToken=auth.session;
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},timeout||30000);
    try{
      var url=API_URL+'?'+Object.keys(query).map(function(key){return encodeURIComponent(key)+'='+encodeURIComponent(query[key]);}).join('&');
      var response=await fetch(url,{cache:'no-store',redirect:'follow',signal:controller.signal});
      var text=await response.text(),result;
      try{result=JSON.parse(text);}catch(e){throw new Error('API 回傳格式無法辨識（HTTP '+response.status+'）');}
      if(!response.ok||!result||result.ok===false){var error=new Error(result&&result.error||('API 讀取失敗 HTTP '+response.status));error.status=response.status;throw error;}
      return Object.prototype.hasOwnProperty.call(result,'data')?result.data:result;
    }catch(error){if(error.name==='AbortError')throw new Error('讀取逾時，請稍後重試');throw error;}finally{clearTimeout(timer);}
  }
  async function post(params,timeout){
    var auth=credentials();if(!auth.token)throw authError('尚未設定城門 WRITE_TOKEN');
    var payload=Object.assign({},params,{token:auth.token});if(auth.session)payload.sessionToken=auth.session;
    var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},timeout||30000);
    try{var response=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:controller.signal,redirect:'follow'});var result=await response.json();if(!response.ok||!result||result.ok===false)throw new Error(result&&result.error||'API 寫入失敗');return result.data||result;}finally{clearTimeout(timer);}
  }
  async function createSession(){
    var result;try{result=await request({action:'createWebSession'},15000);}catch(error){if(error.status!==404&&error.status!==405)throw error;result=await post({action:'createWebSession'},15000);}
    if(!result||!result.sessionToken)throw new Error('城門未回傳登入 Session');
    sessionStorage.setItem('wealth_web_session_token',String(result.sessionToken));localStorage.setItem('wealth_web_verify_status','ok');localStorage.setItem('wealth_web_verify_checked_at',String(Date.now()));localStorage.setItem('wealth_web_verify_message','城門驗證成功');
  }
  function startSessionRefresh(){if(window.warRoomSessionTimer)return;window.warRoomSessionTimer=setInterval(function(){if(document.visibilityState==='visible'&&credentials().token)createSession().catch(function(){});},4*60*60*1000);}
  async function authorize(){
    if(!credentials().token){renderLogin('尚未設定城門密碼，請使用主網站相同的 WRITE_TOKEN。');return false;}
    if(authFresh()&&credentials().session)return true;
    setStatus('城門驗證中','pending');
    try{await createSession();setStatus('城門已連線','ok');return true;}catch(error){localStorage.setItem('wealth_web_verify_status','err');localStorage.setItem('wealth_web_verify_message',error.message);setStatus('城門驗證需處理','err');renderLogin(error.message);return false;}
  }
  function renderLogin(message){content.innerHTML='<div class="auth-box"><h2>🔐 城門驗證</h2><p>'+esc(message||'請輸入與主網站相同的 API 網址與城門密碼。資料只保存在此瀏覽器，不會送到其他服務。')+'</p><label>Web App API 網址<input id="api-url" type="url" autocomplete="url" placeholder="https://script.google.com/macros/s/.../exec" value="'+esc(localStorage.getItem('wealth_api_url')||API_DEFAULT)+'"></label><label>城門密碼（WRITE_TOKEN）<input id="write-token" type="password" autocomplete="current-password" value="'+esc(localStorage.getItem('wealth_write_token')||'')+'"></label><button class="action" id="login-submit" type="button">驗證並進入</button><p class="sub">若主網站已登入，請確認兩個頁面位於相同網域；本頁會沿用既有瀏覽器 Session。</p></div>';document.getElementById('login-submit').onclick=async function(){localStorage.setItem('wealth_api_url',normalizeApi(document.getElementById('api-url').value)||API_DEFAULT);localStorage.setItem('wealth_write_token',document.getElementById('write-token').value.trim());API_URL=normalizeApi(localStorage.getItem('wealth_api_url'))||API_DEFAULT;this.disabled=true;var ok=await authorize();if(ok)selectTab(currentTab,true);};}
  function num(value,digits){if(value==null||value===''||!isFinite(Number(value)))return '--';return Number(value).toLocaleString('zh-TW',{maximumFractionDigits:digits==null?2:digits});}
  function metric(label,value,sub){return '<div class="card"><h3>'+esc(label)+'</h3><div class="metric">'+esc(value==null||value===''?'資料暫缺':value)+'</div>'+(sub?'<div class="metric-label">'+esc(sub)+'</div>':'')+'</div>';}
  function genericRows(items,fields){if(!Array.isArray(items)||!items.length)return '<div class="empty">目前沒有可顯示資料</div>';return '<div class="rows">'+items.map(function(item){return '<article class="row"><div class="row-title">'+esc(item.name||item.title||item.code||item.label||'資料')+'<small>'+esc(item.code||item.date||item.sourceDate||item.quadrant||'')+'</small></div>'+fields.map(function(field){var value=item[field.key];var text=value==null?'--':(field.format?field.format(value):String(value));var cls=field.color&&Number(value)<0?'down':field.color&&Number(value)>0?'up':'';return '<div class="'+cls+'"><small>'+esc(field.label)+'</small>'+esc(text)+'</div>';}).join('')+'</article>';}).join('')+'</div>';}
  function rawDetails(title,data){return '<details class="details"><summary>'+esc(title)+'</summary><pre>'+esc(JSON.stringify(data,null,2))+'</pre></details>';}
  function renderNasdaqValuation_(data,stale,error,loading){
    var host=document.getElementById('nasdaq-valuation-host');if(!host)return;
    var trailing=data&&data.trailingPE!=null&&isFinite(Number(data.trailingPE))?num(data.trailingPE,2)+'×':'資料暫缺';
    var forward=data&&data.forwardPE!=null&&isFinite(Number(data.forwardPE))?num(data.forwardPE,2)+'×':'資料暫缺';
    var status=loading?'顯示快照 · 背景更新中':(error?'來源暫時無法讀取':stale?'資料日期較舊，請留意日期':data?'資料已更新':'背景讀取中…');
    host.innerHTML='<article class="nasdaq-valuation-card"><div class="nasdaq-valuation-head"><span>📊 NASDAQ-100 估值</span><span class="nasdaq-valuation-status">'+esc(status)+'</span></div><div class="nasdaq-valuation-values"><div><small>Trailing P/E</small><strong>'+esc(trailing)+'</strong><small>資料日期 '+esc(data&&data.trailingDataDate||'暫缺')+'</small></div><div><small>Forward P/E</small><strong>'+esc(forward)+'</strong><small>資料日期 '+esc(data&&data.forwardDataDate||'暫缺')+'</small></div></div><details class="brief-inline-details"><summary>來源與估值說明</summary><p>估值為歷史指標，不代表價格預測；Forward P/E 採來源自行計算的未來 12 個月估計。來源：<a href="https://historyofmarket.com/nasdaq/ndx-forward-pe/" target="_blank" rel="noopener noreferrer">History of Market — Nasdaq 100 Forward PE</a>（資料 CC BY 4.0）'+(error?' · '+esc(error):'')+'</p></details></article>';
    var values=host.querySelector('.nasdaq-valuation-values');if(values)values.insertAdjacentHTML('afterend','<div id="nasdaq-ytd-drawdown" class="war-ytd-drawdown"></div>');
  }
  function refreshNasdaqValuation_(){
    var cached=readCache(NASDAQ_VALUATION_CACHE_KEY);
    if(cached)renderNasdaqValuation_(cached,false,'',true);
    if(nasdaqValuationPromise)return nasdaqValuationPromise;
    if(!cached)renderNasdaqValuation_(null,false,'',true);
    nasdaqValuationPromise=request({action:'nasdaq100Valuation'},20000).then(function(data){
      writeCache(NASDAQ_VALUATION_CACHE_KEY,data);
      renderNasdaqValuation_(data,!!data.stale,'',false);
      return data;
    }).catch(function(error){
      renderNasdaqValuation_(cached,true,error&&error.message||'估值資料暫缺',false);
      return null;
    }).finally(function(){nasdaqValuationPromise=null;});
    return nasdaqValuationPromise;
  }
  function renderTaiwanValuation_(data,stale,error,loading){
    var host=document.getElementById('taiwan-valuation-host');if(!host)return;
    data=data||{};
    function value(number){return number!=null&&number!==''&&isFinite(Number(number))&&Number(number)>0?num(number,2)+'×':'資料暫缺';}
    var pe=data.trailingPE,peMedian=data.historicalPEMedian&&data.historicalPEMedian.tenYear;
    host.innerHTML='<section class="twse-valuation"><div class="twse-valuation-head"><strong>📊 台股估值</strong></div><div class="nasdaq-valuation-values"><div><small>近四季 Trailing P/E</small><strong>'+esc(value(pe))+'</strong><small>資料日期 '+esc(data.dataDate||'暫缺')+'</small></div><div><small>10 年中位數 P/E</small><strong>'+esc(value(peMedian))+'</strong><small>歷史比較基準</small></div></div><details class="brief-inline-details"><summary>來源與估值說明</summary><p>估值為歷史比較，不代表價格預測或買賣訊號。來源：'+esc(data.source||'來源未提供')+' · <a href="https://www.moneydj.com/Z/ZB/ZBL/ZBLB/ZBLB.djhtm" target="_blank" rel="noopener noreferrer">MoneyDJ P/E</a>'+(data.historyStatus?' · '+esc(data.historyStatus):'')+(data.error?' · '+esc(data.error):'')+(error?' · '+esc(error):'')+'</p></details></section>';
  }
  function refreshTaiwanValuation_(snapshotValue,snapshotStale){
    var cached=readCache(TAIWAN_VALUATION_CACHE_KEY),initial=snapshotValue||cached;
    renderTaiwanValuation_(initial,!!snapshotStale,'',true);
    if(taiwanValuationPromise||Date.now()-taiwanValuationLastAttempt<60000)return taiwanValuationPromise;
    taiwanValuationLastAttempt=Date.now();
    taiwanValuationPromise=request({action:'warRoomTaiwanValuation'},45000).then(function(value){
      if(!value||!value.dataDate)throw new Error('台股估值來源未提供有效資料');
      writeCache(TAIWAN_VALUATION_CACHE_KEY,value);renderTaiwanValuation_(value,false,'',false);return value;
    }).catch(function(error){renderTaiwanValuation_(initial,true,error&&error.message||'估值資料暫缺',false);return null;}).finally(function(){taiwanValuationPromise=null;});
    return taiwanValuationPromise;
  }
  function twseAfterHoursDate_(value){var text=String(value||'').replace(/-/g,'').slice(0,8);return /^\d{8}$/.test(text)?text.slice(0,4)+'/'+text.slice(4,6)+'/'+text.slice(6,8):'資料日未提供';}
  function twseAfterHoursAmount_(value){var n=Number(value);if(!isFinite(n))return '--';return (n>0?'+':'')+num(n/100000000,2)+' 億';}
  function renderTwseAfterHours_(data,stale,error,loading){
    var host=document.getElementById('twse-after-hours-host');if(!host)return;data=data||{};
    var index=data.index||{},margin=data.margin||{},indexDate=index.sourceDate||'',marginDate=margin.sourceDate||'';
    var status=loading?(indexDate||marginDate?'顯示最近資料 · 背景更新中':'背景讀取中…'):(error?'更新失敗，保留最近資料':(stale?'顯示最近成功資料':'官方資料'));
    function missingStatus(sourceDate,cutoff){var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()),p={};parts.forEach(function(x){p[x.type]=x.value;});var minute=Number(p.hour)*60+Number(p.minute),weekday=/^(Mon|Tue|Wed|Thu|Fri)$/.test(p.weekday||'');return weekday&&minute>=cutoff&&sourceDate&&sourceDate.replace(/-/g,'')<new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/-/g,'')?'當日資料尚未取得，顯示最近可用資料':'';}
    var indexMissing=missingStatus(indexDate,14*60),marginMissing=missingStatus(marginDate,21*60+30);
    var change=Number(index.changePoints),pct=Number(index.changePct),finance=Number(margin.changeTWD);
    var indexTone=isFinite(change)?(change>0?'up':change<0?'down':''):'',financeTone=isFinite(finance)?(finance>0?'up':finance<0?'down':''):'';
    var taiwanValuationMarkup=(document.getElementById('taiwan-valuation-host')||{}).innerHTML||'';
    var html='<article class="twse-after-hours-card"><div class="twse-after-hours-head"><strong>🇹🇼 台股盤後</strong><span>'+esc(status)+'</span></div><div class="twse-after-hours-grid"><section><small>加權指數收盤</small><strong>'+esc(index.close==null?'資料暫缺':num(index.close,2))+'</strong><span class="'+indexTone+'">'+(isFinite(change)?esc((change>0?'+':'')+num(change,2)+' 點')+'（'+esc((pct>0?'+':'')+num(pct,2)+'%')+'）':'資料暫缺')+'</span><small>資料日 '+esc(twseAfterHoursDate_(indexDate))+(indexMissing?' · '+indexMissing:'')+'</small></section><section><small>上市融資餘額增減</small><strong class="'+financeTone+'">'+esc(twseAfterHoursAmount_(margin.changeTWD))+'</strong><span>融資餘額 '+esc(margin.balanceTWD==null?'資料暫缺':num(Number(margin.balanceTWD)/100000000,2)+' 億元')+'</span><small>資料日 '+esc(twseAfterHoursDate_(marginDate))+(marginMissing?' · '+marginMissing:'')+'</small></section></div><div id="taiwan-valuation-host">'+taiwanValuationMarkup+'</div><details class="brief-inline-details"><summary>來源與計算說明</summary><p>來源：<a href="https://www.twse.com.tw/zh/trading/historical/mi-index.html" target="_blank" rel="noopener noreferrer">證交所收盤行情</a> · <a href="https://www.twse.com.tw/zh/trading/margin/mi-margn.html" target="_blank" rel="noopener noreferrer">證交所上市融資融券報表</a>。融資增減依報表今日餘額減前日餘額；前日餘額可能於後續調整。'+(error?' '+esc(error):'')+'</p></details></article>';
    host.innerHTML=html;
  }
  function refreshTwseAfterHours_(){
    var cached=readCache(TWSE_AFTER_HOURS_CACHE_KEY);renderTwseAfterHours_(cached,true,'',true);
    if(twseAfterHoursPromise)return twseAfterHoursPromise;
    twseAfterHoursPromise=request({action:'warRoomTwseAfterHoursOverview'},30000).then(function(data){if(!data||(!data.index&&!data.margin))throw new Error('官方來源尚未回傳有效資料');writeCache(TWSE_AFTER_HOURS_CACHE_KEY,data);renderTwseAfterHours_(data,false,'',false);return data;}).catch(function(error){renderTwseAfterHours_(cached,true,error&&error.message||'證交所資料暫時無法讀取',false);return null;}).finally(function(){twseAfterHoursPromise=null;scheduleTwseAfterHoursRefresh_();});
    return twseAfterHoursPromise;
  }
  function taiwanClock_(){var parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',weekday:'short',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date()),p={};parts.forEach(function(x){p[x.type]=x.value;});return {weekday:p.weekday,year:Number(p.year),month:Number(p.month),day:Number(p.day),hour:Number(p.hour),minute:Number(p.minute),second:Number(p.second)};}
  function scheduleTwseAfterHoursRefresh_(){
    if(twseAfterHoursTimer)clearTimeout(twseAfterHoursTimer);if(currentTab!=='war-briefing')return;
    var c=taiwanClock_(),weekday=/^(Mon|Tue|Wed|Thu|Fri)$/.test(c.weekday),minute=c.hour*60+c.minute,windowNow=weekday&&((minute>=14*60&&minute<16*60+30)||(minute>=21*60+30&&minute<22*60+30)),target;
    if(windowNow)target=Date.UTC(c.year,c.month-1,c.day,c.hour-8,c.minute+15,0);
    else if(weekday&&minute<14*60+5)target=Date.UTC(c.year,c.month-1,c.day,6,5,0);
    else if(weekday&&minute<21*60+35)target=Date.UTC(c.year,c.month-1,c.day,13,35,0);
    else{var add=1,day=new Date(Date.UTC(c.year,c.month-1,c.day+add));while([0,6].includes(day.getUTCDay())){add++;day=new Date(Date.UTC(c.year,c.month-1,c.day+add));}target=Date.UTC(day.getUTCFullYear(),day.getUTCMonth(),day.getUTCDate(),6,5,0);}
    var taiwanAsUtc=Date.UTC(c.year,c.month-1,c.day,c.hour-8,c.minute,c.second);twseAfterHoursTimer=setTimeout(function(){if(currentTab==='war-briefing'&&!document.hidden)refreshTwseAfterHours_();else scheduleTwseAfterHoursRefresh_();},Math.max(60000,target-taiwanAsUtc));
  }
  function taiwanDateToday_(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  function renderCloseReportTabs_(){
    var host=document.getElementById('taiwan-close-report-host');if(!host)return;
    var active=activeCloseReportTab==='us'?'us':'taiwan';
    var panel=closeReportMarkup[active]||'<article class="taiwan-close-report"><p>報告尚未載入。</p></article>';
    host.innerHTML='<div class="close-report-tabs" role="tablist" aria-label="盤後報告市場選擇"><button type="button" role="tab" data-close-report-tab="taiwan" aria-selected="'+(active==='taiwan'?'true':'false')+'" aria-controls="close-report-tabpanel" class="'+(active==='taiwan'?'active':'')+'">🇹🇼 台股盤後報告</button><button type="button" role="tab" data-close-report-tab="us" aria-selected="'+(active==='us'?'true':'false')+'" aria-controls="close-report-tabpanel" class="'+(active==='us'?'active':'')+'">🇺🇸 美股盤後報告</button></div><div id="close-report-tabpanel" role="tabpanel">'+panel+'</div>';
    host.querySelectorAll('[data-close-report-tab]').forEach(function(button){button.addEventListener('click',function(){activeCloseReportTab=this.getAttribute('data-close-report-tab')==='us'?'us':'taiwan';renderCloseReportTabs_();if(activeCloseReportTab==='us'&&!usCloseReportLoaded){usCloseReportLoaded=true;refreshUsCloseReport_();}});});
    var refreshButton=host.querySelector('[data-us-close-report-refresh]');if(refreshButton)refreshButton.addEventListener('click',function(){refreshUsCloseReport_(true);});
  }
  function setCloseReportMarkup_(market,markup){closeReportMarkup[market]=markup||'';renderCloseReportTabs_();}
  function renderTaiwanCloseReport_(result,stale,error,loading){
    var host=document.getElementById('taiwan-close-report-host');if(!host)return;
    var report=result&&result.report,status=report&&report.status||result&&result.status||'pending';
    if(!report){var waiting=status==='insufficient_data'?'資料不足':status==='market_closed'?'今日休市':(loading?'讀取中':'尚未產生');setCloseReportMarkup_('taiwan','<article class="taiwan-close-report"><div class="taiwan-close-report-head"><strong>🇹🇼 台股盤後報告</strong><span>'+esc(waiting)+'</span></div><p>'+(error?esc(error):result&&result.attempt&&result.attempt.message?esc(result.attempt.message):'每日約 16:15 先核對 TWSE 官方收盤資料；未就緒時約 18:15 重試，成功後再由 DeepSeek 摘要。')+'</p></article>');return;}
    var index=report.index||{},hasIndex=status==='published'&&index.close!=null;
    var stamp=report.generatedAt?dateText(report.generatedAt):'生成時間未提供';
    var badge=error?'等待更新 · 顯示上次報告':(stale?'資料日期較舊':status==='market_closed'?'今日休市':status==='insufficient_data'?'資料不足':(String(report.source||'').indexOf('DeepSeek 摘要')>=0?'TWSE 官方資料 · DeepSeek 摘要':'TWSE 官方數據分析'));
    function number(value,digits){var n=Number(value);return isFinite(n)?n.toLocaleString('zh-TW',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'資料暫缺';}
    function signedPct(value,digits){if(value==null||value==='')return '資料不足';var n=Number(value);return isFinite(n)?(n>0?'+':'')+number(n,digits)+'%':'資料不足';}
    function relation(value,period){if(value==null||value==='')return '資料不足';var n=Number(value);return isFinite(n)?'收盤'+(n>=0?'高於':'低於')+period+'日均線 '+number(Math.abs(n),2)+'%':'資料不足';}
    var change=Number(index.changePoints),pct=Number(index.changePercent),changeClass=isFinite(change)?(change>0?'up':change<0?'down':''):'';
    var html='<article class="taiwan-close-report"><div class="taiwan-close-report-head"><strong>🇹🇼 台股盤後報告</strong><span>'+esc(badge)+'</span></div>';
    if(hasIndex)html+='<div class="taiwan-close-report-index"><div><small>'+esc(index.name||'加權指數')+' 收盤</small><strong>'+esc(number(index.close,2))+'</strong></div><div><small>漲跌</small><strong class="'+changeClass+'">'+esc((change>0?'+':'')+number(change,2))+' 點</strong></div><div><small>漲跌幅</small><strong class="'+changeClass+'">'+esc((pct>0?'+':'')+number(pct,2))+'%</strong></div></div>';
    html+='<h3>'+esc(report.headline||'當日市場觀察')+'</h3><p>'+esc(report.summary||report.mainRisk||'資料暫缺')+'</p>';
    if(Array.isArray(report.observations)&&report.observations.length)html+='<ul>'+report.observations.slice(0,3).map(function(item){return '<li>'+esc(item)+'</li>';}).join('')+'</ul>';
    var analysis=report.analysis||{},technical=analysis.technical,sectors=analysis.sectors;
    if(technical){
      var returns=technical.returns||{},averages=technical.movingAverages||{},relative=technical.closeVsMovingAveragePercent||{};
      var rsi=technical.rsi14==null?NaN:Number(technical.rsi14),rsiLabel=!isFinite(rsi)?'資料不足':rsi>=70?'偏高區':rsi<=30?'偏低區':'中性區';
      html+='<section class="taiwan-close-report-analysis"><h4>📈 技術觀察 <small>日線資料 '+esc(technical.dataDate||report.marketDate||'未提供')+' · '+esc(number(technical.sessions,0))+' 個交易日</small></h4><div class="taiwan-close-report-tech-grid">';
      html+='<div><small>短線 · 5 日</small><strong>'+esc(signedPct(returns.fiveSession,2))+'</strong><span>'+esc(relation(relative.five,5))+'</span></div>';
      html+='<div><small>中期 · 20 日</small><strong>'+esc(signedPct(returns.twentySession,2))+'</strong><span>'+esc(relation(relative.twenty,20))+'</span></div>';
      html+='<div><small>較長期 · 60 日</small><strong>'+esc(signedPct(returns.sixtySession,2))+'</strong><span>'+esc(relation(relative.sixty,60))+'</span></div>';
      html+='<div><small>RSI · 14 日</small><strong>'+esc(isFinite(rsi)?number(rsi,1):'資料不足')+'</strong><span>'+esc(rsiLabel)+' · 技術觀察，不是方向預測</span></div></div>';
      if(isFinite(averages.twenty)&&isFinite(averages.sixty))html+='<p class="taiwan-close-report-analysis-note">均線排列：20 日均線'+(averages.twenty>=averages.sixty?'高於':'低於')+'60 日均線。均線與 RSI 僅描述歷史價格狀態。</p>';
      html+='</section>';
    }else if(analysis.technicalUnavailableReason){html+='<section class="taiwan-close-report-analysis"><h4>📈 技術觀察</h4><p>'+esc(analysis.technicalUnavailableReason)+'</p></section>';}
    if(sectors&&(Array.isArray(sectors.leaders)||Array.isArray(sectors.laggards))){
      function sectorList(items){return (Array.isArray(items)?items:[]).map(function(item){var value=Number(item.changePercent);return '<li><span>'+esc(String(item.name||'').replace(/類指數$/,''))+'</span><strong class="'+(value>0?'up':value<0?'down':'')+'">'+esc(signedPct(value,2))+'</strong></li>';}).join('')||'<li>資料不足</li>';}
      html+='<section class="taiwan-close-report-analysis"><h4>🏭 今日產業強弱 <small>上漲 '+esc(number(sectors.advancing,0))+' · 下跌 '+esc(number(sectors.declining,0))+' · 單日比較</small></h4><div class="taiwan-close-report-sector-grid"><div><strong>相對領先</strong><ul>'+sectorList(sectors.leaders)+'</ul></div><div><strong>相對落後</strong><ul>'+sectorList(sectors.laggards)+'</ul></div></div><p class="taiwan-close-report-analysis-note">'+esc(sectors.note||'僅反映單日類指數表現，不能據此判定持續輪動。')+'</p></section>';
    }
    if(report.mainRisk)html+='<div class="taiwan-close-report-risk"><small>風險與資料限制</small><span>'+esc(report.mainRisk)+'</span></div>';
    if(result&&result.attempt&&result.attempt.message)html+='<div class="taiwan-close-report-risk"><small>今日背景更新狀態</small><span>'+esc(result.attempt.message)+'</span></div>';
    html+='<div class="taiwan-close-report-meta">資料日 '+esc(report.marketDate||'未提供')+' · '+esc(stamp)+'</div>';
    if(Array.isArray(report.sources)&&report.sources.length)html+='<div class="taiwan-close-report-sources">來源：'+report.sources.slice(0,5).map(function(source,index){var url=String(source&&source.url||'');if(!/^https:\/\//i.test(url))return '';return (index?' · ':'')+'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.title||'來源 '+(index+1))+'</a>';}).join('')+'</div>';
    html+='</article>';setCloseReportMarkup_('taiwan',html);
  }
  function refreshTaiwanCloseReport_(){
    var cached=readCache(TAIWAN_CLOSE_REPORT_CACHE_KEY);
    if(cached){var cachedReport=cached.report||{},generated=Date.parse(cachedReport.generatedAt||'');renderTaiwanCloseReport_(cached,cachedReport.marketDate!==taiwanDateToday_()||!isFinite(generated)||Date.now()-generated>24*60*60*1000,'',true);}
    else renderTaiwanCloseReport_(null,false,'',true);
    if(taiwanCloseReportPromise)return taiwanCloseReportPromise;
    taiwanCloseReportPromise=request({action:'warRoomTaiwanCloseReport'},25000).then(function(result){
      if(result&&result.report){writeCache(TAIWAN_CLOSE_REPORT_CACHE_KEY,result);renderTaiwanCloseReport_(result,!!result.stale,result.attempt&&result.attempt.message||'',false);}
      else renderTaiwanCloseReport_(result||null,true,result&&result.attempt&&result.attempt.message||'',false);
      return result;
    }).catch(function(error){renderTaiwanCloseReport_(cached,cached?true:false,error&&error.message||'盤後報告暫時無法讀取',false);return null;}).finally(function(){taiwanCloseReportPromise=null;});
    return taiwanCloseReportPromise;
  }
  function renderUsCloseReport_(result,stale,error,loading){
    var report=result&&result.report,status=report&&report.status||result&&result.status||'pending';
    function number(value,digits){var n=Number(value);return isFinite(n)?n.toLocaleString('zh-TW',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'資料不足';}
    function signed(value,digits,suffix){var n=Number(value);return value==null||value===''||!isFinite(n)?'資料不足':(n>0?'+':'')+number(n,digits)+(suffix||'');}
    var badge=loading?(report?'背景更新中 · 顯示上次報告':'讀取中'):error?(report?'更新失敗 · 顯示上次報告':'更新失敗'):stale?'資料日期較舊':status==='published'?'最近交易日資料':'尚未產生';
    var html='<article class="taiwan-close-report us-close-report"><div class="taiwan-close-report-head"><strong>🇺🇸 美股盤後報告</strong><span>'+esc(badge)+'</span></div>';
    html+='<div class="us-close-report-actions"><span>依 FRED 公開指數資料整理；只描述已公布資料，不作價格預測。</span><button type="button" data-us-close-report-refresh'+(loading?' disabled':'')+'>重新整理</button></div>';
    if(!report){html+='<p>'+(error?esc(error):loading?'正在讀取最近報告並檢查最新可得資料…':'開啟此頁籤後會讀取最近交易日；首次整理可能需要稍候。')+'</p></article>';setCloseReportMarkup_('us',html);return;}
    var indices=Array.isArray(report.indices)?report.indices:[];
    if(indices.length)html+='<div class="taiwan-close-report-index us-close-report-index">'+indices.map(function(item){var change=Number(item.change),tone=isFinite(change)?(change>0?'up':change<0?'down':''):'';return '<div><small>'+esc(item.name||'美股指數')+' 收盤 · '+esc(item.dataDate||report.marketDate||'資料日未提供')+'</small><strong>'+esc(number(item.close,2))+'</strong><small class="'+tone+'">'+esc(signed(item.change,2,' 點'))+' · '+esc(signed(item.changePercent,2,'%'))+'</small></div>';}).join('')+'</div>';
    html+='<h3>'+esc(report.headline||'美股收盤與趨勢整理')+'</h3><p>'+esc(report.summary||'資料不足，暫無摘要。')+'</p>';
    if(report.aiNote)html+='<p class="us-close-report-ai-note">'+esc(report.aiNote)+'</p>';
    if(Array.isArray(report.observations)&&report.observations.length)html+='<ul>'+report.observations.slice(0,4).map(function(item){return '<li>'+esc(item)+'</li>';}).join('')+'</ul>';
    var technical=indices.filter(function(item){return item&&item.technical;});
    if(technical.length){html+='<section class="taiwan-close-report-analysis"><h4>📈 指數技術觀察 <small>依 FRED 日收盤資料計算</small></h4><div class="us-close-report-tech-grid">'+technical.map(function(item){var tech=item.technical||{},ma=tech.closeVsMovingAveragePercent||{};return '<div><strong>'+esc(item.name||'指數')+'</strong><span>短線 5 日 '+esc(signed(tech.fiveSessionReturn,2,'%'))+' · '+esc(ma.twenty==null?'20 日均線資料不足':'收盤'+(Number(ma.twenty)>=0?'高於':'低於')+'20 日均線 '+number(Math.abs(ma.twenty),2)+'%')+'</span><span>中期 20 日 '+esc(signed(tech.twentySessionReturn,2,'%'))+' · 長期 60 日 '+esc(signed(tech.sixtySessionReturn,2,'%'))+'</span></div>';}).join('')+'</div><p class="taiwan-close-report-analysis-note">技術數值僅描述歷史收盤變化，不代表未來方向。</p></section>';}
    if(report.mainRisk)html+='<div class="taiwan-close-report-risk"><small>風險與資料限制</small><span>'+esc(report.mainRisk)+'</span></div>';
    if(error)html+='<div class="taiwan-close-report-risk"><small>更新狀態</small><span>'+esc(error)+'</span></div>';
    html+='<div class="taiwan-close-report-meta">資料日 '+esc(report.marketDate||'未提供')+' · 整理時間 '+esc(report.generatedAt?dateText(report.generatedAt):'未提供')+'</div>';
    if(Array.isArray(report.sources)&&report.sources.length)html+='<div class="taiwan-close-report-sources">來源：'+report.sources.map(function(source,index){var url=String(source&&source.url||'');if(!/^https:\/\//i.test(url))return '';return (index?' · ':'')+'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.title||'來源 '+(index+1))+'</a>';}).join('')+'</div>';
    html+='</article>';setCloseReportMarkup_('us',html);
  }
  function refreshUsCloseReport_(){
    var cached=readCache(US_CLOSE_REPORT_CACHE_KEY);if(cached){var saved=cached.report||{},generated=Date.parse(saved.generatedAt||'');renderUsCloseReport_(cached,!isFinite(generated)||Date.now()-generated>36*60*60*1000,'',true);}else renderUsCloseReport_(null,false,'',true);
    if(usCloseReportPromise)return usCloseReportPromise;
    usCloseReportPromise=post({action:'warRoomUsCloseReportGenerate'},65000).then(function(result){if(result&&result.report){writeCache(US_CLOSE_REPORT_CACHE_KEY,result);renderUsCloseReport_(result,!!result.stale,result.attempt&&result.attempt.message||'',false);}else renderUsCloseReport_(result||null,true,result&&result.attempt&&result.attempt.message||'',false);return result;}).catch(function(error){renderUsCloseReport_(cached,!!cached,error&&error.message||'美股報告暫時無法讀取',false);return null;}).finally(function(){usCloseReportPromise=null;});
    return usCloseReportPromise;
  }
  function warRoomYtdMetric_(data,key){return data&&data.indices&&data.indices[key]||null;}
  function warRoomYtdMetricText_(metric){return metric&&isFinite(Number(metric.maxDrawdownPct))?num(metric.maxDrawdownPct,2)+'%':'資料暫缺';}
  function warRoomYtdDetails_(metric,stale){return metric?'年內收盤高點 '+esc(metric.peakDate||'日期未提供')+' → 後續低點 '+esc(metric.troughDate||'日期未提供')+' · 資料截至 '+esc(metric.dataDate||'日期未提供')+(stale?' · 顯示快照':''):'';}
  function applyWarRoomYtdDrawdown_(data,stale,error){
    var nasdaq=warRoomYtdMetric_(data,'nasdaq100'),host=document.getElementById('nasdaq-ytd-drawdown');
    if(host){host.innerHTML=nasdaq?'<div class="war-ytd-drawdown-value"><span>📉 '+esc(data.year||nasdaq.year||'今年')+' 年最大回撤（收盤）</span><strong>'+esc(warRoomYtdMetricText_(nasdaq))+'</strong></div><small>'+warRoomYtdDetails_(nasdaq,stale)+' · <a href="'+esc(nasdaq.sourceUrl||'https://fred.stlouisfed.org/data/NASDAQ100')+'" target="_blank" rel="noopener noreferrer">'+esc(nasdaq.sourceName||'資料來源')+'</a></small>':'<div class="war-ytd-drawdown-value"><span>📉 今年最大回撤（收盤）</span><strong>資料暫缺</strong></div><small>'+esc(error?'來源暫時無法讀取':'等待資料')+'</small>';}
    document.querySelectorAll('.brief-ytd-drawdown-slot').forEach(function(slot){var metric=warRoomYtdMetric_(data,slot.getAttribute('data-ytd-drawdown'));slot.innerHTML=metric?'<a href="'+esc(metric.sourceUrl||'#')+'" target="_blank" rel="noopener noreferrer" title="'+esc(warRoomYtdDetails_(metric,stale)+' · '+(metric.sourceName||''))+'">今年最大回撤 '+esc(warRoomYtdMetricText_(metric))+'</a>':'<span title="'+esc(error||'年度回撤資料暫缺')+'">今年最大回撤暫缺</span>';});
  }
  function refreshWarRoomYtdDrawdown_(){
    var cached=readCache(WAR_ROOM_YTD_DRAWDOWN_CACHE_KEY);
    if(cached)applyWarRoomYtdDrawdown_(cached,true,'');
    else applyWarRoomYtdDrawdown_(null,false,'');
    if(warRoomYtdDrawdownPromise)return warRoomYtdDrawdownPromise;
    warRoomYtdDrawdownPromise=request({action:'warRoomYtdDrawdown'},25000).then(function(data){writeCache(WAR_ROOM_YTD_DRAWDOWN_CACHE_KEY,data);applyWarRoomYtdDrawdown_(data,!!data.stale,'');return data;}).catch(function(error){applyWarRoomYtdDrawdown_(cached,true,error&&error.message||'年度回撤資料暫缺');return null;}).finally(function(){warRoomYtdDrawdownPromise=null;});
    return warRoomYtdDrawdownPromise;
  }
  function withoutMarketPayload_(payload){var clean=Object.assign({},payload||{});delete clean.market;delete clean.marketDashboard;return clean;}
  function showError(error){if(error&&[401,403].includes(Number(error.status))){setStatus('城門驗證失效','err');renderLogin(error.message||'請重新驗證城門。');return;}setStatus('資料更新失敗','err');var old=content.querySelector('.notice.error');if(old)old.remove();content.insertAdjacentHTML('afterbegin','<div class="notice error">'+esc(error&&error.message||'讀取失敗')+'。若舊快照仍可用，會繼續保留於畫面。</div>');}
  function sectionTitle(text){return '<h2 class="section-title">'+esc(text)+'</h2>';}
  function dashboardCardGroup(title,object){if(!object||typeof object!=='object')return '';var entries=Object.entries(object).filter(function(entry){return entry[1]==null||typeof entry[1]!=='object';});if(!entries.length)return '';return sectionTitle(title)+'<div class="grid">'+entries.slice(0,12).map(function(entry){var val=entry[1];return metric(entry[0],typeof val==='number'?num(val):String(val==null?'資料暫缺':val));}).join('')+'</div>';}
  function renderBrief(payload,stale,skipBackgroundRefresh){
    if(currentTab!=='war-briefing')return;
    payload=withoutMarketPayload_(payload);
    var preservedAsyncMarkup=skipBackgroundRefresh?{
      nasdaq:(document.getElementById('nasdaq-valuation-host')||{}).innerHTML||'',
      twse:(document.getElementById('twse-after-hours-host')||{}).innerHTML||'',
      taiwanClose:(document.getElementById('taiwan-close-report-host')||{}).innerHTML||''
    }:null;
    var displayPayload=payload,macro=payload.macro||payload.macroOverview||{},report=payload.longReport||{};
    var captured=payload.capturedAt||payload.sourceDate||'',judgment=macro.judgment||{},valuations=macro.valuations||{};
    var html='<div class="brief-hero"><div><div class="brief-kicker">ADVISOR WORLD · DAILY INTELLIGENCE</div><h2>🏛 帝國晨報</h2><p>依最近可得的總經資料與估值整理今日狀態；不是投資建議。</p></div><span class="pill">'+(stale?'保留快照':'資料已更新')+'</span></div>';
    if(stale)html+='<div class="notice">背景更新尚未完成，先保留上次成功資料。</div>';
    var riskState=judgment.signal||judgment.scenario||judgment.conclusion||'總經資料待判讀';
    html+='<div class="brief-top-grid brief-top-grid-single"><article class="brief-state"><span>總經風險</span><strong>'+esc(riskState)+'</strong></article></div>';
    var oneLine=judgment.summary||judgment.oneLine||judgment.mainRisk||'目前尚無一句話總經摘要。';
    html+='<section class="brief-insight"><div class="brief-insight-heading"><span>📌 今日一句話戰情</span><small>快照 '+esc(dateText(captured))+'</small></div><p>'+esc(oneLine)+'</p>';
    if(judgment.mainRisk||judgment.suggestion)html+='<div class="brief-guidance">'+(judgment.mainRisk?'<div><small>主要風險</small><strong>'+esc(judgment.mainRisk)+'</strong></div>':'')+(judgment.suggestion?'<div><small>注意事項</small><strong>'+esc(judgment.suggestion)+'</strong></div>':'')+'</div>';
    html+='</section>';
    html+=sectionTitle('🇹🇼 台股盤後報告')+'<div id="taiwan-close-report-host"></div>';
    function valuationCard(title,data,kind){if(!data)return '<article class="valuation-card"><h3>'+title+'</h3><p class="muted">估值資料暫缺</p></article>';var median=kind==='qqq'?(data.historicalMedian||{}).tenYear:(data.historicalPEMedian||{}).tenYear;var fields=kind==='qqq'?[['現價',data.price],['Forward P/E',data.forwardPE==null?null:num(data.forwardPE,2)+'×'],['Forward Earnings',data.forwardEarnings],['10年中位數',median==null?null:num(median,2)+'×']]:[['加權指數',data.index==null?data.price:data.index],['Trailing P/E',data.trailingPE==null?null:num(data.trailingPE,2)+'×'],['P/B',data.pb==null?null:num(data.pb,2)+'×'],['10年中位數',median==null?null:num(median,2)+'×']];return '<article class="valuation-card"><h3>'+title+'</h3><div class="valuation-values">'+fields.map(function(field){return '<div><small>'+esc(field[0])+'</small><strong>'+esc(field[1]==null?'資料暫缺':field[1])+'</strong></div>';}).join('')+'</div><p class="metric-label">'+esc(data.dataDate||data.priceDate||'資料日期暫缺')+' · '+esc(data.source||'來源未提供')+'</p><p class="valuation-judgment">'+esc(data.judgment||data.status||'以目前估值和歷史中位數比較，不是價格預測。')+'</p></article>';}
    if(valuations.qqq)html+='<details class="brief-compact-details"><summary>其他估值參考：QQQ</summary><div class="brief-compact-inner"><div class="brief-valuations">'+valuationCard('📡 QQQ 動態估值',valuations.qqq,'qqq')+'</div></div></details>';
    html+=sectionTitle('NASDAQ-100 估值')+'<div id="nasdaq-valuation-host"></div>';
    html+='<div id="twse-after-hours-host"></div>';
    var indicators=Array.isArray(macro.indicators)?macro.indicators:[],values=macro.values||{};
    function findIndicator(code){return indicators.find(function(item){return item&&item.code===code;})||(values[code]!=null?{code:code,value:values[code],displayValue:String(values[code])}:null);}
    function indicatorValue(row){if(!row)return '資料暫缺';var value=row.displayValue||(row.value==null?'':num(row.value));return (row.status&&row.status!=='資料'?String(row.status)+' · ':'')+(value||'資料暫缺');}
    var groups=[['💧 流動性',[['SOFR–IORB','sofrIorbSpread'],['銀行準備金','bankReserves'],['隔夜逆回購','rrp'],['M2','m2']]],['👷 就業',[['JOLTS 職缺','joltsOpenings'],['ADP 就業','adpEmploymentChange'],['非農就業','nfpPayrollChange']]],['🔥 通膨',[['CPI','cpi'],['PPI','ppi'],['油價','oil']]],['💳 市場壓力',[['信用利差','creditSpread'],['VIX','vix'],['消費信心','consumerSentiment']]]];
    var macroIndicatorCount=groups.reduce(function(total,group){return total+group[1].length;},0);
    html+=sectionTitle('總經燈號')+'<p class="metric-label">指標資料日 '+esc(macro.sourceDate||'資料日期未提供')+'</p><div class="brief-macro-overview">'+groups.map(function(group){return '<span>'+group[0]+'</span>';}).join('')+'</div><details class="brief-compact-details"><summary>展開完整總經指標（'+macroIndicatorCount+' 項）</summary><div class="brief-compact-inner brief-macro-grid">'+groups.map(function(group){return '<article class="brief-macro-card"><h3>'+group[0]+'</h3>'+group[1].map(function(item){var row=findIndicator(item[1]),tone=/紅|警戒|防守|惡化/.test(String(row&&row.status||''))?'down':/綠|改善|充足/.test(String(row&&row.status||''))?'up':'';return '<div class="brief-indicator"><span>'+esc(item[0])+'</span><strong class="'+tone+'">'+esc(indicatorValue(row))+'</strong></div>';}).join('')+'</article>';}).join('')+'</div></details>';
    if(report.latest||report.summary)html+=sectionTitle('長期觀察')+'<details class="brief-compact-details"><summary>展開 30 日長期觀察</summary><div class="brief-compact-inner brief-report">'+esc((report.latest&&report.latest.summary)||report.summary||'')+'</div></details>';
    html+=rawDetails('完整快照資料',displayPayload);
    content.innerHTML=html;
    if(preservedAsyncMarkup){
      var nasdaqHost=document.getElementById('nasdaq-valuation-host');
      if(nasdaqHost&&preservedAsyncMarkup.nasdaq)nasdaqHost.innerHTML=preservedAsyncMarkup.nasdaq;
      var twseHost=document.getElementById('twse-after-hours-host');if(twseHost&&preservedAsyncMarkup.twse)twseHost.innerHTML=preservedAsyncMarkup.twse;
      var closeReportHost=document.getElementById('taiwan-close-report-host');if(closeReportHost&&preservedAsyncMarkup.taiwanClose)closeReportHost.innerHTML=preservedAsyncMarkup.taiwanClose;
    }
    setFreshness(captured?'快照時間 '+dateText(captured):'以目前可取得的快照呈現');
    if(!skipBackgroundRefresh){refreshNasdaqValuation_();refreshTwseAfterHours_();refreshTaiwanValuation_(valuations.taiex,stale);refreshWarRoomYtdDrawdown_();refreshTaiwanCloseReport_();}
  }
  async function loadBriefing(force){
    var cacheKey='wealth_advisor_world_nas_v1',cached=readCache(cacheKey),cacheMacro=readCache('wealth_market_macro_v4');
    function hasMacroLightData(macro){var codes=['sofrIorbSpread','bankReserves','rrp','m2','joltsOpenings','adpEmploymentChange','nfpPayrollChange','cpi','ppi','oil','creditSpread','vix','consumerSentiment'],indicators=macro&&Array.isArray(macro.indicators)?macro.indicators:[];if(indicators.length)return codes.some(function(code){var item=indicators.find(function(row){return row&&row.code===code;});return !!(item&&((item.value!=null&&item.value!=='')||(item.displayValue&&item.displayValue!=='--')));});var values=macro&&macro.values||{};return codes.some(function(code){return values[code]!=null&&values[code]!=='';});}
    var unusableMacroCache=!!((cached&&!hasMacroLightData(cached.macro||cached.macroOverview))||(cacheMacro&&!hasMacroLightData(cacheMacro)));
    if(!force&&cached){cached=withoutMarketPayload_(cached);writeCache(cacheKey,cached);renderBrief(cached,true);setFreshness('顯示保存快照 · '+dateText(cached.capturedAt));}
    else if(!force&&cacheMacro){renderBrief({macro:cacheMacro,capturedAt:new Date().toISOString()},true);}
    content.insertAdjacentHTML('afterbegin',cached||cacheMacro?'':'<div class="loading"><span class="spinner"></span> 正在調閱帝國晨報…</div>');
    try{
      var nasToken=localStorage.getItem('arkos26.wall.readToken')||'',headers=nasToken?{authorization:'Bearer '+nasToken}:{};
      var response=await fetch('https://api.ark-os26.cc/api/finance/battle-brief-snapshots?range=1d&snapshotType=advisor-world-brief',{headers:headers,cache:'no-store',signal:AbortSignal.timeout(10000)});
      if(response.ok){var nas=await response.json(),records=(nas.records||[]).filter(function(row){var meta=row.metadata||{};return !!meta.macroOverview;}).sort(function(a,b){return String(a.capturedAt||'').localeCompare(String(b.capturedAt||''));});if(records.length){var rec=records[records.length-1],meta=rec.metadata,payload={macro:meta.macroOverview,longReport:meta.longReport||null,capturedAt:rec.capturedAt,sourceDate:rec.sourceDate};writeCache(cacheKey,payload);renderBrief(payload,false);var time=Date.parse(payload.capturedAt||'');if(hasMacroLightData(payload.macro)&&isFinite(time)&&Date.now()-time<6*60*60*1000)return;unusableMacroCache=!hasMacroLightData(payload.macro);}}
    }catch(e){/* API fallback below */}
    if(!unusableMacroCache)try{var fresh=await request({action:'advisorWorldBriefSnapshotRefresh'},60000);if(fresh&&fresh.snapshot){var cleanSnapshot=withoutMarketPayload_(fresh.snapshot);writeCache(cacheKey,cleanSnapshot);renderBrief(cleanSnapshot,false);return;}}catch(e){/* Direct source fallback below */}
    try{var results=await Promise.allSettled([request({action:'macroOverview'}),request({action:'macroLongReport'})]);if(results[0].status==='rejected'&&results[1].status==='rejected')throw new Error('總經資料讀取失敗');var payload={macro:results[0].status==='fulfilled'?results[0].value:cacheMacro||{},longReport:results[1].status==='fulfilled'?results[1].value:null,capturedAt:new Date().toISOString()};writeCache(cacheKey,payload);renderBrief(payload,false);if(!hasMacroLightData(payload.macro)){var macroError=results[0].status==='rejected'?results[0].reason:null,macroStatus=macroError&&macroError.status?'HTTP '+macroError.status:'來源未回傳有效數值';content.insertAdjacentHTML('afterbegin','<div class="notice error">總經燈號尚未取得有效指標：'+esc(macroStatus)+' · 資料日 '+esc(payload.macro&&payload.macro.sourceDate||'未提供')+'。畫面保留來源日期，請勿視為最新指標。</div>');}}
    catch(error){if(currentTab!=='war-briefing')return;if(cached||cacheMacro){renderBrief(cached||{macro:cacheMacro||{}},true);showError(error);}else{content.innerHTML='<div class="empty">帝國晨報讀取失敗：'+esc(error.message)+'</div>';showError(error);}}
  }
  function selectTab(tab,force){if(!tabs[tab])tab='war-briefing';var previousTab=currentTab;currentTab=tab;document.querySelectorAll('.tabs button').forEach(function(button){button.classList.toggle('active',button.dataset.tab===tab);});document.getElementById('page-title').textContent=tabs[tab].title;history.replaceState(null,'','?tab='+encodeURIComponent(tab));if(!force&&previousTab===tab&&lastLoaded[tab])return;lastLoaded[tab]=true;tabs[tab].load(!!force).catch(function(error){if(currentTab===tab)showError(error);});}
  document.querySelector('.tabs').addEventListener('click',function(event){var button=event.target.closest('button[data-tab]');if(button&&this.contains(button))selectTab(button.dataset.tab,false);});
  document.getElementById('refresh-button').onclick=async function(){if(busy)return;busy=true;this.disabled=true;try{if(await authorize())selectTab(currentTab,true);}finally{busy=false;this.disabled=false;}};
  window.addEventListener('storage',function(event){if(event.key==='wealth_write_token'||event.key==='wealth_api_url'){API_URL=normalizeApi(localStorage.getItem('wealth_api_url'))||API_DEFAULT;setStatus('設定已更新','ok');}});
  var selected=new URLSearchParams(location.search).get('tab')||'war-briefing';if(!tabs[selected]){selected='war-briefing';history.replaceState(null,'','?tab=war-briefing');}currentTab=selected;document.querySelector('[data-tab="'+selected+'"]').classList.add('active');document.getElementById('page-title').textContent=tabs[selected].title;
  authorize().then(function(ok){if(ok){setStatus('城門已連線','ok');startSessionRefresh();selectTab(selected,true);}});
})();
