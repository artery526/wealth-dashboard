(function(){
  var growthState={data:null,busy:false,message:'',error:false,dataVersion:0,readRequestId:0,historyDate:''};
  var growthCategories=['健康','學習','生活','人際'];
  var growthAttribute={健康:'活力',學習:'專注',生活:'紀律',人際:'連結感'};

  function growthToday(){
    var parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    var values={};parts.forEach(function(part){if(part.type!=='literal')values[part.type]=part.value;});
    return values.year+'-'+values.month+'-'+values.day;
  }
  function growthHistoryStartDate(){var date=new Date(growthToday()+'T12:00:00+08:00');date.setDate(date.getDate()-89);return date.toISOString().slice(0,10);}
  function growthEscape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function growthLevel(total){
    var level=1,floor=0,next=10;
    while(total>=next){level++;floor=next;next+=5*(level-1);}
    return {level:level,floor:floor,next:next,progress:Math.max(0,Math.min(100,(total-floor)/(next-floor)*100)),remaining:Math.max(0,next-total)};
  }
  function growthStatus(message,isError){growthState.message=message||'';growthState.error=!!isError;}
  function growthEventsForToday(){
    var today=growthToday();var result={};
    (growthState.data&&growthState.data.events||[]).forEach(function(event){if(event.date===today&&event.done)result[event.taskId]=true;});
    return result;
  }
  function growthRenderMessage(){
    if(!growthState.message)return '';
    return '<div class="dg-message'+(growthState.error?' is-error':'')+'" role="status">'+growthEscape(growthState.message)+'</div>';
  }
  function growthRender(){
    var body=document.getElementById('p-body');if(!body)return;
    if(!growthState.data){body.innerHTML='<div class="dg-page">'+growthRenderMessage()+'</div>';return;}
    var data=growthState.data,tasks=data.tasks||[],events=data.events||[],today=growthToday(),todayDone=growthEventsForToday(),level=growthLevel(Number(data.totalXp)||0);
    var historyDate=growthState.historyDate||today;
    if(historyDate>today||historyDate<growthHistoryStartDate())historyDate=today;
    var doneCount=events.filter(function(event){return event.date===today&&event.done;}).length;
    var attributeNames=['活力','專注','紀律','連結感'];
    var availableTasks=tasks.filter(function(task){return !todayDone[task.id];});
    var completedTasks=tasks.filter(function(task){return !!todayDone[task.id];});
    var taskHtml=availableTasks.length?availableTasks.map(function(task){
      return '<article class="dg-task">'
        +'<button class="dg-check" type="button" '+(growthState.busy?'disabled':'')+' onclick="toggleDailyGrowthCompletion(\''+growthEscape(task.id)+'\',true)" aria-label="完成'+growthEscape(task.name)+'"></button>'
        +'<div><div class="dg-task-name">'+growthEscape(task.name)+'</div><div class="dg-task-meta">'+growthEscape(task.category)+' · 培養 '+growthEscape(task.attribute||growthAttribute[task.category]||'紀律')+'</div></div>'
        +'<span class="dg-task-xp">+1 經驗</span></article>';
    }).join(''):(tasks.length?'<div class="dg-empty">今天的成就都完成了，做得好！</div>':'<div class="dg-empty">還沒有成就，新增一項今天想完成的小事吧。</div>');
    var completedTaskHtml=completedTasks.length?completedTasks.map(function(task){
      return '<article class="dg-task is-done">'
        +'<span class="dg-check" aria-hidden="true">✓</span>'
        +'<div><div class="dg-task-name">'+growthEscape(task.name)+'</div><div class="dg-task-meta">'+growthEscape(task.category)+' · 培養 '+growthEscape(task.attribute||growthAttribute[task.category]||'紀律')+'</div></div>'
        +'<span class="dg-task-xp">已完成 · +1 經驗</span></article>';
    }).join(''):'<div class="dg-empty">今天還沒有完成的成就。</div>';
    var attributes=data.attributes||{};
    var attributeHtml=attributeNames.map(function(name){var value=Number(attributes[name])||0;return '<div class="dg-attribute"><div class="dg-attribute-name">'+name+'</div><div class="dg-attribute-track"><span style="width:'+Math.min(100,value*5)+'%"></span></div><div class="dg-attribute-value">'+value+'</div></div>';}).join('');
    var week=[];for(var i=6;i>=0;i--){var date=new Date(new Date(today+'T12:00:00+08:00').getTime()-i*86400000);week.push(date.toISOString().slice(0,10));}
    var weekCounts=week.map(function(date){return events.filter(function(event){return event.date===date&&event.done;}).length;});
    var maxCount=Math.max.apply(Math,[1].concat(weekCounts));
    var historyHtml=week.map(function(date,index){var height=weekCounts[index]?Math.max(12,weekCounts[index]/maxCount*100):5;return '<div class="dg-day"><div class="dg-day-bar-wrap"><span class="dg-day-bar" style="height:'+height+'%" title="'+date+' 完成 '+weekCounts[index]+' 項"></span></div><span class="dg-day-label">'+Number(date.slice(8,10))+'日</span></div>';}).join('');
    var historyDone=events.filter(function(event){return event.date===historyDate&&event.done;});
    var taskById={};tasks.forEach(function(task){taskById[task.id]=task;});
    var historyTaskHtml=historyDone.length?historyDone.map(function(event){
      var task=taskById[event.taskId],name=task?task.name:'已完成的成就',category=task?task.category:'';
      return '<article class="dg-task is-done"><span class="dg-check" aria-hidden="true">✓</span><div><div class="dg-task-name">'+growthEscape(name)+'</div>'+(category?'<div class="dg-task-meta">'+growthEscape(category)+'</div>':'')+'</div><span class="dg-task-xp">+1 經驗</span></article>';
    }).join(''):'<div class="dg-empty">這一天沒有完成紀錄。</div>';
    body.innerHTML='<div class="dg-page">'
      +growthRenderMessage()
      +'<section class="dg-hero"><div><div class="dg-eyebrow">YOUR LITTLE ADVENTURE · 每一步都算數</div><div class="dg-greeting">今天也為自己種下一點成長</div><div class="dg-date">'+today.replace(/-/g,' / ')+'　·　完成 '+doneCount+' 項今日成就</div></div>'
      +'<div class="dg-level"><div class="dg-level-badge"><span aria-hidden="true">🌱</span> Lv. '+level.level+' 新芽冒險者</div><div class="dg-xp-line">累積 '+(Number(data.totalXp)||0)+' 經驗 · 下一級還差 '+level.remaining+' 點</div><div class="dg-progress" aria-label="升級進度"><span style="width:'+level.progress+'%"></span></div></div></section>'
      +'<div class="dg-layout"><section class="dg-card"><div class="dg-card-head"><div><div class="dg-card-title">☀️ 今日成就</div><div class="dg-card-note">完成一項，累積 1 點經驗與對應屬性</div></div><span class="dg-count">'+doneCount+' / '+tasks.length+' 完成</span></div>'
      +'<div class="dg-task-list">'+taskHtml+'</div>'
      +'<section class="dg-completed"><div class="dg-completed-head"><span>✅ 今日已完成</span><span>'+completedTasks.length+' 項</span></div><div class="dg-task-list">'+completedTaskHtml+'</div></section>'
      +'<form class="dg-add-form" onsubmit="submitDailyGrowthTask(event)"><input class="dg-input" id="dg-new-task" maxlength="40" placeholder="新增一件想完成的小事" aria-label="新增成就名稱" required><select class="dg-select" id="dg-new-category" aria-label="成就分類">'+growthCategories.map(function(category){return '<option value="'+category+'">'+category+' · '+growthAttribute[category]+'</option>';}).join('')+'</select><button class="dg-button" type="submit" '+(growthState.busy?'disabled':'')+'>＋ 新增成就</button></form>'
      +'</section><aside class="dg-side"><section class="dg-card"><div class="dg-card-head"><div><div class="dg-card-title">🌼 主角屬性</div><div class="dg-card-note">每次完成都會累積對應成長</div></div></div><div class="dg-attributes">'+attributeHtml+'</div></section>'
      +'<section class="dg-card"><div class="dg-card-head"><div><div class="dg-card-title">📅 最近七日</div><div class="dg-card-note">每日完成成就數</div></div></div><div class="dg-history">'+historyHtml+'</div><div class="dg-history-note">這週累積 '+weekCounts.reduce(function(sum,value){return sum+value;},0)+' 點經驗</div><div class="dg-history-picker"><label for="dg-history-date">查看日期明細</label><input class="dg-input" id="dg-history-date" type="date" min="'+growthHistoryStartDate()+'" max="'+today+'" value="'+growthEscape(historyDate)+'" onchange="selectDailyGrowthHistory(this.value)"></div><div class="dg-history-selected">'+historyDate.replace(/-/g,' / ')+'　·　完成 '+historyDone.length+' 項</div><div class="dg-task-list">'+historyTaskHtml+'</div></section></aside></div></div>';
  }
  async function growthLoad(){
    if(!API_URL){growthStatus('尚未設定網站 API，請先完成城門設定。',true);growthRender();return;}
    var requestId=++growthState.readRequestId,dataVersion=growthState.dataVersion;
    growthStatus(growthState.data?'正在同步最新成長紀錄…':'正在整理你的成長紀錄…',false);growthRender();
    try{
      var latest=await apiGet({action:'dailyGrowth'},20000);
      if(requestId!==growthState.readRequestId||dataVersion!==growthState.dataVersion)return;
      growthState.data=latest;growthStatus('',false);growthRender();
    }catch(error){
      if(requestId!==growthState.readRequestId||dataVersion!==growthState.dataVersion)return;
      growthStatus('讀取成長紀錄失敗：'+(error&&error.message||'請稍後重試'),true);growthRender();
    }
  }
  window.renderDailyGrowthPanel=function(){
    setPanelHead('🌱','Daily Growth · Little Steps','每日成長');
    var extra=document.getElementById('p-extra');if(extra)extra.innerHTML='<button class="store-header-date-button" type="button" onclick="refreshDailyGrowth()" aria-label="重新整理成長紀錄" title="重新整理">↻</button>';
    var body=document.getElementById('p-body');if(body)body.innerHTML='<div class="dg-page"><div class="dg-message">正在打開每日成長…</div></div>';
    growthLoad();
  };
  window.refreshDailyGrowth=function(){growthLoad();};
  window.selectDailyGrowthHistory=function(value){
    var date=String(value||''),today=growthToday();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today||date<growthHistoryStartDate())return;
    growthState.historyDate=date;growthRender();
  };
  window.toggleDailyGrowthCompletion=async function(taskId,done){
    if(growthState.busy)return;growthState.busy=true;growthRender();
    try{
      await apiGet({action:'dailyGrowthSetCompletion',date:growthToday(),taskId:taskId,done:done?'true':'false'},apiWriteTimeoutMs('dailyGrowthSetCompletion'));
      growthState.dataVersion++;
      var readRequestId=++growthState.readRequestId,writeDataVersion=growthState.dataVersion;
      var data=growthState.data,today=growthToday(),events=data.events||(data.events=[]),eventIndex=events.findIndex(function(event){return event.date===today&&event.taskId===taskId;}),wasDone=eventIndex>=0&&events[eventIndex].done===true;
      if(eventIndex>=0)events[eventIndex].done=!!done;
      else events.push({date:today,taskId:taskId,done:!!done});
      if(!!done!==wasDone){
        data.totalXp=Math.max(0,(Number(data.totalXp)||0)+(done?1:-1));
        var task=(data.tasks||[]).find(function(item){return item.id===taskId;}),attribute=task&&(task.attribute||growthAttribute[task.category]);
        if(attribute){data.attributes=data.attributes||{};data.attributes[attribute]=Math.max(0,(Number(data.attributes[attribute])||0)+(done?1:-1));}
      }
      growthStatus(done?'成就已記錄，正在更新總覽…':'已取消這項成就，正在更新總覽…',false);growthRender();
      try{
        var latest=await apiGet({action:'dailyGrowth'},20000);
        var latestHasCompletion=(latest.events||[]).some(function(event){return event.date===today&&event.taskId===taskId&&event.done===true;});
        if(readRequestId===growthState.readRequestId&&writeDataVersion===growthState.dataVersion){
          if(done===latestHasCompletion){growthState.data=latest;growthStatus(done?'完成一項，經驗與屬性已更新 🌱':'已取消這項成就，經驗同步調整。',false);}
          else growthStatus('成就已記錄，清單正在同步中…',false);
        }
      }
      catch(readError){if(readRequestId===growthState.readRequestId&&writeDataVersion===growthState.dataVersion)growthStatus('成就已記錄；統計同步暫時失敗，稍後可按重新整理。',true);}
    }
    catch(error){growthStatus('記錄失敗：'+(error&&error.message||'請稍後重試'),true);}
    finally{growthState.busy=false;growthRender();}
  };
  window.submitDailyGrowthTask=async function(event){
    if(event&&event.preventDefault)event.preventDefault();
    var input=document.getElementById('dg-new-task'),select=document.getElementById('dg-new-category');
    var name=String(input&&input.value||'').trim(),category=String(select&&select.value||'');
    if(!name||growthState.busy)return;
    growthState.busy=true;growthRender();
    try{await apiGet({action:'dailyGrowthTaskCreate',name:name,category:category},20000);growthStatus('新成就已加入清單。',false);growthState.data=await apiGet({action:'dailyGrowth'},20000);}
    catch(error){growthStatus('新增失敗：'+(error&&error.message||'請稍後重試'),true);}
    finally{growthState.busy=false;growthRender();}
  };
})();
