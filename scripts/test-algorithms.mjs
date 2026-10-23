import { spawnSync } from 'node:child_process';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
await mkdir('.java-classes',{recursive:true});
const sources = (await readdir('examples/java')).filter(name=>name.endsWith('.java')).map(name=>`examples/java/${name}`);
const compiled = spawnSync('javac',['-encoding','UTF-8','-d','.java-classes',...sources],{encoding:'utf8'});
if (compiled.status !== 0) { console.error(compiled.stderr || compiled.error); process.exit(1); }
const tested = spawnSync('java',['-cp','.java-classes','AlgorithmTests'],{encoding:'utf8'});
console.log(tested.stdout); if(tested.status !== 0){console.error(tested.stderr); process.exit(1);}
await mkdir('docs/checks',{recursive:true});
await writeFile('docs/checks/java-tests.txt',tested.stdout);
