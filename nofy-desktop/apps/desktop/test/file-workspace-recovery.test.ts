import test from "node:test";
import assert from "node:assert/strict";
import { decodeFileWorkspaceView, encodeFileWorkspaceView } from "../renderer/application/workspace/fileWorkspacePrefs.ts";
import { filePreviewKind } from "../renderer/application/workspace/fileCapabilities.ts";
import { createFileResources } from "../renderer/application/workspace/fileResources.ts";
import type { FilesClient } from "../renderer/application/contracts/public.ts";
const file=(content:string)=>({ok:true as const,value:{content,size:1,lineCount:1,type:"text"}});
const list=async()=>({ok:true as const,value:{nodes:[],truncated:false}});
test("view recovery persists only pinned tabs and separate reading positions, not document content",()=>{
  const resources={tabs:[{path:"/root/A.md",pinned:true,mode:"source" as const,positions:{source:240,preview:400}},{path:"/root/B.ts",pinned:false,mode:"source" as const,positions:{source:0,preview:0}}],active:"/root/A.md"};
  const saved=encodeFileWorkspaceView({resources,expanded:["/root/sub"],treeOpen:false,treeWidth:310});const recovered=decodeFileWorkspaceView(saved,"/root")!;assert.equal(recovered.resources.tabs.length,1);assert.deepEqual(recovered.resources.tabs[0]!.positions,{source:240,preview:400});assert.equal(recovered.treeWidth,310);assert.equal(recovered.treeOpen,false);assert.ok(!JSON.stringify(saved).includes("content"));
});
test("view decoder rejects traversal, external paths, duplicate tabs and invalid positions",()=>{
  const decoded=decodeFileWorkspaceView({tabs:[{path:"/root/../secret"},{path:"/other/A"},{path:"/root/A",positions:{source:-4,preview:Infinity}},{path:"/root/A"}],expanded:["/other","/root/../escape"],active:"/other/A",treeWidth:9999},"/root")!;assert.equal(decoded.resources.tabs.length,1);assert.deepEqual(decoded.expanded,[]);assert.deepEqual(decoded.resources.tabs[0]!.positions,{source:0,preview:0});assert.equal(decoded.treeWidth,480);
});
test("preview capabilities group supported raster and unsupported interactive/binary formats",()=>{
  assert.equal(filePreviewKind("/a.PNG"),"image");assert.equal(filePreviewKind("/a.md"),"markdown");for(const path of ["/a.svg","/a.zip","/a.pdf"])assert.equal(filePreviewKind(path),"unsupported");assert.equal(filePreviewKind("/Cargo.toml"),"text");
});
test("file invalidation supersedes an in-flight old read",async()=>{
  const replies:Array<(value:ReturnType<typeof file>)=>void>=[];
  const owner=createFileResources({list,read:()=>new Promise(done=>replies.push(done))} as unknown as FilesClient,"A",()=>true);const old=owner.openFile("/root/A.ts",true);owner.invalidate("/root",["/root/A.ts"]);assert.equal(replies.length,2);replies[1]!(file("new"));await new Promise(done=>setTimeout(done,0));replies[0]!(file("old"));await old;assert.equal(owner.getSnapshot().preview?.file?.content,"new");
});
test("refresh failures retain last known content with an explicit stale flag",async()=>{
  let fail=false;const owner=createFileResources({list,read:async()=>fail?{ok:false,error:"deleted"}:file("old")} as unknown as FilesClient,"A",()=>true);await owner.openFile("/root/A.ts",true);fail=true;owner.refresh("/root");await new Promise(done=>setTimeout(done,0));const document=owner.getSnapshot().documents["/root/A.ts"]!;assert.equal(document.file?.content,"old");assert.equal(document.stale,true);assert.equal(document.error,"deleted");
});
test("connection epochs recover view metadata but fetch fresh content",async()=>{
  const { fileWorkspaceOwner } = await import("../renderer/application/workspace/fileWorkspaceCache.ts");
  const { initialState } = await import("../renderer/core/store/state.ts");
  const prior = Object.getOwnPropertyDescriptor(globalThis,"window"); const saved = new Map<string,string>();
  Object.defineProperty(globalThis,"window",{configurable:true,value:{localStorage:{getItem:(key:string)=>saved.get(key)??null,setItem:(key:string,value:string)=>saved.set(key,value)}}});
  try {
    const state=initialState();state.connection.status="ready";state.activeSessionId="A";let reads=0;
    const client={files:{list,read:async()=>file(++reads===1?"old":"fresh")},projection:{getState:()=>state,subscribe:()=>()=>{}}} as unknown as import("../renderer/application/contracts/public.ts").DesktopClient;
    const before=fileWorkspaceOwner(client,"/root","A",0);await before.openFile("/root/A.md",true);before.setMode("/root/A.md","source");before.savePosition("/root/A.md","source",230);before.setTreeWidth(310);
    state.connection.transportEpoch=1;const after=fileWorkspaceOwner(client,"/root","A",1);assert.notEqual(after,before);assert.equal(after.getSnapshot().documents["/root/A.md"],undefined);assert.equal(after.getSnapshot().resources.tabs[0]!.positions.source,230);assert.equal(after.getSnapshot().treeWidth,310);
    after.refresh("/root");await new Promise(done=>setTimeout(done,0));assert.equal(after.getSnapshot().preview?.file?.content,"fresh");assert.ok(![...saved.values()].join("").includes('"content"'));
  } finally { if(prior)Object.defineProperty(globalThis,"window",prior);else Reflect.deleteProperty(globalThis,"window"); }
});
test("directory invalidation supersedes a pending stale listing",async()=>{
  const replies:Array<(value:{ok:true;value:{nodes:[];truncated:boolean}})=>void>=[];
  const owner=createFileResources({list:()=>new Promise(done=>replies.push(done)),read:async()=>file("text")} as unknown as FilesClient,"A",()=>true);
  const first=owner.loadDir("/root");owner.invalidate("/root",["/root/new.txt"]);assert.equal(replies.length,2);replies[1]!({ok:true,value:{nodes:[],truncated:true}});await new Promise(done=>setTimeout(done,0));replies[0]!({ok:true,value:{nodes:[],truncated:false}});await first;assert.equal(owner.getSnapshot().dirs["/root"]!.truncated,true);
});
