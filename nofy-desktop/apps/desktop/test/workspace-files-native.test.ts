import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm, symlink, truncate } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readRaster, watchWorkspace } from "../main/seam/workspace-files.ts";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR5sAAAAASUVORK5CYII=","base64");
async function fixture(run: (root: string) => Promise<void>) { const root = await mkdtemp(join(tmpdir(),"nofy-raster-")); try { await run(root); } finally { await rm(root,{recursive:true,force:true}); } }
test("raster preview returns bounded inert image data and byte count", () => fixture(async root => {
  const path=join(root,"图片 with spaces.png"); await writeFile(path,png); const result=await readRaster(root,path); assert.equal(result.ok,true); if(result.ok){assert.ok(result.dataUrl.startsWith("data:image/png;base64,"));assert.equal(result.size,png.length);}
}));
test("raster path rejects relative inputs and symlink escapes", () => fixture(async root => {
  const outside=await mkdtemp(join(tmpdir(),"nofy-raster-outside-")); try { await writeFile(join(outside,"a.png"),png); await symlink(join(outside,"a.png"),join(root,"link.png")); assert.equal((await readRaster(root,join(root,"link.png"))).ok,false); assert.equal((await readRaster(root,"a.png")).ok,false); } finally { await rm(outside,{recursive:true,force:true}); }
}));
test("renaming active markup to png does not permit executable content", () => fixture(async root => {
  const path=join(root,"fake.png"); await writeFile(path,"<svg onload='alert(1)' />"); assert.equal((await readRaster(root,path)).ok,false);
}));
test("oversized bytes and known excessive image dimensions are refused", () => fixture(async root => {
  const path=join(root,"huge.png"); await writeFile(path,png); await truncate(path,9*1024*1024); assert.equal((await readRaster(root,path)).ok,false);
  const bytes=Buffer.from(png);bytes.writeUInt32BE(10000,16);bytes.writeUInt32BE(10000,20);await writeFile(path,bytes);assert.equal((await readRaster(root,path)).ok,false);
}));
test("workspace changes are scoped, coalesced and cease after watcher disposal", () => fixture(async root => {
  const events: Array<{paths:string[]}> = []; let resolve!:()=>void; const received=new Promise<void>(done=>resolve=done);
  const stop=await watchWorkspace({id:"test",root,directories:[]},change=>{events.push(change);resolve();});
  try { await writeFile(join(root,"A.txt"),"one");await writeFile(join(root,"B.txt"),"two");await Promise.race([received,new Promise((_,reject)=>setTimeout(()=>reject(new Error("watch timeout")),3000))]);assert.ok(events[0]!.paths.every(path=>path.startsWith(root+"/")));stop();const count=events.length;await writeFile(join(root,"A.txt"),"three");await new Promise(done=>setTimeout(done,150));assert.equal(events.length,count); } finally { stop(); }
}));
test("watcher bounds and invalid roots are rejected before subscribing", () => fixture(async root => {
  await assert.rejects(()=>watchWorkspace({id:"test",root,directories:Array(33).fill(root)},()=>{}));await assert.rejects(()=>watchWorkspace({id:"test",root:"relative",directories:[]},()=>{}));
}));
