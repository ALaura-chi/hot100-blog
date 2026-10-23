const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:4391';
const root = `${origin}/hot100-blog/`;
const article = `${root}posts/hot_100/`;
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const report = {runAt:new Date().toISOString(),screenshots:[],tests:[],issues:[]};
async function test(name, operation){try{await operation();report.tests.push({name,passed:true});}catch(error){report.tests.push({name,passed:false,error:String(error)});throw error;}}
(async()=>{
 await fs.mkdir('docs/screenshots',{recursive:true});
 const browser = await chromium.launch({executablePath:chrome,headless:true});
 try{
  for(const [width,height] of [[1440,900],[768,1024],[390,844]]){
   for(const theme of ['light','dark']){
    const context=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();const errors=[];const failedResources=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)failedResources.push({url:response.url(),status:response.status()});});
    await page.goto(article,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelectorAll('.code-block').length===5);await page.evaluate(()=>document.fonts.ready);
    await test(`${width}x${height} ${theme}: page, theme, no overflow`,async()=>{
     assert.equal(await page.locator('[data-problem]').count(),100);
     assert.equal(await page.locator('.problem-link').count(),100);
     assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
     const size=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));assert.ok(size.document<=size.viewport,JSON.stringify(size));
    });
    const shot=`local-${width}x${height}-${theme}.png`;await page.screenshot({path:`docs/screenshots/${shot}`,fullPage:false,animations:'disabled'});report.screenshots.push(shot);
    if(width===1440&&theme==='light'){
     await test('theme persists through refresh',async()=>{await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');});
     await test('copy contains source code only (OS newlines normalized)',async()=>{const expected=await page.locator('#problem-1 pre code').textContent();await page.locator('#problem-1 .copy-button').click();assert.equal(await page.locator('#problem-1 .copy-button').textContent(),'已复制');const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(copied.replace(/\r\n/g,'\n'),expected.replace(/\r\n/g,'\n'));});
     await test('scroll follows problem 200, then final problem 287',async()=>{
      await page.locator('.problem-link[data-problem-id="200"]').click();await page.waitForFunction(()=>document.querySelector('.problem-link[aria-current="location"]')?.getAttribute('data-problem-id')==='200');
      assert.ok(Math.abs(await page.locator('#problem-200').evaluate(el=>el.getBoundingClientRect().top)-96)<5);
      const shot='local-desktop-dark-middle.png';await page.screenshot({path:`docs/screenshots/${shot}`,animations:'disabled'});report.screenshots.push(shot);
      await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForFunction(()=>document.querySelector('.problem-link[aria-current="location"]')?.getAttribute('data-problem-id')==='287');
      const transform=await page.locator('#reading-progress-fill').evaluate(el=>getComputedStyle(el).transform);assert.match(transform,/matrix\(1, 0, 0, 1/);
      const shot2='local-desktop-dark-bottom.png';await page.screenshot({path:`docs/screenshots/${shot2}`,animations:'disabled'});report.screenshots.push(shot2);
     });
    }
    if(width===390&&theme==='light'){
     await test('mobile directory opens, navigates and closes',async()=>{
      assert.equal(await page.locator('#problem-directory').getAttribute('open'),null);
      await page.locator('#problem-directory summary').click();assert.notEqual(await page.locator('#problem-directory').getAttribute('open'),null);
      const shot='local-mobile-directory-open.png';await page.screenshot({path:`docs/screenshots/${shot}`,animations:'disabled'});report.screenshots.push(shot);
      await page.locator('.problem-link[data-problem-id="200"]').click();await page.waitForURL('**/#problem-200');assert.equal(await page.locator('#problem-directory').getAttribute('open'),null);
     });
     await test('mobile long code scrolls inside its block',async()=>{
      const widths=await page.locator('#problem-200 pre').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,document:document.documentElement.scrollWidth,viewport:innerWidth}));
      assert.ok(widths.scroll>widths.client,JSON.stringify(widths));assert.ok(widths.document<=widths.viewport);
      const shot='local-mobile-long-code.png';await page.screenshot({path:`docs/screenshots/${shot}`,animations:'disabled'});report.screenshots.push(shot);
     });
     await test('keyboard opens menu and Escape restores focus',async()=>{
      await page.locator('#menu-toggle').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.activeElement?.id),'menu-toggle');
     });
    }
    assert.deepEqual(errors,[],`Browser errors ${width}/${theme}`);assert.deepEqual(failedResources,[],`Resource failures ${width}/${theme}`);
    await context.close();
   }
  }
  const blocked=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});
  await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
  const page=await blocked.newPage();let pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(article,{waitUntil:'networkidle'});
  await test('blocked storage preserves usable theme switch',async()=>{assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.deepEqual(pageErrors,[]);});
  await blocked.close();
  const site=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light',reducedMotion:'reduce'});const home=await site.newPage();
  await test('all public routes respond',async()=>{for(const route of ['', 'categories/','about/','posts/hot_100/','problems.json','404.html']){const response=await home.goto(root+route,{waitUntil:'networkidle'});assert.equal(response.status(),200,route);}});
  await home.goto(root,{waitUntil:'networkidle'});const homeShot='local-home-light.png';await home.screenshot({path:`docs/screenshots/${homeShot}`,animations:'disabled'});report.screenshots.push(homeShot);
  report.chromiumVersion=browser.version();report.passed=report.tests.every(test=>test.passed);console.log(JSON.stringify(report,null,2));
 }catch(error){report.passed=false;report.issues.push(String(error));console.error(error);process.exitCode=1;}
 finally{await browser.close();await fs.mkdir('docs/checks',{recursive:true});await fs.writeFile('docs/checks/browser-qa.json',JSON.stringify(report,null,2)+'\n');}
})();
