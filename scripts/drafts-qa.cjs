const {chromium}=require(process.argv[2] || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const origin=process.env.QA_ORIGIN || 'http://127.0.0.1:4391';
const article=origin+'/hot100-blog/posts/hot_100/';
const prefix='hot100-blog:draft:v1:';
const report={runAt:new Date().toISOString(),origin,tests:[],screenshots:[]};
async function test(name,fn){try{await fn();report.tests.push({name,passed:true});}catch(error){report.tests.push({name,passed:false,error:String(error)});throw error;}}
async function open(page,id){await page.locator(`[data-draft-open="${id}"]`).click();await page.locator('#draft-dialog').waitFor({state:'visible'});}
async function close(page){await page.locator('#draft-close').click();await page.locator('#draft-dialog').waitFor({state:'hidden'});}
async function saved(page){await page.waitForFunction(()=>document.querySelector('#draft-save-status').textContent.includes('已自动保存'));}
async function read(page,id){return page.evaluate(({prefix,id})=>JSON.parse(localStorage.getItem(prefix+id)),{prefix,id});}
async function downloadJSON(page,selector){const pending=page.waitForEvent('download');await page.locator(selector).click();const download=await pending;const stream=await download.createReadStream();let text='';for await(const chunk of stream)text+=chunk.toString();return JSON.parse(text);}
async function importJSON(page,value){await page.locator('#draft-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const errors=[],mutations=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>{if(!['GET','HEAD'].includes(request.method()))mutations.push(request.url());});
  await page.goto(article,{waitUntil:'networkidle'});
  const published=await page.locator('#problem-1 .prose pre code').textContent();
  const note='<img src=x onerror="window.injected=true"> 我的中文复盘\n先查补数，再写入。';
  const code='class Solution {\n    // 我的 Java 草稿\n    int answer = 42;\n}';
  let backup;
  await test('all 100 problems have enabled draft controls; opening does not create a draft',async()=>{
   assert.equal(await page.locator('[data-draft-open]:enabled').count(),100);await open(page,1);
   assert.equal(await page.locator('#draft-java').inputValue(),published);assert.equal(await page.locator('#draft-notes').inputValue(),'');assert.equal(await page.locator('#draft-count').textContent(),'0');await close(page);
  });
  await test('notes and edited Java autosave without changing the published example',async()=>{
   await open(page,1);await page.locator('#draft-notes').fill(note);await page.locator('#draft-java').fill(code);await saved(page);
   assert.equal((await read(page,1)).java,code);assert.equal(await page.locator('#problem-1 .prose pre code').textContent(),published);
   await page.locator('#draft-dialog').evaluate(el=>el.scrollTop=0);const shot='drafts-desktop-light.png';await page.screenshot({path:'docs/screenshots/'+shot});report.screenshots.push(shot);await close(page);
   const preview=page.locator('#problem-1 .local-draft-preview');assert.equal(await preview.getAttribute('open'),'');assert.equal(await preview.locator('p').textContent(),note);assert.equal(await preview.locator('img').count(),0);assert.equal(await page.evaluate(()=>window.injected),undefined);
   await page.reload({waitUntil:'networkidle'});await open(page,1);assert.equal(await page.locator('#draft-notes').inputValue(),note);assert.equal(await page.locator('#draft-java').inputValue(),code);await close(page);
  });
  await test('closing immediately flushes pending input',async()=>{
   await open(page,1);await page.locator('#draft-notes').fill(note+'\n立即关闭也保存');await close(page);assert.match((await read(page,1)).notes,/立即关闭/);
  });
  await test('refresh immediately flushes the last keystrokes',async()=>{
   await open(page,1);await page.locator('#draft-notes').fill(note+'\n刷新前的最后输入');await page.reload({waitUntil:'networkidle'});await open(page,1);assert.match(await page.locator('#draft-notes').inputValue(),/最后输入/);await close(page);
  });
  await test('a pending problem accepts independent notes and Java',async()=>{
   await open(page,49);assert.equal(await page.locator('#draft-java').inputValue(),'');await page.locator('#draft-notes').fill('第 49 题独立笔记');await page.locator('#draft-java').fill('class MyGroups {}');await page.locator('#draft-save-close').click();await page.locator('#draft-dialog').waitFor({state:'hidden'});assert.equal((await read(page,49)).notes,'第 49 题独立笔记');assert.equal((await read(page,1)).java,code);assert.equal(await page.locator('#draft-count').textContent(),'2');
  });
  await test('export includes all current records in a versioned backup',async()=>{
   backup=await downloadJSON(page,'#draft-export');assert.equal(backup.format,'hot100-blog-drafts');assert.equal(backup.version,1);assert.equal(backup.drafts.length,2);assert.equal(backup.drafts.find(p=>p.problemId===1).java,code);
  });
  await test('cleared Java stays empty after reload instead of restoring the example',async()=>{
   await open(page,1);await page.locator('#draft-java').fill('');await saved(page);await close(page);await page.reload({waitUntil:'networkidle'});await open(page,1);assert.equal(await page.locator('#draft-java').inputValue(),'');await close(page);
  });
  const restored=await browser.newContext({viewport:{width:390,height:844},colorScheme:'dark',reducedMotion:'reduce'});const mobile=await restored.newPage();mobile.on('pageerror',e=>errors.push(String(e)));await mobile.goto(article,{waitUntil:'networkidle'});
  await test('import preview and cancel leave existing records untouched',async()=>{
   await importJSON(mobile,backup);await mobile.locator('#draft-import-review').waitFor({state:'visible'});assert.match(await mobile.locator('#draft-import-description').textContent(),/2 题/);assert.equal(await mobile.locator('#draft-count').textContent(),'0');await mobile.locator('#draft-import-cancel').click();assert.equal(await mobile.locator('#draft-count').textContent(),'0');
  });
  await test('confirming a valid backup restores notes and Java',async()=>{
   await importJSON(mobile,backup);await mobile.locator('#draft-import-confirm').click();assert.equal(await mobile.locator('#draft-count').textContent(),'2');await open(mobile,1);assert.equal(await mobile.locator('#draft-java').inputValue(),code);assert.match(await mobile.locator('#draft-notes').inputValue(),/中文复盘/);await mobile.locator('#draft-dialog').evaluate(el=>el.scrollTop=0);const shot='drafts-mobile-dark.png';await mobile.screenshot({path:'docs/screenshots/'+shot});report.screenshots.push(shot);
   const size=await mobile.locator('#draft-dialog').evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,client:el.clientWidth,document:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(size.width<=size.viewport && size.document<=size.viewport && size.scroll<=size.client,JSON.stringify(size));await close(mobile);
  });
  await test('a malformed later record rejects the whole import before any overwrite',async()=>{
   const bad=structuredClone(backup);bad.drafts[0].notes='不得替换';bad.drafts[1].problemId=99999;await importJSON(mobile,bad);await mobile.waitForFunction(()=>document.querySelector('#draft-global-status').textContent.includes('未导入'));assert.notEqual((await read(mobile,1)).notes,'不得替换');assert.equal(await mobile.locator('#draft-import-review').isVisible(),false);
  });
  await test('duplicate problem IDs in a backup are rejected',async()=>{
   await importJSON(mobile,{...backup,drafts:[backup.drafts[0],backup.drafts[0]]});await mobile.waitForFunction(()=>document.querySelector('#draft-global-status').textContent.includes('重复题号'));assert.equal(await mobile.locator('#draft-count').textContent(),'2');
  });
  await test('code Tab indents and Escape then Tab leaves the editor',async()=>{
   await open(mobile,1);await mobile.locator('#draft-java').fill('x');await mobile.locator('#draft-java').press('End');await mobile.keyboard.press('Tab');assert.equal(await mobile.locator('#draft-java').inputValue(),'x    ');await mobile.keyboard.press('Escape');await mobile.keyboard.press('Tab');assert.notEqual(await mobile.evaluate(()=>document.activeElement.id),'draft-java');await close(mobile);
  });
  const other=await context.newPage();await other.goto(article,{waitUntil:'networkidle'});
  await test('same-problem edits in another tab cannot silently overwrite active input',async()=>{
   await open(page,1);await page.locator('#draft-notes').fill('标签页 A');await saved(page);await open(other,1);await other.locator('#draft-notes').fill('标签页 B');await saved(other);await page.locator('#draft-conflict').waitFor({state:'visible'});assert.equal(await page.locator('#draft-notes').inputValue(),'标签页 A');await page.locator('#draft-notes').fill('保留 A 的最新输入');await page.waitForTimeout(600);assert.equal((await read(page,1)).notes,'标签页 B');await page.locator('#draft-keep-mine').click();await saved(page);assert.equal((await read(page,1)).notes,'保留 A 的最新输入');await close(page);await close(other);
  });
  const quota=await browser.newContext({reducedMotion:'reduce'});await quota.addInitScript(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.startsWith('hot100-blog:draft:'))throw new DOMException('full','QuotaExceededError');return set.call(this,key,value);};});const qp=await quota.newPage();await qp.goto(article,{waitUntil:'networkidle'});
  await test('quota failure is visible and unsaved input remains exportable',async()=>{
   await open(qp,1);await qp.locator('#draft-notes').fill('空间不足时的最新笔记');await qp.waitForFunction(()=>document.querySelector('#draft-save-status').textContent.includes('未能保存'));assert.equal(await read(qp,1),null);const data=await downloadJSON(qp,'#draft-dialog-export');assert.equal(data.drafts[0].notes,'空间不足时的最新笔记');assert.match(await qp.locator('#problem-1 [data-draft-badge]').textContent(),/尚未保存/);
  });
  const denied=await browser.newContext({reducedMotion:'reduce'});await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError');}}));const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto(article,{waitUntil:'networkidle'});
  await test('blocked storage still permits editing and exporting a draft',async()=>{
   await open(dp,49);await dp.locator('#draft-notes').fill('存储受限，导出仍可用');await dp.waitForFunction(()=>document.querySelector('#draft-save-status').textContent.includes('未能保存'));const data=await downloadJSON(dp,'#draft-dialog-export');assert.equal(data.drafts[0].notes,'存储受限，导出仍可用');
  });
  const corrupt=await browser.newContext({reducedMotion:'reduce'});await corrupt.addInitScript(()=>localStorage.setItem('hot100-blog:draft:v1:1','{bad-json'));const cp=await corrupt.newPage();cp.on('pageerror',e=>errors.push(String(e)));await cp.goto(article,{waitUntil:'networkidle'});
  await test('corrupt stored data is reported without breaking other editors',async()=>{
   assert.match(await cp.locator('#draft-global-status').textContent(),/格式异常/);assert.equal(await cp.locator('[data-draft-open]:enabled').count(),100);await open(cp,49);await cp.locator('#draft-notes').fill('其他题目仍可保存');await saved(cp);assert.equal((await read(cp,49)).notes,'其他题目仍可保存');
  });
  await test('editor produces no upload requests or unhandled browser errors',async()=>{assert.deepEqual(mutations,[]);assert.deepEqual(errors,[]);});
  for(const [width,height,theme,label] of [[1440,1000,'light','desktop'],[390,844,'dark','mobile']]){
   const demo=await browser.newContext({viewport:{width,height},colorScheme:theme,reducedMotion:'reduce'});const demoPage=await demo.newPage();await demoPage.goto(article,{waitUntil:'networkidle'});await open(demoPage,1);
   await demoPage.locator('#draft-notes').fill('示例笔记：先查找补数，再把当前数字存入哈希表。\n复习时重点检查重复数字与下标复用。');await saved(demoPage);await demoPage.locator('#draft-dialog').evaluate(el=>el.scrollTop=0);
   const shot=`editor-${label}-${theme}.png`;await demoPage.screenshot({path:'docs/screenshots/'+shot});report.screenshots.push(shot);await demo.close();
  }
  report.passed=true;report.chromiumVersion=browser.version();
 }catch(error){report.passed=false;report.error=String(error);console.error(error);process.exitCode=1;}
 finally{await browser.close();await fs.writeFile('docs/checks/drafts-qa.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
})();
