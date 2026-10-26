import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import * as ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {getLocale,loadLocale,setLocale,subscribeLocale,tr} from '../renderer/ui/i18n.ts';
import {englishMessages} from '../renderer/ui/i18nMessages.ts';
import {useLocale} from '../renderer/ui/useLocale.ts';
test('all extracted static UI keys have English translations',()=>{
 const root=join(import.meta.dirname,'../renderer');const missing=new Set<string>();let count=0;
 function walk(dir:string){for(const entry of readdirSync(dir,{withFileTypes:true})){const file=join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.tsx?$/.test(file)){
  const sf=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
  function visit(node:ts.Node){if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='tr'&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0])){const key=node.arguments[0].text.replace(/\s+/g,' ').trim();count++;if(englishMessages[key]===undefined)missing.add(key);}ts.forEachChild(node,visit);}visit(sf);
 }}}walk(root);assert.ok(count>700,'resource extraction must cover the application');assert.deepEqual([...missing],[]);
});
test('locale subscription preserves default Chinese, supports removal and keeps backend values intact',()=>{
 setLocale('zh-CN');assert.equal(getLocale(),'zh-CN');assert.equal(tr('保存'),'保存');let calls=0;const off=subscribeLocale(()=>calls++);
 try{setLocale('en');assert.equal(tr('保存'),'Save');assert.equal(tr('不支持字段类型 {0}',['后端输出']),'Unsupported field type 后端输出');setLocale('en');assert.equal(calls,1);off();setLocale('zh-CN');assert.equal(calls,1);}finally{off();setLocale('zh-CN');}
});
test('locale hook renders current language without a Runtime or session reset',()=>{
 function Probe(){useLocale();return createElement('span',null,tr('保存'));}
 try{setLocale('en');assert.equal(renderToStaticMarkup(createElement(Probe)),'<span>Save</span>');setLocale('zh-CN');assert.equal(renderToStaticMarkup(createElement(Probe)),'<span>保存</span>');}finally{setLocale('zh-CN');}
});
test('locale preference survives storage failures and invalid saved values',()=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'localStorage');const map=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>map.set(key,value)}});
 try{setLocale('en');assert.equal(loadLocale(),'en');map.set('nofy-desktop:locale','bogus');assert.equal(loadLocale(),'zh-CN');}finally{setLocale('zh-CN');if(prior)Object.defineProperty(globalThis,'localStorage',prior);else Reflect.deleteProperty(globalThis,'localStorage');}
});
