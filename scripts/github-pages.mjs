// Credential Manager supplies credentials over stdin/stdout; secrets stay in memory.
// Never run this using a token pasted into the command line.
import { spawnSync } from 'node:child_process';
const owner='ALaura-chi', repo='hot100-blog';
const mode=process.argv[2] || 'status';
if(!['status','create','pages','runs'].includes(mode))throw new Error('Use status, create, pages or runs');
const credentials=spawnSync('git',['credential','fill'],{
 input:`protocol=https\nhost=github.com\nusername=${owner}\n\n`,encoding:'utf8',timeout:15000,windowsHide:true,
 env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'},
});
if(credentials.status!==0)throw new Error('请先通过 Git Credential Manager 登录 ALaura-chi；未读取到可用凭据。');
const secret=credentials.stdout.split(/\r?\n/).find(line=>line.startsWith('password='))?.slice(9);
if(!secret)throw new Error('Credential Manager did not return a credential.');
async function api(route,method='GET',body,allow404=false){
 const response=await fetch(`https://api.github.com${route}`,{method,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${secret}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 const data=await response.json().catch(()=>({}));
 if(allow404&&response.status===404)return null;
 if(!response.ok)throw new Error(`GitHub API ${response.status}: ${data.message || response.statusText}`);
 return data;
}
const user=await api('/user');
if(user.login.toLowerCase()!==owner.toLowerCase())throw new Error(`账号不符：当前为 ${user.login}，要求 ${owner}；未执行发布操作。`);
console.log(`Verified GitHub account: ${user.login}`);
let repository=await api(`/repos/${owner}/${repo}`,'GET',undefined,true);
if(mode==='create'&&!repository)repository=await api('/user/repos','POST',{name:repo,description:'ALaura 的 Hot 100 算法笔记 · Astro',private:false,auto_init:false});
if(repository)console.log(JSON.stringify({repository:repository.html_url,private:repository.private,size:repository.size,defaultBranch:repository.default_branch},null,2));
else console.log('Repository does not exist yet.');
if(mode==='pages'){
 if(!repository)throw new Error('Create the repository first.');
 let pages=await api(`/repos/${owner}/${repo}/pages`,'GET',undefined,true);
 if(!pages)pages=await api(`/repos/${owner}/${repo}/pages`,'POST',{build_type:'workflow'});
 else if(pages.build_type!=='workflow'){await api(`/repos/${owner}/${repo}/pages`,'PUT',{build_type:'workflow'});pages=await api(`/repos/${owner}/${repo}/pages`);}
 console.log(JSON.stringify({url:pages.html_url,buildType:pages.build_type,status:pages.status},null,2));
}
if(mode==='runs'){
 if(!repository)throw new Error('Repository not found.');
 const result=await api(`/repos/${owner}/${repo}/actions/runs?per_page=3`);
 console.log(JSON.stringify(result.workflow_runs.map(run=>({id:run.id,url:run.html_url,status:run.status,conclusion:run.conclusion,sha:run.head_sha})),null,2));
}
