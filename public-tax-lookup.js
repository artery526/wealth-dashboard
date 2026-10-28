(function(){
  'use strict';
  var API_URL='https://script.google.com/macros/s/AKfycbwc8qziVngGOLF0Q49ClrcNUz_s_JMhpG94Blurb2b_pTZsN3_asc4gwEfdgj46jiTV/exec';
  function byId(id){return document.getElementById(id);}
  function render(symbol,data){
    var host=byId('public-tax-results');host.replaceChildren();
    if(!data.found){var empty=document.createElement('article');empty.className='result';empty.textContent='查無退稅資料';host.appendChild(empty);return;}
    var summary=document.createElement('div');summary.className='summary';summary.textContent=symbol+' 退稅查詢結果';host.appendChild(summary);
    (data.sources||[]).forEach(function(source){
      var card=document.createElement('article');card.className='result';
      var title=document.createElement('h2');title.textContent=source.source||'歷史資料';card.appendChild(title);
      (source.rows||[]).forEach(function(row){
        var line=document.createElement('p');
        if(row.year)line.appendChild(document.createTextNode(row.year+' 年　'));
        if(row.taxRate){line.appendChild(document.createTextNode('稅率 '+row.taxRate+'　'));}
        line.appendChild(document.createTextNode(source.type==='experience'?'退稅比率 ':'退稅率 '));
        var rate=document.createElement('span');rate.className='rate';rate.textContent=row.refundRate||'查無資料';line.appendChild(rate);card.appendChild(line);
      });
      host.appendChild(card);
    });
  }
  byId('public-tax-form').addEventListener('submit',async function(event){
    event.preventDefault();
    var input=byId('public-tax-symbol'),button=byId('public-tax-submit'),status=byId('public-tax-status');
    var symbol=String(input.value||'').trim().toUpperCase();
    byId('public-tax-results').replaceChildren();status.classList.remove('error');
    if(!/^[A-Z0-9.-]{2,12}$/.test(symbol)){status.textContent='請輸入 2 至 12 碼的 ETF 代號。';status.classList.add('error');return;}
    button.disabled=true;button.textContent='查詢中…';status.textContent='正在查詢…';
    try{
      var url=API_URL+'?action=etfTaxLookup&symbol='+encodeURIComponent(symbol)+'&_ts='+Date.now();
      var response=await fetch(url,{cache:'no-store',redirect:'follow'});var payload=await response.json();
      if(!response.ok||!payload.ok)throw new Error(payload.error||'查詢失敗，請稍後重試。');
      render(symbol,payload.data||{});status.textContent='查詢完成。';
    }catch(error){status.textContent=error.message||'查詢失敗，請稍後重試。';status.classList.add('error');}
    finally{button.disabled=false;button.textContent='查詢';}
  });
})();
