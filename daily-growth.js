(function(){
  var growthState={data:null,busy:false,message:'',error:false,dataVersion:0,readRequestId:0,historyDate:'',calendarMonth:'',activeTab:'growth',mealMonth:'',mealData:null,mealDate:'',mealBusy:false,mealRequestId:0};
  var growthCacheKey='daily-growth-cache-v1';
  var growthCategories=['健康','學習','生活','人際'];
  var growthAttribute={健康:'活力',學習:'專注',生活:'紀律',人際:'連結感'};

  function growthToday(){
    var parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    var values={};parts.forEach(function(part){if(part.type!=='literal')values[part.type]=part.value;});
    return values.year+'-'+values.month+'-'+values.day;
  }
  function growthHistoryStartDate(){var date=new Date(growthToday()+'T12:00:00+08:00');date.setDate(date.getDate()-89);return date.toISOString().slice(0,10);}
  function growthMonthShift(month,delta){var parts=month.split('-').map(Number),date=new Date(Date.UTC(parts[0],parts[1]-1+delta,1));return date.getUTCFullYear()+'-'+String(date.getUTCMonth()+1).padStart(2,'0');}
  function growthRenderCalendar(historyDate,today,events){
    var month=growthState.calendarMonth||historyDate.slice(0,7),parts=month.split('-').map(Number),year=parts[0],monthNumber=parts[1];
    var firstDay=new Date(Date.UTC(year,monthNumber-1,1)).getUTCDay(),daysInMonth=new Date(Date.UTC(year,monthNumber,0)).getUTCDate();
    var startDate=growthHistoryStartDate(),firstMonth=startDate.slice(0,7),lastMonth=today.slice(0,7),counts={};
    events.forEach(function(event){if(event.done)counts[event.date]=(counts[event.date]||0)+1;});
    var cells='';for(var blank=0;blank<firstDay;blank++)cells+='<span class="dg-cal-blank" aria-hidden="true"></span>';
    for(var day=1;day<=daysInMonth;day++){
      var date=year+'-'+String(monthNumber).padStart(2,'0')+'-'+String(day).padStart(2,'0'),count=counts[date]||0,available=date>=startDate&&date<=today;
      var classes='dg-cal-day'+(date===historyDate?' is-selected':'')+(date===today?' is-today':'')+(count?' has-achievement':'');
      cells+='<button class="'+classes+'" type="button" '+(available?'':'disabled')+' onclick="selectDailyGrowthCalendarDate(\''+date+'\')" aria-label="'+date+'，完成 '+count+' 項" title="'+date+' · 完成 '+count+' 項"><span>'+day+'</span>'+(count?'<small>'+count+'</small>':'')+'</button>';
    }
    return '<section class="dg-card dg-calendar-card"><div class="dg-cal-head"><button class="dg-cal-nav" type="button" '+(month<=firstMonth?'disabled':'')+' onclick="changeDailyGrowthCalendarMonth(-1)" aria-label="上一個月">‹</button><div><div class="dg-card-title">🗓️ 成長月曆</div><div class="dg-card-note">點日期查看當天成就</div></div><strong>'+year+' 年 '+monthNumber+' 月</strong><button class="dg-cal-nav" type="button" '+(month>=lastMonth?'disabled':'')+' onclick="changeDailyGrowthCalendarMonth(1)" aria-label="下一個月">›</button></div><div class="dg-calendar-grid dg-weekdays">'+['日','一','二','三','四','五','六'].map(function(day){return '<span>'+day+'</span>';}).join('')+'</div><div class="dg-calendar-grid">'+cells+'</div><div class="dg-cal-legend"><span><i></i>已完成成就</span><span>目前查看：'+historyDate.replace(/-/g,' / ')+'</span></div></section>';
  }
  function growthEscape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char];});}
  function growthReadCache(){
    try{var cached=JSON.parse(localStorage.getItem(growthCacheKey)||'null');if(cached&&cached.version===1&&cached.data&&Array.isArray(cached.data.tasks)&&Array.isArray(cached.data.events))return cached.data;}catch(ignore){}
    return null;
  }
  function growthWriteCache(data){
    try{localStorage.setItem(growthCacheKey,JSON.stringify({version:1,savedAt:Date.now(),data:data}));}catch(ignore){}
  }
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
  function growthTabsHtml(){
    return '<nav class="dg-tabs" aria-label="每日成長分頁"><button type="button" class="dg-tab'+(growthState.activeTab==='growth'?' is-active':'')+'" aria-current="'+(growthState.activeTab==='growth'?'page':'false')+'" onclick="selectDailyGrowthTab(\'growth\')">🌱 每日成長</button><button type="button" class="dg-tab'+(growthState.activeTab==='meals'?' is-active':'')+'" aria-current="'+(growthState.activeTab==='meals'?'page':'false')+'" onclick="selectDailyGrowthTab(\'meals\')">🍳 三餐自煮</button></nav>';
  }
  function growthMealsCacheKey(month){return 'daily-growth-meals-v1-'+month;}
  function growthReadMealsCache(month){
    try{var cached=JSON.parse(localStorage.getItem(growthMealsCacheKey(month))||'null');if(cached&&cached.version===1&&cached.data&&cached.data.month===month&&Array.isArray(cached.data.meals))return cached.data;}catch(ignore){}
    return null;
  }
  function growthWriteMealsCache(data){try{localStorage.setItem(growthMealsCacheKey(data.month),JSON.stringify({version:1,savedAt:Date.now(),data:data}));}catch(ignore){}}
  function growthMealMonthShift(month,delta){return growthMonthShift(month,delta);}
  function growthMealRender(){
    var month=growthState.mealMonth||growthToday().slice(0,7),parts=month.split('-').map(Number),year=parts[0],monthNum=parts[1],today=growthToday();
    var firstDay=new Date(Date.UTC(year,monthNum-1,1)).getUTCDay(),days=new Date(Date.UTC(year,monthNum,0)).getUTCDate(),counts={},byMeal={breakfast:0,lunch:0,dinner:0};
    (growthState.mealData&&growthState.mealData.meals||[]).forEach(function(item){if(item.homeCooked){counts[item.date]=(counts[item.date]||0)+1;if(Object.prototype.hasOwnProperty.call(byMeal,item.meal))byMeal[item.meal]++;}});
    var selected=growthState.mealDate||((month===today.slice(0,7))?today:(month+'-'+String(days).padStart(2,'0')));
    if(selected.slice(0,7)!==month||selected>today)selected=(month===today.slice(0,7))?today:(month+'-'+String(days).padStart(2,'0'));
    growthState.mealDate=selected;
    var cells='';for(var blank=0;blank<firstDay;blank++)cells+='<span class="dg-cal-blank" aria-hidden="true"></span>';
    for(var day=1;day<=days;day++){
      var date=month+'-'+String(day).padStart(2,'0'),count=counts[date]||0,disabled=date>today;
      cells+='<button type="button" class="dg-cal-day'+(date===selected?' is-selected':'')+(date===today?' is-today':'')+(count?' has-achievement':'')+'" '+(disabled?'disabled':'')+' onclick="selectDailyMealDate(\''+date+'\')" aria-label="'+date+'，自煮 '+count+' 餐" title="'+date+' · 自煮 '+count+' 餐"><span>'+day+'</span>'+(count?'<small>'+count+'</small>':'')+'</button>';
    }
    var options=[['breakfast','早餐','🌅'],['lunch','午餐','☀️'],['dinner','晚餐','🌙']],records={};
    (growthState.mealData&&growthState.mealData.meals||[]).forEach(function(item){if(item.date===selected)records[item.meal]=!!item.homeCooked;});
    var mealRows=options.map(function(option){var checked=!!records[option[0]];return '<div class="dg-meal-row'+(checked?' is-cooked':'')+'"><div class="dg-meal-row-label"><span aria-hidden="true">'+option[2]+'</span><div><strong>'+option[1]+'</strong><small>'+selected.replace(/-/g,' / ')+'</small></div></div><span class="dg-meal-toggle'+(checked?' is-on':'')+'">'+(checked?'✓ 自己煮':'未記錄')+'</span></div>';}).join('');
    var total=byMeal.breakfast+byMeal.lunch+byMeal.dinner,next=month>=today.slice(0,7);
    return '<section class="dg-card dg-meals-card"><div class="dg-card-head"><div><div class="dg-card-title">🍳 每日三餐自煮</div><div class="dg-card-note">選擇日期，查看早餐、午餐與晚餐紀錄</div></div></div><div class="dg-month-summary"><div class="dg-month-total"><strong>'+total+'</strong><span>本月自煮餐次</span></div><div class="dg-month-breakdown"><span>🌅 早餐 <b>'+byMeal.breakfast+'</b></span><span>☀️ 午餐 <b>'+byMeal.lunch+'</b></span><span>🌙 晚餐 <b>'+byMeal.dinner+'</b></span></div></div><section class="dg-card dg-calendar-card dg-meal-calendar"><div class="dg-cal-head"><button class="dg-cal-nav" type="button" onclick="changeDailyMealMonth(-1)" aria-label="上一個月">‹</button><div><div class="dg-card-title">🗓️ 每月紀錄</div><div class="dg-card-note">點選日期查看餐次</div></div><strong>'+year+' 年 '+monthNum+' 月</strong><button class="dg-cal-nav" type="button" '+(next?'disabled':'')+' onclick="changeDailyMealMonth(1)" aria-label="下一個月">›</button></div><div class="dg-calendar-grid dg-weekdays">'+['日','一','二','三','四','五','六'].map(function(day){return '<span>'+day+'</span>';}).join('')+'</div><div class="dg-calendar-grid">'+cells+'</div><div class="dg-cal-legend"><span><i></i>自煮餐次</span><span>本月共 '+total+' 餐</span></div></section><div class="dg-meal-list">'+mealRows+'</div></section>';
  }
  function growthRender(){
    var body=document.getElementById('p-body');if(!body)return;
    if(growthState.activeTab==='meals'){
      body.innerHTML='<div class="dg-page">'+growthTabsHtml()+growthRenderMessage()+(growthState.mealData?growthMealRender():'<div class="dg-message">載入本月三餐紀錄中…</div>')+'</div>';
      return;
    }
    if(!growthState.data){body.innerHTML='<div class="dg-page">'+growthTabsHtml()+growthRenderMessage()+'</div>';return;}
    var data=growthState.data,tasks=data.tasks||[],events=data.events||[],today=growthToday(),todayDone=growthEventsForToday(),level=growthLevel(Number(data.totalXp)||0);
    var historyDate=growthState.historyDate||today;
    if(historyDate>today||historyDate<growthHistoryStartDate())historyDate=today;
    var doneCount=events.filter(function(event){return event.date===today&&event.done;}).length;
    var attributeNames=['活力','專注','紀律','連結感'];
    var taskHtml=tasks.length?tasks.map(function(task){
      var done=!!todayDone[task.id];
      return '<article class="dg-task'+(done?' is-done':'')+'">'
        +'<span class="dg-check" aria-hidden="true">'+(done?'✓':'')+'</span>'
        +'<div><div class="dg-task-name">'+growthEscape(task.name)+'</div><div class="dg-task-meta">'+growthEscape(task.category)+' · 培養 '+growthEscape(task.attribute||growthAttribute[task.category]||'紀律')+'</div></div>'
        +'<span class="dg-task-xp">'+(done?'已完成':'今日待完成')+'</span></article>';
    }).join(''):'<div class="dg-empty">還沒有成就紀錄。</div>';
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
    var notes=data.notes||[];
    var notesHtml=notes.length?notes.slice(0,10).map(function(note){return '<article class="dg-note-row"><time>'+growthEscape(note.date)+'</time><div>'+growthEscape(note.content).replace(/\r?\n/g,'<br>')+'</div></article>';}).join(''):'<div class="dg-empty">還沒有文字紀錄。</div>';
    body.innerHTML='<div class="dg-page">'+growthTabsHtml()
      +growthRenderMessage()
      +'<section class="dg-hero"><div><div class="dg-eyebrow">YOUR LITTLE ADVENTURE · 每一步都算數</div><div class="dg-greeting">今天也為自己種下一點成長</div><div class="dg-date">'+today.replace(/-/g,' / ')+'　·　完成 '+doneCount+' 項今日成就</div></div>'
      +'<div class="dg-level"><div class="dg-level-badge"><span aria-hidden="true">🌱</span> Lv. '+level.level+' 新芽冒險者</div><div class="dg-xp-line">累積 '+(Number(data.totalXp)||0)+' 經驗 · 下一級還差 '+level.remaining+' 點</div><div class="dg-progress" aria-label="升級進度"><span style="width:'+level.progress+'%"></span></div></div></section>'
      +'<div class="dg-layout"><section class="dg-card"><div class="dg-card-head"><div><div class="dg-card-title">☀️ 今日成就</div><div class="dg-card-note">完成一項，累積 1 點經驗與對應屬性</div></div><span class="dg-count">'+doneCount+' / '+tasks.length+' 完成</span></div>'
      +'<div class="dg-task-list">'+taskHtml+'</div>'
      +'<section class="dg-notes-readonly"><div class="dg-completed-head"><span>📝 最近文字紀錄</span><span>共 '+notes.length+' 則</span></div><div class="dg-note-list">'+notesHtml+'</div></section>'
      +'<div class="dg-readonly-note">紀錄由 E-Habit APP 輸入與同步</div>'
      +'</section><aside class="dg-side">'+growthRenderCalendar(historyDate,today,events)+'<section class="dg-card"><div class="dg-card-head"><div><div class="dg-card-title">🌼 主角屬性</div><div class="dg-card-note">每次完成都會累積對應成長</div></div></div><div class="dg-attributes">'+attributeHtml+'</div></section>'
      +'<section class="dg-card"><div class="dg-card-head"><div><div class="dg-card-title">📅 最近七日</div><div class="dg-card-note">每日完成成就數</div></div></div><div class="dg-history">'+historyHtml+'</div><div class="dg-history-note">這週累積 '+weekCounts.reduce(function(sum,value){return sum+value;},0)+' 點經驗</div><div class="dg-history-picker"><label for="dg-history-date">查看日期明細</label><input class="dg-input" id="dg-history-date" type="date" min="'+growthHistoryStartDate()+'" max="'+today+'" value="'+growthEscape(historyDate)+'" onchange="selectDailyGrowthHistory(this.value)"></div><div class="dg-history-selected">'+historyDate.replace(/-/g,' / ')+'　·　完成 '+historyDone.length+' 項</div><div class="dg-task-list">'+historyTaskHtml+'</div></section></aside></div></div>';
  }
  async function growthLoad(){
    if(!API_URL){growthStatus('尚未設定網站 API，請先完成城門設定。',true);growthRender();return;}
    if(!growthState.data)growthState.data=growthReadCache();
    var requestId=++growthState.readRequestId,dataVersion=growthState.dataVersion;
    growthStatus(growthState.data?'正在背景同步最新成長紀錄…':'正在整理你的成長紀錄…',false);growthRender();
    try{
      var latest=await apiGet({action:'dailyGrowth'},20000);
      if(requestId!==growthState.readRequestId||dataVersion!==growthState.dataVersion)return;
      growthState.data=latest;growthWriteCache(latest);growthStatus('',false);growthRender();
    }catch(error){
      if(requestId!==growthState.readRequestId||dataVersion!==growthState.dataVersion)return;
      growthStatus('讀取成長紀錄失敗：'+(error&&error.message||'請稍後重試'),true);growthRender();
    }
  }
  window.renderDailyGrowthPanel=function(){
    setPanelHead('🌱','Daily Growth · Little Steps','每日成長');
    var tabs=document.getElementById('p-tabs');
    if(tabs){tabs.classList.remove('finance-panel-tabs','is-open');tabs.classList.add('panel-tabs-hidden');tabs.innerHTML='';}
    var extra=document.getElementById('p-extra');if(extra)extra.innerHTML='<button class="store-header-date-button" type="button" onclick="refreshDailyGrowth()" aria-label="重新整理成長紀錄" title="重新整理">↻</button>';
    var body=document.getElementById('p-body');if(body)body.innerHTML='<div class="dg-page"><div class="dg-message">正在打開每日成長…</div></div>';
    growthLoad();
  };
  async function growthLoadMeals(month){
    month=month||growthToday().slice(0,7);
    var today=growthToday();growthState.mealMonth=month;growthState.mealDate=(month===today.slice(0,7))?today:(month+'-'+String(new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate()).padStart(2,'0'));
    growthState.mealData=growthReadMealsCache(month);growthStatus(growthState.mealData?'正在背景同步本月三餐紀錄…':'正在載入本月三餐紀錄…',false);growthRender();
    var requestId=++growthState.mealRequestId;
    try{
      var result=await apiGet({action:'dailyMeals',month:month},20000);
      if(requestId!==growthState.mealRequestId||growthState.mealMonth!==month)return;
      growthState.mealData=result;growthWriteMealsCache(result);growthStatus('',false);growthRender();
    }catch(error){
      if(requestId!==growthState.mealRequestId)return;
      growthStatus('三餐紀錄讀取失敗：'+(error&&error.message||'請稍後重試'),true);growthRender();
    }
  }
  window.selectDailyGrowthTab=function(tab){
    growthState.activeTab=tab==='meals'?'meals':'growth';
    if(growthState.activeTab==='meals')growthLoadMeals(growthState.mealMonth||growthToday().slice(0,7));
    else{growthStatus('',false);growthRender();}
  };
  window.changeDailyMealMonth=function(delta){
    var next=growthMealMonthShift(growthState.mealMonth||growthToday().slice(0,7),Number(delta)||0);
    if(next<=growthToday().slice(0,7))growthLoadMeals(next);
  };
  window.selectDailyMealDate=function(date){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||''))||date.slice(0,7)!==growthState.mealMonth||date>growthToday())return;
    growthState.mealDate=date;growthStatus('',false);growthRender();
  };
  window.refreshDailyGrowth=function(){growthLoad();};
  window.changeDailyGrowthCalendarMonth=function(delta){
    var current=growthState.calendarMonth||growthToday().slice(0,7),next=growthMonthShift(current,Number(delta)||0);
    if(next>=growthHistoryStartDate().slice(0,7)&&next<=growthToday().slice(0,7)){growthState.calendarMonth=next;growthRender();}
  };
  window.selectDailyGrowthCalendarDate=function(value){
    var date=String(value||''),today=growthToday();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today||date<growthHistoryStartDate())return;
    growthState.historyDate=date;growthState.calendarMonth=date.slice(0,7);growthRender();
  };
  window.selectDailyGrowthHistory=function(value){
    var date=String(value||''),today=growthToday();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>today||date<growthHistoryStartDate())return;
    growthState.historyDate=date;growthState.calendarMonth=date.slice(0,7);growthRender();
  };
})();
