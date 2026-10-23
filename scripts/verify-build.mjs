import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const dist = path.resolve('dist');
const base = '/hot100-blog';
const problems = JSON.parse(await readFile(path.join(dist,'problems.json'),'utf8'));
const original = JSON.parse(await readFile('src/data/problem-index.json','utf8'));
const reader = await readFile(path.join(dist,'posts/hot_100/index.html'),'utf8');
assert.equal(problems.length,100,'Expected 100 problems');
assert.equal(new Set(problems.map(p=>p.problemId)).size,100,'Duplicate problem number');
assert.equal(new Set(problems.map(p=>p.order)).size,100,'Duplicate order');
assert.equal(new Set(problems.map(p=>p.category)).size,17,'Expected 17 categories');
assert.equal(new Set(problems.map(p=>p.leetcode)).size,100,'Duplicate LeetCode URL');
const htmlIds = html => [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const mainIds = htmlIds(reader);
for(let i=0;i<100;i++){
  const problem=problems[i], expected=original[i];
  for(const key of ['problemId','title','category','difficulty','order','leetcode']) assert.deepEqual(problem[key],expected[key],`Metadata mismatch: ${key} at ${i+1}`);
  assert.equal(problem.order,i+1,'Invalid order range');
  assert.ok(['easy','medium','hard'].includes(problem.difficulty),'Invalid difficulty');
  assert.ok(['unstarted','assisted','independent','review'].includes(problem.status),'Invalid status');
  assert.match(problem.leetcode,/^https:\/\/leetcode\.cn\/problems\/[a-z0-9-]+\/$/,'Nonofficial URL');
  assert.ok(mainIds.includes(`problem-${problem.problemId}`),`Missing problem anchor: ${problem.problemId}`);
}
assert.equal([...reader.matchAll(/data-problem="\d+"/g)].length,100,'Wrong article problem count');
assert.equal([...reader.matchAll(/data-problem-id="\d+"/g)].length,100,'Wrong index problem count');
assert.equal(mainIds.filter(id=>id.startsWith('category-')).length,17,'Wrong category anchor count');
const fullExampleNotes=problems.filter(p=>p.noteReady).length;
for(const id of [1,283,42,200,287])assert.ok(problems.find(p=>p.problemId===id)?.noteReady,`Missing required example note: ${id}`);
async function filesIn(directory){let files=[];for(const entry of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);files.push(...(entry.isDirectory()?await filesIn(file):[file]));}return files;}
const htmlFiles=(await filesIn(dist)).filter(file=>file.endsWith('.html'));
let checkedLinks=0,checkedAssets=0;
for(const file of htmlFiles){
  const html=await readFile(file,'utf8'), ids=htmlIds(html);
  assert.equal(ids.length,new Set(ids).size,`Duplicate HTML id: ${file}`);
  assert.match(html,/<html[^>]*lang="zh-CN"/,'Missing Chinese language');
  assert.equal([...html.matchAll(/<main\b/g)].length,1,'Expected one main landmark');
  const relative=path.relative(dist,file).replaceAll('\\','/').replace(/index\.html$/,'');
  const pageUrl=new URL(`${base}/${relative}`,'https://local.invalid');
  for(const tag of html.matchAll(/<(a|link|script|img)\b[^>]*>/g)){
    const attr=tag[0].match(/\b(?:href|src)="([^"]+)"/);if(!attr)continue;
    const value=attr[1];if(/^(?:https?:|mailto:|tel:|data:)/.test(value))continue;
    const url=new URL(value,pageUrl);
    assert.ok(url.pathname===base||url.pathname.startsWith(base+'/'),`Missing base prefix: ${value}`);
    const stripped=decodeURIComponent(url.pathname.slice(base.length)).replace(/^\//,'');
    let target=path.join(dist,stripped);
    const targetInfo=await stat(target).catch(()=>null);
    if(targetInfo?.isDirectory())target=path.join(target,'index.html');
    assert.ok(await stat(target).then(s=>s.isFile()).catch(()=>false),`Missing local resource: ${value} in ${file}`);
    if(url.hash){const targetHtml=target===file?html:await readFile(target,'utf8');assert.ok(htmlIds(targetHtml).includes(decodeURIComponent(url.hash.slice(1))),`Missing hash target: ${value}`);}
    if(tag[1]==='a')checkedLinks++;else checkedAssets++;
  }
}
for(const file of ['index.html','posts/hot_100/index.html','categories/index.html','about/index.html','404.html','problems.json'])assert.ok(await stat(path.join(dist,file)),`Missing output ${file}`);
const report={problems:100,categories:17,fullExampleNotes,pages:htmlFiles.length,checkedLinks,checkedAssets,base,passed:true};
await mkdir('docs/checks',{recursive:true});await writeFile('docs/checks/build-verification.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: '+JSON.stringify(report));
