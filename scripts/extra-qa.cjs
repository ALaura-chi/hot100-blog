// Run after `npm run ci`. Uses a separate Chrome process and a temporary dev server.
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs/promises');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { runAt: new Date().toISOString(), tests: [], performance: {} };
async function test(name, fn) { await fn(); report.tests.push({ name, passed: true }); }
async function run(args) { return new Promise(resolve => { const child = spawn(process.execPath, args, { windowsHide: true }); let output=''; child.stdout.on('data', d=>output+=d); child.stderr.on('data', d=>output+=d); child.on('close', code=>resolve({ code, output })); }); }
(async()=>{
 const chrome=process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
 const browser=await chromium.launch({executablePath:chrome,headless:true});
 let server;
 try {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();
  await test('mobile home has no horizontal overflow',async()=>{
   await page.goto('http://127.0.0.1:4391/hot100-blog/',{waitUntil:'networkidle'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'docs/screenshots/local-home-mobile.png'});
  });
  await test('copy permission failure produces accessible feedback',async()=>{
   await page.goto('http://127.0.0.1:4391/hot100-blog/posts/hot_100/',{waitUntil:'networkidle'});
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new DOMException('Denied','NotAllowedError');}},configurable:true}));
   await page.locator('#problem-1 .copy-button').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#problem-1 .copy-button').textContent==='复制失败');
   assert.match(await page.locator('#copy-status').textContent(),/手动复制/);
  });
  await test('reduced motion keeps the canvas static after pointer and click',async()=>{
   const before=await page.locator('canvas').evaluate(el=>el.toDataURL());
   await page.mouse.move(200,400);await page.mouse.click(250,390);await wait(150);
   assert.equal(await page.locator('canvas').evaluate(el=>el.toDataURL()),before);
  });
  await context.close();
  const perf=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'no-preference'});
  await perf.addInitScript(()=>{window.__longTasks=[];new PerformanceObserver(list=>window.__longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});});
  const desktop=await perf.newPage();
  await desktop.goto('http://127.0.0.1:4391/hot100-blog/posts/hot_100/',{waitUntil:'networkidle'});
  const interactionStart=await desktop.evaluate(()=>performance.now());
  for(let i=0;i<10;i++){await desktop.mouse.move(180+i*90,220+i*20);await desktop.mouse.wheel(0,600);await wait(40);}
  await desktop.mouse.click(1200,400);await wait(300);
  report.performance=await desktop.evaluate(start=>({navigation:performance.getEntriesByType('navigation').map(e=>({domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd})),longTasks:window.__longTasks,interactionLongTasks:window.__longTasks.filter(e=>e.start>=start)}),interactionStart);
  await test('scroll and grid interaction produce no task over 200ms',async()=>assert.ok(report.performance.interactionLongTasks.every(e=>e.duration<200),JSON.stringify(report.performance.interactionLongTasks)));
  await perf.close();
  const homePath='src/pages/index.astro', originalHome=await fs.readFile(homePath,'utf8');
  server=spawn(process.execPath,['node_modules/astro/bin/astro.mjs','dev','--host','127.0.0.1','--port','4392'],{windowsHide:true,stdio:'pipe'});
  let serverLog='';server.stdout.on('data',d=>serverLog+=d);server.stderr.on('data',d=>serverLog+=d);
  let ready=false;for(let i=0;i<150;i++){try{if((await fetch('http://127.0.0.1:4392/hot100-blog/')).ok){ready=true;break;}}catch{}await wait(200);}
  assert.ok(ready,'Dev server did not start: '+serverLog);
  const dev=await browser.newPage();await dev.goto('http://127.0.0.1:4392/hot100-blog/',{waitUntil:'networkidle'});
  try {
   await test('development server updates the browser after a source edit',async()=>{
    await fs.writeFile(homePath,originalHome.replace('把思路写下来，','HMR 验证完成，'));
    await dev.getByRole('heading',{name:/HMR 验证完成/}).waitFor();
   });
  }finally{await fs.writeFile(homePath,originalHome);await dev.getByRole('heading',{name:/把思路写下来/}).waitFor();await dev.close();}
  server.kill();server=undefined;
  const sourcePath='src/content/problems/0001-two-sum.md';const originalNote=await fs.readFile(sourcePath,'utf8');
  try {
   await test('content schema rejects an invalid difficulty',async()=>{
    assert.match(originalNote,/difficulty: "easy"/);
    await fs.writeFile(sourcePath,originalNote.replace('difficulty: "easy"','difficulty: "invalid"'));
    const result=await run(['node_modules/astro/bin/astro.mjs','build']);
    assert.notEqual(result.code,0);assert.match(result.output,/difficulty/);report.schemaFailure=result.output.replace(/\u001b\[[0-9;]*m/g,'').slice(-3000);
   });
  }finally{await fs.writeFile(sourcePath,originalNote);}
  const htmlPath='dist/posts/hot_100/index.html',originalHtml=await fs.readFile(htmlPath,'utf8');
  try{
   await test('build verifier rejects a missing problem anchor',async()=>{
    await fs.writeFile(htmlPath,originalHtml.replace('id="problem-1"','id="removed-problem-1"'));
    const result=await run(['scripts/verify-build.mjs']);assert.notEqual(result.code,0);assert.match(result.output,/Missing problem anchor: 1/);report.anchorFailure='Missing problem anchor: 1';
   });
  }finally{await fs.writeFile(htmlPath,originalHtml);}
  report.passed=true;
 } catch(error){report.passed=false;report.error=String(error);process.exitCode=1;}
 finally{server?.kill();await browser.close();await fs.writeFile('docs/checks/extra-qa.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
})();
