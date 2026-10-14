const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('https://leijoa.github.io/rune-slab-playtest/');assert.equal(response.status(),200);
  await page.locator('#pgo').click();assert.equal(await page.locator('#palette button').count(),9);
  await page.locator('#palette button').first().click();await page.locator('#test').click();
  assert.match(await page.locator('#result').textContent(),/符合/);
  await page.getByRole('button',{name:'留下心得',exact:true}).click();
  await page.locator('[name="notes"]').fill('公開站點隔離測試');
  await page.locator('#feedbackCopy').click();assert.match(await page.locator('#feedbackText').inputValue(),/公開站點隔離測試/);
  await page.screenshot({path:'artifacts/published-feedback.png'});
  await page.locator('#feedbackClose').click();await page.reload();
  assert.equal(await page.evaluate(()=>data.tests[0]),1);
  for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,id:e.id,cls:e.className?.baseVal||e.className,right:e.getBoundingClientRect().right}))}))));}
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: public HTTPS 200; loaded game/CSS/feedback; test interaction; report generation; reload persistence; 4 widths; zero page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
