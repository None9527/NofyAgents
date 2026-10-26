/** Calibrated local performance gate: each trial and pooled input samples must pass. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { cpus, totalmem } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const budget=JSON.parse(await readFile(join(root,'performance-budget.json'),'utf8'));
if(process.platform!=='darwin'||process.arch!=='arm64')throw new Error('This calibrated gate requires macOS arm64. Record a platform baseline before enabling it elsewhere.');
const output=join(root,'output/performance',`gate-${new Date().toISOString().replaceAll(':','-')}`);await mkdir(output,{recursive:true});
const report={budget,environment:{platform:process.platform,arch:process.arch,node:process.version,cpu:cpus()[0]?.model,memoryBytes:totalmem()},trials:[],summary:[],failures:[]};
const reject=(condition,message)=>{if(!condition)report.failures.push(message);};
for(let trial=1;trial<=budget.trials;trial++){
 const label=`after-shell-gate-${trial}`;
 const {stdout,stderr}=await promisify(execFile)(process.execPath,['apps/desktop/e2e/conversation-performance.mjs',label],{cwd:root,maxBuffer:1024*1024,timeout:180000});
 const path=stdout.match(/Report (.+\/report\.json)/)?.[1]?.trim();if(!path)throw new Error('Missing benchmark report');
 const result=JSON.parse(await readFile(path,'utf8'));report.trials.push({trial,path,result});
 reject(!result.error&&!result.consoleErrors.length,`trial ${trial}: renderer errors`);
 for(const item of result.cases){
  const tag=`trial ${trial}, ${item.size} blocks`;
  reject(item.editing.inputFrames.length===budget.inputSamplesPerCase,tag+': input sample count');
  reject(item.editing.inputToFrameP95Ms<=budget.maxInputToFrameP95Ms,tag+': input p95');
  reject(item.load.domBlocks<=budget.maxMountedMessageBlocks&&item.stream.domBlocks<=budget.maxMountedMessageBlocks,tag+': DOM range');
  reject((item.stream.counts.App??0)<=budget.maxStreamAppRenders,tag+': App renders');
  reject((item.stream.counts.Composer??0)<=budget.maxStreamComposerRenders,tag+': Composer renders');
  reject(Math.max(0,...item.editing.longTasks)<budget.maxInputLongTaskMs,tag+': input long task');
  reject(item.load.loadMs<=budget.maxCorpusLoadMs,tag+': corpus load');
 }
 await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));console.log(`Performance trial ${trial}/${budget.trials} completed`);
 if(stderr)console.log(stderr.trim());
}
for(const size of [1000,10000]){
 const cases=report.trials.map(trial=>trial.result.cases.find(item=>item.size===size));
 const input=cases.flatMap(item=>item.editing.inputFrames).sort((a,b)=>a-b);
 const p95=input[Math.ceil(input.length*.95)-1];report.summary.push({size,inputSamples:input.length,pooledInputToFrameP95Ms:p95,trialInputP95Ms:cases.map(item=>item.editing.inputToFrameP95Ms),domBlocks:cases.map(item=>item.load.domBlocks),streamAppRenders:cases.map(item=>item.stream.counts.App??0)});
 reject(p95<=budget.maxInputToFrameP95Ms,`${size} blocks: pooled p95`);
}
await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));console.log('Report '+join(output,'report.json'));
if(report.failures.length){console.error(report.failures.join('\n'));process.exitCode=1;}
