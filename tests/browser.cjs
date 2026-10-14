const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const key='rune-slab-playtest-v1';
const server=http.createServer((req,res)=>{
 const name=req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0].slice(1);
 if(!['index.html','playtest.css','playtest.js'].includes(name)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');
 res.end(fs.readFileSync(path.join('docs',name)));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.TEST_URL||`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch();
 const errors=[];fs.mkdirSync('artifacts',{recursive:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(base);await page.locator('#pgo').click();
  assert.equal(await page.locator('#title').textContent(),'第 1 塊石板');
  await page.locator('#palette button[data-s="0"][data-c="0"]').click();
  await page.locator('#test').click();
  assert.match(await page.locator('#result').textContent(),/符合/);
  assert.equal(await page.evaluate(()=>data.tests[0]),1);
  await page.locator('#test').click();assert.equal(await page.evaluate(()=>data.tests[0]),1);
  await page.reload();assert.equal(await page.evaluate(()=>data.tests[0]),1);
  await page.getByRole('button',{name:'留下心得',exact:true}).click();
  await page.locator('[name="fun"]').selectOption({label:'4 · 有趣'});
  await page.locator('[name="notes"]').fill('本次驗證 '+Date.now());
  const note=await page.locator('[name="notes"]').inputValue();
  assert(await page.locator('#feedbackFallback').isHidden());
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}}}));
  await page.locator('#feedbackCopy').click();
  assert.match(await page.locator('#feedbackText').inputValue(),/新測試1次/);
  assert.match(await page.locator('#feedbackResult').textContent(),/手動/);
  await page.keyboard.press('Escape');assert(!(await page.locator('#feedbackDialog').isVisible()));
  await page.reload();await page.getByRole('button',{name:'留下心得',exact:true}).click();
  assert.equal(await page.locator('[name="notes"]').inputValue(),note);
  await page.locator('#feedbackClose').click();
  // Real UI submission and the original timed reveal, not an accelerated animation.
  await page.locator('#chal').click();
  const answers=await page.evaluate(()=>ch.map(c=>c.ok));
  for(let i=0;i<answers.length;i++)await page.locator(`button[data-i="${i}"][data-v="${answers[i]?1:0}"]`).click();
  await page.locator('#sub').click();await page.locator('#stay').waitFor();
  await page.locator('#stay').click();assert(await page.evaluate(()=>data.solved.includes(0)));
  assert.equal(await page.evaluate(()=>data.stars[0]),3);
  await page.reload();assert(await page.evaluate(()=>data.solved.includes(0)));
  await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
  // Deterministic longest-row fixture catches small-screen overflow hidden by random shorter examples.
  await page.evaluate(()=>{data.logs[lv]=[true,false].map(ok=>({q:Array.from({length:6},()=>({s:ok?1:0,c:0})),ok}));render();});
  for(const width of [320,390,768]){
   await page.setViewportSize({width,height:844});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
   await page.getByRole('button',{name:'留下心得',exact:true}).click();
   assert(await page.locator('#feedbackDialog').evaluate(e=>e.scrollWidth<=e.clientWidth),`dialog overflow at ${width}`);
   await page.locator('#feedbackClose').click();
  }
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
  await page.setViewportSize({width:320,height:844});await page.locator('#chal').click();
  assert(await page.locator('#sheet').evaluate(e=>e.scrollWidth<=e.clientWidth),'challenge sheet overflow');
  await page.locator('#cx').click();
  // All content screens, including conditional language and final story.
  await page.evaluate(()=>{data.solved=ORDER.slice();});
  for(let i=0;i<16;i++)await page.evaluate(i=>goLevel(ORDER[i]),i);
  await page.evaluate(()=>openMap());assert.equal(await page.locator('.lv').count(),16);
  await page.locator('#mc').click();await page.evaluate(()=>openBook());
  await page.locator('#bc').click();
  const snapshot=await page.evaluate(()=>JSON.stringify(data));
  // Explicitly isolated fixtures; original user/browser storage is never used.
  const fixtures=['{truncated','null','',JSON.stringify({version:99}),JSON.stringify({...JSON.parse(snapshot),logs:{0:[{q:[{s:9,c:0}],ok:true}]}}),' '.repeat(1000001)];
  for(const raw of fixtures){
   await page.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key,raw});await page.reload();
   assert(await page.locator('#backupSave').isVisible());
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),raw);
  }
  await page.evaluate(({key,snapshot})=>localStorage.setItem(key,snapshot),{key,snapshot});await page.reload();
  assert.equal(await page.evaluate(()=>data.solved.length),16);
  // Storage write failure must be visible without losing the in-memory session.
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('quota')};save();});
  assert(await page.locator('#saveNotice').isVisible());
  assert.equal(errors.length,0,errors.join('\n'));
  if(!process.env.TEST_URL){
   // Mutation: restore the old swallow-error + render behaviour. The no-overwrite assertion must fail.
   const mutant=fs.readFileSync('docs/index.html','utf8').replace(/async function load\(\)\{[\s\S]*?\nfunction log\(\)/,`async function load(){try{const v=localStorage.getItem('${key}');if(v)data=JSON.parse(v);}catch(e){}norm();lv=firstOpen();render();}\nfunction log()`);
   const m=await browser.newPage();await m.route('**/index.html',r=>r.fulfill({contentType:'text/html',body:mutant}));
   await m.goto(base);await m.evaluate(key=>localStorage.setItem(key,'{truncated'),key);await m.goto(base+'index.html');
   let caught=false;try{assert.equal(await m.evaluate(key=>localStorage.getItem(key),key),'{truncated');}catch(e){caught=true;}
   assert(caught,'regression assertion did not detect restored overwrite bug');await m.close();
   const narrow=await browser.newPage({viewport:{width:320,height:844},reducedMotion:'reduce'});
   const oldCss=fs.readFileSync('docs/playtest.css','utf8').replace(/^#app .*\n/gm,'');
   await narrow.route('**/playtest.css',r=>r.fulfill({contentType:'text/css',body:oldCss}));
   await narrow.goto(base);await narrow.locator('#pgo').click();
   await narrow.evaluate(()=>{data.logs[0]=[0,2].map(c=>({q:Array.from({length:6},()=>({s:0,c})),ok:c===0}));render();});
   assert(await narrow.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'restored layout defect must fail width assertion');
   await narrow.close();
  }
  console.log('PASS: real challenge + 3 stars, reload persistence, feedback draft/manual copy, 320/390/768/1280 widths, all 16 screens, 6 damaged save fixtures, write failure; mutation detected (local run).');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
