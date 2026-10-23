const { chromium }=require(process.argv[2] || 'playwright');
const fs=require('node:fs/promises');
const target='https://alaura-chi.github.io/hot100-blog/posts/hot_100/';
(async()=>{
 const results=await Promise.all(['direct','http://127.0.0.1:7890','socks5://127.0.0.1:7890'].map(async proxy=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,...(proxy==='direct'?{}:{proxy:{server:proxy}})});
  try{const page=await browser.newPage();const response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:18000});return {proxy,status:response.status(),title:await page.title(),url:page.url()};}
  catch(error){return {proxy,error:String(error)};}finally{await browser.close();}
 }));
 await fs.writeFile('docs/checks/site-network.json',JSON.stringify({runAt:new Date().toISOString(),results},null,2)+'\n');console.log(JSON.stringify(results,null,2));
})();
