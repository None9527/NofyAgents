import test from "node:test";
import assert from "node:assert/strict";
import { menuPosition } from "../renderer/ui/menuPosition.ts";
test("bottom composer menus open fully above the trigger",()=>{const p=menuPosition({left:450,right:650,top:750,bottom:780},240,200,{width:1280,height:860},true,"right");assert.equal(p.top,544);assert.equal(p.left,410);assert.ok(p.top+200<750);});
test("top triggers fall back below and stay inside the viewport",()=>{const p=menuPosition({left:10,right:30,top:15,bottom:40},224,240,{width:880,height:560},true,"left");assert.equal(p.top,46);assert.ok(p.top+240<=552);});
test("edge alignment clamps the complete menu horizontally",()=>{for(const left of [-20,850]){const p=menuPosition({left,right:left+20,top:300,bottom:320},224,100,{width:880,height:560},false,"left");assert.ok(p.left>=8&&p.left+224<=872);}});
test("tall lists get a bounded scroll area instead of squeezing rows",()=>{const p=menuPosition({left:100,right:200,top:300,bottom:330},224,2000,{width:880,height:560},true,"left");assert.equal(p.top,8);assert.equal(p.maxHeight,286);});
