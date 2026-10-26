import assert from "node:assert/strict";
import test from "node:test";
import { resolveWorkArea, resolveWindowLayout, resolveDockHeight } from "../renderer/ui/windowLayout.ts";

test("all panel widths reserve readable conversation space or use a modal",()=>{
  for(let available=0;available<=2000;available++) for(const sizing of ["auto","fixed"] as const) for(const preferred of [0,320,548,760,Infinity,NaN]) {
    const pane=resolveWorkArea(available,preferred,sizing);
    assert.ok(Number.isFinite(pane.width)&&pane.width>=320&&pane.width<=4096);
    if(pane.mode==="split")assert.ok(available-pane.width-1>=280);
    else assert.ok(available<601);
  }
});
test("automatic allocation shares space; explicit resize is respected and bounded",()=>{
  assert.equal(resolveWorkArea(1015,548,"auto").width,406);
  assert.equal(resolveWorkArea(1440,548,"auto").width,548);
  assert.equal(resolveWorkArea(1440,640,"fixed").width,640);
  assert.equal(resolveWorkArea(1015,640,"fixed").width,640);
  assert.equal(resolveWorkArea(1600,4000,"fixed").width,1319);
  assert.equal(resolveWorkArea(1000,4000,"fixed").width,719);
  assert.equal(resolveWorkArea(950,4000,"auto").width,349);
});
test("navigation folds before it can starve the main view; preference is not mutated",()=>{
  const prefs={sidebarOpen:true,sidebarWidth:480};
  assert.equal(resolveWindowLayout(880,prefs).sidebarShouldFold,true);
  assert.equal(resolveWindowLayout(880,{...prefs,sidebarWidth:264}).sidebarShouldFold,false);
  assert.equal(resolveWindowLayout(0,prefs).sidebarShouldFold,false);
  assert.equal(resolveWindowLayout(880,{...prefs,sidebarOpen:false}).sidebarShouldFold,false);
  assert.equal(prefs.sidebarWidth,480);
});
test("bottom tools cannot consume the conversation's whole height",()=>{
  for(const height of [560,700,900,1080]) for(const preferred of [140,280,640,NaN]) {
    const dock=resolveDockHeight(height,preferred);
    assert.ok(dock>=140&&dock<=(height-48)*.45);
  }
});
