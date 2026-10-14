'use strict';
const feedbackKey='rune-slab-feedback-v1';
const feedbackDialog=document.createElement('dialog');
feedbackDialog.id='feedbackDialog';
feedbackDialog.setAttribute('aria-labelledby','feedbackTitle');
feedbackDialog.innerHTML=`<h2 id="feedbackTitle">這趟探索，感覺如何？</h2>
<p class="small">沒有標準答案，玩幾關都可以回饋。草稿只存在這個瀏覽器；按複製後，請自行傳給邀請你的人。這裡不會自動送出。</p>
<form id="feedbackForm">
<label>玩之前接觸過這款遊戲嗎？<select name="experience"><option value="">尚未選擇</option><option>第一次玩</option><option>看過介紹，沒有玩過</option><option>之前玩過</option></select></label>
<label>這次玩起來有趣嗎？<select name="fun"><option value="">尚未選擇</option><option>1 · 完全不有趣</option><option>2 · 不太有趣</option><option>3 · 普通</option><option>4 · 有趣</option><option>5 · 很有趣</option></select></label>
<label>操作方式清楚嗎？<select name="clarity"><option value="">尚未選擇</option><option>很快就懂</option><option>試了一下才懂</option><option>到現在仍有不清楚的地方</option></select></label>
<label>還想繼續玩嗎？<select name="continue"><option value="">尚未選擇</option><option>想，還想解更多</option><option>不確定</option><option>不想繼續</option></select></label>
<label>星數對你的影響？<select name="stars"><option value="">尚未選擇</option><option>讓我更想挑戰</option><option>讓我不敢測試或用提示</option><option>沒有影響</option><option>沒注意到星數</option></select></label>
<label>印象最深的一刻，或卡住／想停下來的原因<textarea name="notes" maxlength="3000" placeholder="例如：第幾塊石板、哪個操作，或你當時在想什麼。請勿填個資。"></textarea></label>
<div class="row"><button type="button" id="feedbackCopy" class="primary">複製心得與紀錄</button><button type="button" id="feedbackClose">回到遊戲</button></div>
<p id="feedbackResult" role="status" aria-live="polite"></p>
<label id="feedbackFallback" hidden>請全選下方文字並複製<textarea readonly id="feedbackText"></textarea></label></form>`;
document.body.appendChild(feedbackDialog);
const feedbackForm=document.getElementById('feedbackForm');
const feedbackFields=['experience','fun','clarity','continue','stars','notes'];
try{const draft=JSON.parse(localStorage.getItem(feedbackKey)||'{}');feedbackFields.forEach(k=>{if(typeof draft?.[k]==='string')feedbackForm.elements[k].value=draft[k];});}catch(e){}
feedbackForm.addEventListener('input',()=>{try{localStorage.setItem(feedbackKey,JSON.stringify(Object.fromEntries(feedbackFields.map(k=>[k,feedbackForm.elements[k].value]))));}catch(e){document.getElementById('feedbackResult').textContent='瀏覽器無法保存心得草稿，請在離開前複製回傳。';}});
feedbackForm.addEventListener('submit',e=>e.preventDefault());
function openFeedback(){if(!feedbackDialog.open)feedbackDialog.showModal();}
document.getElementById('feedbackClose').onclick=()=>feedbackDialog.close();
function feedbackReport(){
  const value=k=>feedbackForm.elements[k].value.trim()||'未填';
  const rows=ORDER.filter(id=>data.logs[id]||data.solved.includes(id)).map(id=>`第${ORDER.indexOf(id)+1}塊：${data.solved.includes(id)?'已通關':'尚未通關'}；新測試${data.tests[id]||0}次；挑戰${data.att[id]||0}次；提示${data.hint[id]?'有':'無'}；看答案${data.peek[id]?'有':'無'}；最高${data.stars[id]||0}星`);
  return ['符文石板 · 第一輪試玩 v0.1.0',`先前經驗：${value('experience')}`,`趣味：${value('fun')}`,`操作：${value('clarity')}`,`繼續意願：${value('continue')}`,`星數影響：${value('stars')}`,`心得：${value('notes')}`,'',`目前第${ORDER.indexOf(lv)+1}塊；已通關${data.solved.length}/16`,...rows,'','說明：紀錄累積於此瀏覽器，可能包含多次遊玩。題目含隨機差異，次數不作玩家能力排名。'].join('\n');
}
document.getElementById('feedbackCopy').onclick=async()=>{
  const report=feedbackReport();
  // Always retain a visible manual-copy alternative, including denied clipboard access.
  const area=document.getElementById('feedbackText');area.value=report;
  document.getElementById('feedbackFallback').hidden=false;
  try{await navigator.clipboard.writeText(report);document.getElementById('feedbackResult').textContent='已複製！請貼到訊息傳給邀請你的人，尚未自動送出。';}
  catch(e){document.getElementById('feedbackResult').textContent='無法自動複製。請全選下方文字，手動複製回傳。';area.focus();area.select();}
};
