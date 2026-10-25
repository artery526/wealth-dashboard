function formatCompoundCurrency(value){
  return 'NT$'+Math.round(Number(value)||0).toLocaleString('zh-TW');
}
function formatCompoundWan(value){
  return (Number(value||0)/10000).toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2})+' 萬';
}
function ensureCompoundInterestRows(years,rows){
  var oldRateInputs=rows.querySelectorAll('.compound-interest-rate-input');
  var oldContributionInputs=rows.querySelectorAll('.compound-interest-contribution-input');
  if(oldRateInputs.length===years&&oldContributionInputs.length===years)return;
  var savedRates=Array.from(oldRateInputs,function(input){return input.value;});
  var savedContributions=Array.from(oldContributionInputs,function(input){return input.value;});
  var carryForward=document.getElementById('compound-interest-carry-forward');
  var carryForwardEnabled=!!(carryForward&&carryForward.checked);
  rows.innerHTML='';
  var lastContribution='0';
  for(var year=1;year<=years;year++){
    var tr=document.createElement('tr');
    var yearCell=document.createElement('td');
    yearCell.textContent='第 '+year+' 年';
    var contributionCell=document.createElement('td');
    var contributionInput=document.createElement('input');
    contributionInput.className='row-input compound-interest-row-input compound-interest-contribution-input';
    contributionInput.type='number';contributionInput.inputMode='decimal';contributionInput.min='0';contributionInput.step='10000';
    var contributionValue=savedContributions[year-1];
    if(contributionValue===undefined)contributionValue=carryForwardEnabled&&year>1?lastContribution:'0';
    contributionInput.value=contributionValue;lastContribution=contributionInput.value;
    contributionInput.setAttribute('aria-label','第 '+year+' 年追加投入金額（元）');contributionCell.appendChild(contributionInput);
    var rateCell=document.createElement('td');
    var rateInput=document.createElement('input');
    rateInput.className='row-input compound-interest-row-input compound-interest-rate-input';
    rateInput.type='number';rateInput.inputMode='decimal';rateInput.min='-100';rateInput.max='1000';rateInput.step='0.1';rateInput.value=savedRates[year-1]===undefined?'6':savedRates[year-1];
    rateInput.setAttribute('aria-label','第 '+year+' 年年化報酬率（%）');rateCell.appendChild(rateInput);
    var balanceCell=document.createElement('td');balanceCell.id='compound-interest-balance-'+year;balanceCell.textContent='--';
    var realValueCell=document.createElement('td');realValueCell.id='compound-interest-real-value-'+year;realValueCell.textContent='--';
    var returnCell=document.createElement('td');returnCell.id='compound-interest-return-'+year;returnCell.textContent='--';
    tr.append(yearCell,contributionCell,rateCell,balanceCell,realValueCell,returnCell);rows.appendChild(tr);
  }
}
function clearCompoundInterestResults(rows){
  rows.querySelectorAll('[id^="compound-interest-balance-"],[id^="compound-interest-real-value-"],[id^="compound-interest-return-"]').forEach(function(cell){cell.textContent='--';cell.classList.remove('negative');});
}
function renderCompoundInterest(){
  var principalInput=document.getElementById('compound-interest-principal');
  var inflationInput=document.getElementById('compound-interest-inflation');
  var yearsInput=document.getElementById('compound-interest-years');
  var summary=document.getElementById('compound-interest-summary');
  var rows=document.getElementById('compound-interest-rows');
  if(!principalInput||!inflationInput||!yearsInput||!summary||!rows)return;
  var principal=Number(principalInput.value),inflation=Number(inflationInput.value),years=Number(yearsInput.value);
  if(!yearsInput.value.trim()||!isFinite(years)||Math.floor(years)!==years||years<1||years>40){summary.textContent='試算年數請輸入 1 至 40 的整數。';clearCompoundInterestResults(rows);return;}
  ensureCompoundInterestRows(years,rows);
  if(!principalInput.value.trim()||!isFinite(principal)||principal<=0){summary.textContent='請輸入大於 0 的本金。';clearCompoundInterestResults(rows);return;}
  if(!inflationInput.value.trim()||!isFinite(inflation)||inflation< -99.9||inflation>1000){summary.textContent='年通膨率請輸入 -99.9% 至 1000% 的數值。';clearCompoundInterestResults(rows);return;}
  var contributionInputs=rows.querySelectorAll('.compound-interest-contribution-input'),rateInputs=rows.querySelectorAll('.compound-interest-rate-input');
  var balance=principal,totalContributions=0;
  for(var year=1;year<=years;year++){
    var contributionInput=contributionInputs[year-1],contribution=Number(contributionInput.value);
    if(!contributionInput.value.trim()||!isFinite(contribution)||contribution<0){summary.textContent='第 '+year+' 年追加投入請輸入 0 或正數。';clearCompoundInterestResults(rows);return;}
    var rateInput=rateInputs[year-1],rate=Number(rateInput.value);
    if(!rateInput.value.trim()||!isFinite(rate)||rate< -100||rate>1000){summary.textContent='第 '+year+' 年報酬率請輸入 -100% 至 1000% 的數值。';clearCompoundInterestResults(rows);return;}
    var investedThisYear=balance+contribution;balance=investedThisYear*(1+rate/100);
    var annualReturn=balance-investedThisYear;totalContributions+=contribution;
    var balanceCell=document.getElementById('compound-interest-balance-'+year),realValueCell=document.getElementById('compound-interest-real-value-'+year),returnCell=document.getElementById('compound-interest-return-'+year);
    if(balanceCell)balanceCell.innerHTML=formatCompoundCurrency(balance)+'<small>'+formatCompoundWan(balance)+'</small>';
    var realValue=balance/Math.pow(1+inflation/100,year);
    if(realValueCell)realValueCell.innerHTML=formatCompoundCurrency(realValue)+'<small>以今日幣值估算</small>';
    if(returnCell){returnCell.classList.toggle('negative',annualReturn<0);var prefix=annualReturn>0?'+':'';returnCell.innerHTML=prefix+formatCompoundCurrency(annualReturn)+'<small>'+prefix+formatCompoundWan(annualReturn)+'</small>';}
  }
  var totalInvested=principal+totalContributions,totalGain=balance-totalInvested,totalPrefix=totalGain>0?'+':'';
  var finalRealValue=balance/Math.pow(1+inflation/100,years),purchasingDelta=finalRealValue-balance;
  var purchasingDeltaText=purchasingDelta<0?'<span class="purchasing-loss">約減 '+formatCompoundCurrency(Math.abs(purchasingDelta))+'</span>':purchasingDelta>0?'<span class="purchasing-gain">約加 '+formatCompoundCurrency(purchasingDelta)+'</span>':'<span>與名目金額相同</span>';
  summary.innerHTML=years+' 年後名目金額 <strong>'+formatCompoundCurrency(balance)+'（'+formatCompoundWan(balance)+'）</strong>；以年通膨 '+inflation+'% 折算，購買力約 <strong>'+formatCompoundCurrency(finalRealValue)+'（今日幣值）</strong> '+purchasingDeltaText+'。累計投入 '+formatCompoundCurrency(totalInvested)+'，投資損益 <strong>'+totalPrefix+formatCompoundCurrency(totalGain)+'（'+totalPrefix+formatCompoundWan(totalGain)+'）</strong>。';
}
function zeroCompoundInterestRates(event){
  if(event&&event.stopPropagation)event.stopPropagation();
  var rows=document.getElementById('compound-interest-rows');if(!rows)return;
  rows.querySelectorAll('.compound-interest-rate-input').forEach(function(input){input.value='0';});renderCompoundInterest();
}
document.addEventListener('DOMContentLoaded',function(){
  ['compound-interest-principal','compound-interest-inflation','compound-interest-years'].forEach(function(id){var input=document.getElementById(id);if(input)input.addEventListener('input',renderCompoundInterest);});
  var rows=document.getElementById('compound-interest-rows'),carry=document.getElementById('compound-interest-carry-forward');
  if(rows)rows.addEventListener('input',function(event){
    var target=event.target;if(!target||!target.classList.contains('compound-interest-row-input'))return;
    if(target.classList.contains('compound-interest-contribution-input')&&carry&&carry.checked){var inputs=rows.querySelectorAll('.compound-interest-contribution-input'),index=Array.prototype.indexOf.call(inputs,target);for(var i=index+1;i<inputs.length;i++)inputs[i].value=target.value;}
    renderCompoundInterest();
  });
  if(carry)carry.addEventListener('change',function(){if(carry.checked){var inputs=document.querySelectorAll('#compound-interest-rows .compound-interest-contribution-input');for(var i=1;i<inputs.length;i++)inputs[i].value=inputs[i-1].value;}renderCompoundInterest();});
  renderCompoundInterest();
});
