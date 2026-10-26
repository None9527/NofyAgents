/** Restricted JSON model writer. The caller must quiesce the single kernel before invoking writes. */
import {createHash,randomUUID} from 'node:crypto';
import {constants} from 'node:fs';
import {lstat,mkdir,open,rename,unlink} from 'node:fs/promises';
import {join} from 'node:path';
import type {ModelApiBackend,ModelConfigPatch,ModelConfigRow,ModelConfigSnapshot,ModelProviderRow} from '../../preload/model-config-contract.ts';
const MAX_BYTES=8*1024*1024;
const ABSENT_HASH=createHash('sha256').update('nofy-model-config:absent').digest('hex');
const BACKENDS:readonly ModelApiBackend[]=['chat_completions','responses','messages'];
type JsonObject=Record<string,unknown>;
type FileData={bytes:Buffer;dev:number;ino:number};
type Loaded={format:ModelConfigSnapshot['format'];data:FileData|null;config:JsonObject};
function hash(bytes:Buffer):string{return createHash('sha256').update(bytes).digest('hex');}
function object(value:unknown):JsonObject{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as JsonObject:{};}
function string(value:unknown):string|null{return typeof value==='string'?value:null;}
function backend(value:unknown):ModelApiBackend{return BACKENDS.includes(value as ModelApiBackend)?value as ModelApiBackend:'chat_completions';}
async function readRegular(path:string):Promise<FileData|null>{
 let handle;
 try { const info=await lstat(path); if(info.isSymbolicLink())throw new Error("Model config symlinks are not opened safely."); } catch(error) { if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error; }
 try{handle=await open(path,constants.O_RDONLY|(constants.O_NOFOLLOW??0));}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return null;throw new Error('Cannot open model config safely; check permissions and symlinks.');}
 try{const stat=await handle.stat();if(!stat.isFile()||stat.size>MAX_BYTES)throw new Error('Model config must be a regular file smaller than 8 MiB.');const bytes=await handle.readFile();if(bytes.length>MAX_BYTES)throw new Error('Model config exceeds 8 MiB.');return {bytes,dev:stat.dev,ino:stat.ino};}finally{await handle.close();}
}
async function load(home:string):Promise<Loaded>{
 const json=await readRegular(join(home,'config.json'));
 if(json){let parsed:unknown;try{parsed=JSON.parse(json.bytes.toString('utf8'));}catch{throw new Error('Model config JSON is invalid; the file was not changed.');}if(parsed===null||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Model config must contain a JSON object.');return {format:'json',data:json,config:parsed as JsonObject};}
 const toml=await readRegular(join(home,'config.toml'));return {format:toml?'toml':'missing',data:toml,config:{}};
}
function safeUrl(value:unknown):{baseUrl:string|null;hasHiddenUrlParts:boolean}{
 if(typeof value!=='string')return {baseUrl:null,hasHiddenUrlParts:false};
 try{const url=new URL(value);if(!['http:','https:'].includes(url.protocol))return {baseUrl:null,hasHiddenUrlParts:true};const hidden=!!(url.username||url.password||url.search||url.hash);url.username='';url.password='';url.search='';url.hash='';return {baseUrl:url.toString(),hasHiddenUrlParts:hidden};}catch{return {baseUrl:null,hasHiddenUrlParts:true};}
}
function hasCredentials(entry:JsonObject):boolean{return typeof entry['api_key']==='string'&&entry['api_key'].trim()!==''||entry['env_key']!==undefined||entry['auth_provider']!==undefined||entry['auth']!==undefined;}
function snapshot(loaded:Loaded):ModelConfigSnapshot{
 const {config,format,data}=loaded;const providerMap=object(config['model_providers']);const providers:ModelProviderRow[]=Object.entries(providerMap).map(([id,value])=>{const provider=object(value);return {id,...safeUrl(provider['base_url']),apiBackend:backend(provider['api_backend']),hasApiKey:hasCredentials(provider)};});
 const catalog=new Map<string,{entry:JsonObject;providerId:string|null}>();
 for(const [providerId,value]of Object.entries(providerMap))for(const [id,entry]of Object.entries(object(object(value)['models'])))catalog.set(id,{entry:object(entry),providerId});
 for(const [id,value]of Object.entries(object(config['model']))){const entry=object(value);catalog.set(id,{entry,providerId:string(entry['model_provider'])});}
 const models:ModelConfigRow[]=[...catalog].map(([id,{entry,providerId}])=>{const provider=providerId===null?{}:object(providerMap[providerId]);return {id,name:string(entry['name'])??id,model:string(entry['model'])??id,providerId,...safeUrl(entry['base_url']??provider['base_url']),apiBackend:backend(entry['api_backend']??provider['api_backend']),hasApiKey:hasCredentials(entry)||hasCredentials(provider),hasModelOverrides:providerId!==null&&(hasCredentials(entry)||entry['base_url']!==undefined||entry['api_base_url']!==undefined||entry['api_backend']!==undefined)};});
 return {revisionHash:data?hash(data.bytes):ABSENT_HASH,format,editable:format!=='toml',reason:format==='toml'?'Legacy TOML is read-only. Migrate to JSON separately before editing models.':null,defaultModelId:string(object(config['models'])['default']),models,providers};
}
export async function readModelConfig(home:string):Promise<ModelConfigSnapshot>{return snapshot(await load(home));}
function table(root:JsonObject,key:string):JsonObject{
 if(root[key]!==undefined&&(root[key]===null||typeof root[key]!=='object'||Array.isArray(root[key])))throw new Error('Unsupported config table shape; no fields were overwritten.');
 return {...object(root[key])};
}
function identifier(value:unknown,label:string):string{
 if(typeof value!=='string'||!value.trim()||value.length>160||/[\u0000-\u001f\u007f]/.test(value)||['__proto__','prototype','constructor'].includes(value))throw new Error('Invalid '+label+'.');return value.trim();
}
function validatePatch(patch:ModelConfigPatch):ModelConfigPatch{
 const input=object(patch);if(typeof input['expectedRevision']!=='string'||!/^[a-f0-9]{64}$/.test(input['expectedRevision']))throw new Error('A config revision is required.');
 const id=identifier(input['id'],'model ID'),name=identifier(input['name'],'model name');
 if(typeof input['makeDefault']!=='boolean')throw new Error('Default model selection must be boolean.');
 const result:ModelConfigPatch={expectedRevision:input['expectedRevision'],id,name,makeDefault:input['makeDefault']};
 if(input['providerId']!==undefined)result.providerId=identifier(input['providerId'],'provider ID');
 if(input['model']!==undefined)result.model=identifier(input['model'],'wire model ID');
 if(input['apiBackend']!==undefined){if(!BACKENDS.includes(input['apiBackend'] as ModelApiBackend))throw new Error('Unsupported model API backend.');result.apiBackend=input['apiBackend'] as ModelApiBackend;}
 if(input['apiKey']!==undefined){if(typeof input['apiKey']!=='string'||!input['apiKey'].trim()||input['apiKey'].length>8192||/[\r\n\0]/.test(input['apiKey']))throw new Error('API key must be non-empty and must not contain control characters.');result.apiKey=input['apiKey'].trim();}
 if(input['baseUrl']!==undefined){if(typeof input['baseUrl']!=='string'||input['baseUrl'].length>4096)throw new Error('Invalid model endpoint.');let url;try{url=new URL(input['baseUrl']);}catch{throw new Error('Invalid model endpoint.');}if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password||url.search||url.hash)throw new Error('Endpoint must be HTTP(S) without credentials, query or fragment.');result.baseUrl=url.toString();}
 return result;
}
function patchConfig(original:JsonObject,patch:ModelConfigPatch):JsonObject{
 const config={...original};const models=table(config,'model');const providerMap=table(config,'model_providers');
 let existing=object(models[patch.id]);let nestedOwner:string|null=null;
 if(!Object.hasOwn(models,patch.id)){for(const [id,value]of Object.entries(providerMap)){const nested=object(object(value)['models']);if(Object.hasOwn(nested,patch.id)){if(nestedOwner!==null)throw new Error('Model appears in multiple providers; edit the config manually to resolve ambiguity.');nestedOwner=id;existing=object(nested[patch.id]);}}}
 const entry:JsonObject={...existing,name:patch.name,model:patch.model??string(existing['model'])??patch.id};
 const targetProvider=patch.providerId??nestedOwner;
 if(targetProvider){
  const provider=table(providerMap,targetProvider);
  const ownOverride=existing['base_url']!==undefined||existing['api_base_url']!==undefined||existing['api_backend']!==undefined||hasCredentials(existing);
  const editNestedOverride=patch.providerId===undefined&&nestedOwner===targetProvider&&ownOverride;
  if(ownOverride&&!editNestedOverride&&(patch.baseUrl!==undefined||patch.apiKey!==undefined))throw new Error('This model overrides provider transport/auth. Edit it as a per-model entry to keep the overrides explicit.');
  const transportTarget=editNestedOverride?entry:provider;
  if(patch.baseUrl!==undefined){
   transportTarget['base_url']=patch.baseUrl;
   delete transportTarget['api_base_url'];
   // A model-specific override must also shadow a retained provider's alternate API-key route.
   if(editNestedOverride&&typeof provider['api_base_url']==='string')transportTarget['api_base_url']=patch.baseUrl;
  }
  if(patch.apiKey!==undefined)transportTarget['api_key']=patch.apiKey;
  if(patch.apiBackend!==undefined)transportTarget['api_backend']=patch.apiBackend;
  if(nestedOwner!==null&&nestedOwner!==targetProvider)throw new Error('Moving a nested model between providers requires a separate migration.');
  if(nestedOwner===targetProvider&&!Object.hasOwn(models,patch.id)){const nested=table(provider,'models');nested[patch.id]=entry;provider['models']=nested;}else{entry['model_provider']=targetProvider;models[patch.id]=entry;}
  providerMap[targetProvider]=provider;config['model_providers']=providerMap;
 }else{
  if(patch.baseUrl!==undefined){
   entry['base_url']=patch.baseUrl;
   delete entry['api_base_url'];
   const inheritedProvider=string(existing['model_provider']);
   if(inheritedProvider!==null&&typeof object(providerMap[inheritedProvider])['api_base_url']==='string')entry['api_base_url']=patch.baseUrl;
  }
  if(patch.apiKey!==undefined)entry['api_key']=patch.apiKey;
  if(patch.apiBackend!==undefined)entry['api_backend']=patch.apiBackend;
  models[patch.id]=entry;
 }
 if(Object.keys(models).length)config['model']=models;
 const effectiveUrl=entry['base_url']??(targetProvider?object(providerMap[targetProvider])['base_url']:null);
 if(typeof effectiveUrl!=='string'||!effectiveUrl.trim())throw new Error('A model endpoint is required for a new local model.');
 if(patch.makeDefault){const defaults=table(config,'models');defaults['default']=patch.id;config['models']=defaults;}
 return config;
}
/** Atomic replace plus advisory lock and two revision checks; caller serializes kernel lifecycle. */
export async function updateModelConfig(home:string,unsafePatch:ModelConfigPatch):Promise<ModelConfigSnapshot>{
 const patch=validatePatch(unsafePatch);await mkdir(home,{recursive:true,mode:0o700});const configPath=join(home,'config.json'),lockPath=join(home,'.nofy-desktop-model-config.lock');let lock;
 try{lock=await open(lockPath,'wx',0o600);}catch{throw new Error('Another desktop config write is active; retry after it finishes.');}
 let tempPath:string|null=null;
 try{
  const loaded=await load(home);if(loaded.format==='toml')throw new Error('Legacy TOML config is read-only; JSON migration is required.');
  const revision=loaded.data?hash(loaded.data.bytes):ABSENT_HASH;if(revision!==patch.expectedRevision)throw new Error('Config changed since it was opened. Reload before saving.');
  const config=patchConfig(loaded.config,patch);const bytes=Buffer.from(JSON.stringify(config,null,2)+'\n');if(bytes.length>MAX_BYTES)throw new Error('Updated config exceeds 8 MiB.');
  if(loaded.data){const backup=await open(join(home,'.config.json.nofy-desktop-backup-'+randomUUID()+'.json'),'wx',0o600);try{await backup.writeFile(loaded.data.bytes);await backup.sync();}finally{await backup.close();}}
  tempPath=join(home,'.config.json.nofy-desktop-'+randomUUID()+'.tmp');const temp=await open(tempPath,'wx',0o600);try{await temp.writeFile(bytes);await temp.sync();}finally{await temp.close();}
  const latest=await load(home);const latestRevision=latest.data?hash(latest.data.bytes):ABSENT_HASH;
  if(latestRevision!==revision||latest.format==='toml'||loaded.data&&latest.data&&(latest.data.dev!==loaded.data.dev||latest.data.ino!==loaded.data.ino))throw new Error('Config changed during save. No config fields were overwritten.');
  await rename(tempPath,configPath);tempPath=null;
  return readModelConfig(home);
 }finally{if(tempPath!==null)await unlink(tempPath).catch(()=>{});await lock.close();await unlink(lockPath).catch(()=>{});}
}
