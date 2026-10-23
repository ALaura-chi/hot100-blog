type Draft = {version:1; problemId:number; notes:string; java:string; updatedAt:string};
const PREFIX = 'hot100-blog:draft:v1:';
const NOTES_LIMIT = 20000, JAVA_LIMIT = 100000;

export function initDrafts() {
  const dialog = document.querySelector<HTMLDialogElement>('#draft-dialog');
  if (!dialog) return;
  const element = <T extends HTMLElement>(id:string) => {
    const found = document.getElementById(id); if (!found) throw new Error(`Missing draft control: ${id}`);
    return found as T;
  };
  const notes = element<HTMLTextAreaElement>('draft-notes'), java = element<HTMLTextAreaElement>('draft-java');
  const count = element('draft-count'), globalStatus = element('draft-global-status'), saveStatus = element('draft-save-status');
  const exportButton = element<HTMLButtonElement>('draft-export'), fileInput = element<HTMLInputElement>('draft-file');
  const importReview = element('draft-import-review'), conflictPanel = element('draft-conflict');
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-draft-open]')];
  const sections = new Map(buttons.map(button=>[Number(button.dataset.draftOpen),button.closest<HTMLElement>('[data-problem]')!]));
  const drafts = new Map<number,Draft>(), unsaved = new Set<number>();
  const conflicts = new Map<number,Draft|null>();
  let current:number|null = null, opener:HTMLButtonElement|null = null, timer:number|undefined;
  let importCandidates:Draft[] = [], tabCanLeave = false;
  const feedback = (text:string,error=false) => { globalStatus.textContent=text; globalStatus.dataset.error=String(error); };
  const status = (text:string,error=false) => { saveStatus.textContent=text; saveStatus.dataset.error=String(error); };
  const time = (value:string) => new Date(value).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});

  function validate(value:unknown):Draft {
    if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('草稿条目格式不正确');
    const data = value as Record<string,unknown>;
    if(data.version!==1 || typeof data.problemId!=='number' || !sections.has(data.problemId)) throw new Error('备份包含不属于当前 Hot 100 的题目或不支持的版本');
    if(typeof data.notes!=='string' || data.notes.length>NOTES_LIMIT || typeof data.java!=='string' || data.java.length>JAVA_LIMIT) throw new Error('笔记或 Java 内容格式不正确，或超过长度限制');
    if(typeof data.updatedAt!=='string' || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('草稿保存时间不正确');
    return {version:1,problemId:data.problemId,notes:data.notes,java:data.java,updatedAt:data.updatedAt};
  }
  function refreshCount() { count.textContent=String(drafts.size); exportButton.disabled=drafts.size===0; }
  function refreshBadge(id:number) {
    const badge=sections.get(id)?.querySelector<HTMLElement>('[data-draft-badge]'); if(!badge)return;
    badge.hidden=!drafts.has(id); badge.textContent=unsaved.has(id)?'草稿尚未保存':'已有本机草稿';
  }
  function renderPreview(id:number) {
    const section=sections.get(id); if(!section)return;
    const previous=section.querySelector<HTMLDetailsElement>('.local-draft-preview');
    const expanded=previous?.open || false;previous?.remove();
    const draft=drafts.get(id); refreshBadge(id); refreshCount(); if(!draft)return;
    const preview=document.createElement('details'); preview.className='local-draft-preview';preview.open=expanded;
    const summary=document.createElement('summary');summary.textContent=`我的草稿 · ${unsaved.has(id)?'尚未保存':`本机已保存 ${time(draft.updatedAt)}`}`;
    const body=document.createElement('div');
    const note=document.createElement('p');note.textContent=draft.notes || '尚未填写复盘笔记';body.append(note);
    if(draft.java){const pre=document.createElement('pre'),code=document.createElement('code');code.textContent=draft.java;pre.append(code);body.append(pre);}
    preview.append(summary,body);section.insertBefore(preview,section.querySelector('.prose'));
  }
  function persist(draft:Draft) {
    try {
      localStorage.setItem(PREFIX+draft.problemId,JSON.stringify(draft));unsaved.delete(draft.problemId);
      if(current===draft.problemId)status(`已自动保存到本机 · ${time(draft.updatedAt)}`);
      if(globalStatus.dataset.error==='true' && unsaved.size===0)feedback('当前草稿均已保存到本机。');
      renderPreview(draft.problemId);return true;
    } catch(error) {
      unsaved.add(draft.problemId);
      const message=error instanceof DOMException && error.name==='QuotaExceededError'?'浏览器存储空间不足':'浏览器暂不允许保存';
      feedback(`${message}，最新草稿仅保留在本页，请导出备份。`,true);
      if(current===draft.problemId)status('未能保存到本机，请导出备份；此时刷新可能丢失最新输入。',true);
      renderPreview(draft.problemId);return false;
    }
  }
  function flush() {
    window.clearTimeout(timer);timer=undefined;
    if(current===null || !unsaved.has(current))return;
    if(conflicts.has(current)){status('存在另一标签页的修改，请先选择要保留的版本。',true);return;}
    const draft=drafts.get(current);if(draft)persist(draft);
  }
  function edited() {
    if(current===null)return;
    drafts.set(current,{version:1,problemId:current,notes:notes.value,java:java.value,updatedAt:new Date().toISOString()});
    unsaved.add(current);refreshBadge(current);refreshCount();window.clearTimeout(timer);
    if(conflicts.has(current)){status('请先处理另一标签页的修改；当前输入仍保留在本页。',true);return;}
    status('正在保存…');timer=window.setTimeout(flush,400);
  }
  function fillFields(id:number) {
    const draft=drafts.get(id); notes.value=draft?.notes || '';
    java.value=draft ? draft.java : sections.get(id)?.querySelector('.prose pre code')?.textContent || '';
    conflictPanel.hidden=!conflicts.has(id);tabCanLeave=false;
    if(conflicts.has(id))status('存在另一标签页的修改，请先选择版本。',true);
    else if(unsaved.has(id))status('当前草稿尚未保存到本机，请重试保存或导出备份。',true);
    else status(draft?`已保存到本机 · ${time(draft.updatedAt)}`:'输入后自动保存；当前示例代码可直接修改。');
  }
  for(const [id] of sections) {
    let raw:string|null;
    try { raw=localStorage.getItem(PREFIX+id); }
    catch { feedback('浏览器暂不允许持久保存；仍可编辑并导出本页草稿。',true);break; }
    if(!raw)continue;
    try { const draft=validate(JSON.parse(raw));if(draft.problemId!==id)throw new Error('题号不一致');drafts.set(id,draft);renderPreview(id); }
    catch { feedback('有一条本机草稿格式异常，已保留原始数据；其他草稿仍可使用。',true); }
  }
  refreshCount();
  for(const button of buttons) {
    button.disabled=false;
    button.addEventListener('click',()=>{
      flush();current=Number(button.dataset.draftOpen);opener=button;
      element('draft-dialog-title').textContent=`${current}、${button.dataset.problemTitle} · 我的草稿`;
      fillFields(current);dialog.showModal();notes.focus({preventScroll:true});
    });
  }
  notes.addEventListener('input',edited);java.addEventListener('input',edited);
  java.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !tabCanLeave){tabCanLeave=true;event.preventDefault();event.stopPropagation();return;}
    if(event.key==='Tab' && !event.shiftKey && !tabCanLeave){event.preventDefault();java.setRangeText('    ',java.selectionStart,java.selectionEnd,'end');edited();return;}
    tabCanLeave=false;
  });
  element('draft-close').addEventListener('click',()=>{flush();dialog.close();});
  element('draft-save-close').addEventListener('click',()=>{flush();if(current!==null && unsaved.has(current))return;dialog.close();});
  dialog.addEventListener('close',()=>{flush();if(current!==null)sections.get(current)?.querySelector<HTMLDetailsElement>('.local-draft-preview')?.setAttribute('open','');opener?.focus({preventScroll:true});});
  dialog.addEventListener('cancel',flush);
  window.addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
  element('draft-copy').addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(java.value);status('草稿 Java 已复制。'); }
    catch { status('复制失败，请选中 Java 草稿后手动复制。',true); }
  });
  function exportAll() {
    flush();
    const backup={format:'hot100-blog-drafts',version:1,exportedAt:new Date().toISOString(),drafts:[...drafts.values()].sort((a,b)=>a.problemId-b.problemId)};
    const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=`hot100-drafts-${new Date().toISOString().slice(0,10)}.json`;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    feedback(`已导出 ${drafts.size} 题草稿备份。${unsaved.size?'包含尚未保存到本机的最新输入。':''}`);
  }
  exportButton.addEventListener('click',exportAll);
  // A dialog-local backup button is available even if storage or another tab blocks saving.
  const dialogExport=document.createElement('button');dialogExport.type='button';dialogExport.textContent='导出草稿备份';dialogExport.id='draft-dialog-export';
  dialogExport.addEventListener('click',exportAll);dialog.querySelector('.draft-dialog-footer')?.prepend(dialogExport);
  element('draft-import').addEventListener('click',()=>fileInput.click());
  fileInput.addEventListener('change',async()=>{
    const file=fileInput.files?.[0];if(!file)return;
    importCandidates=[];importReview.hidden=true;
    try {
      if(file.size>80*1024*1024)throw new Error('备份文件超过 80 MB');
      const backup=JSON.parse(await file.text());
      if(!backup || backup.format!=='hot100-blog-drafts' || backup.version!==1 || !Array.isArray(backup.drafts) || backup.drafts.length>100)throw new Error('不是受支持的 Hot 100 草稿备份');
      const parsed:Draft[]=backup.drafts.map((value:unknown)=>validate(value));
      if(new Set(parsed.map(draft=>draft.problemId)).size!==parsed.length)throw new Error('备份包含重复题号');
      if(!parsed.length)throw new Error('备份中没有草稿');
      importCandidates=parsed;
      const replaced=parsed.filter(draft=>drafts.has(draft.problemId)).length;
      element('draft-import-description').textContent=`将导入 ${parsed.length} 题草稿，替换其中 ${replaced} 题的当前草稿。确认后生效，其他题目保留。`;
      importReview.hidden=false;element<HTMLButtonElement>('draft-import-confirm').focus();
    } catch(error) { feedback(`未导入：${error instanceof Error?error.message:'文件格式不正确'}。现有草稿保持原样。`,true); }
    finally { fileInput.value=''; }
  });
  element('draft-import-cancel').addEventListener('click',()=>{importCandidates=[];importReview.hidden=true;feedback('已取消导入，现有草稿保持原样。');});
  element('draft-import-confirm').addEventListener('click',()=>{
    let saved=0;
    for(const draft of importCandidates){drafts.set(draft.problemId,draft);conflicts.delete(draft.problemId);if(persist(draft))saved++;}
    const total=importCandidates.length;importCandidates=[];importReview.hidden=true;refreshCount();
    feedback(saved===total?`已导入并保存 ${saved} 题草稿。`:`已载入 ${total} 题，其中 ${saved} 题成功保存到本机；其余暂留本页，请导出备份。`,saved!==total);
  });
  element('draft-use-other').addEventListener('click',()=>{
    if(current===null)return;
    const other=conflicts.get(current);window.clearTimeout(timer);
    if(other)drafts.set(current,other);else drafts.delete(current);
    conflicts.delete(current);unsaved.delete(current);fillFields(current);renderPreview(current);
  });
  element('draft-keep-mine').addEventListener('click',()=>{
    if(current===null)return;conflicts.delete(current);conflictPanel.hidden=true;edited();flush();
  });
  window.addEventListener('storage',event=>{
    if(event.key!==null && !event.key.startsWith(PREFIX))return;
    const ids=event.key===null?[...drafts.keys()]:[Number(event.key.slice(PREFIX.length))];
    for(const id of ids){
      if(!sections.has(id))continue;
      let other:Draft|null=null;
      try{if(event.newValue)other=validate(JSON.parse(event.newValue));if(other && other.problemId!==id)continue;}
      catch{feedback('另一标签页写入了无法读取的草稿，当前输入已保留。',true);continue;}
      if((dialog.open && current===id) || unsaved.has(id)){
        conflicts.set(id,other);unsaved.add(id);window.clearTimeout(timer);refreshBadge(id);
        if(current===id){conflictPanel.hidden=false;status('另一标签页修改了这道题，请选择要保留的版本。',true);}
      }else{if(other)drafts.set(id,other);else drafts.delete(id);renderPreview(id);}
    }
  });
}
