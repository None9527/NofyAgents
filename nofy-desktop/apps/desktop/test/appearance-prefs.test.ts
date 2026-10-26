/// <reference lib="dom" />
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {applyTheme,loadTheme} from '../renderer/ui/theme.ts';
import {loadFontSize,saveFontSize} from '../renderer/ui/appearancePrefs.ts';
test('system theme responds to OS changes and cleans up when selecting a fixed theme',()=>{
 const savedWindow=Object.getOwnPropertyDescriptor(globalThis,'window');const savedDocument=Object.getOwnPropertyDescriptor(globalThis,'document');const savedNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 const listeners=new Set<()=>void>();const storage=new Map<string,string>();const css=new Map<string,string>();const html={className:'',style:{setProperty:(key:string,value:string)=>css.set(key,value)}};
 const media={matches:false,addEventListener:(_type:string,listener:()=>void)=>listeners.add(listener),removeEventListener:(_type:string,listener:()=>void)=>listeners.delete(listener)};
 Object.defineProperty(globalThis,'window',{configurable:true,value:{matchMedia:()=>media,localStorage:{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value)}}});
 Object.defineProperty(globalThis,'document',{configurable:true,value:{documentElement:html}});Object.defineProperty(globalThis,'navigator',{configurable:true,value:{platform:'Mac',userAgent:'test'}});
 try {
  assert.equal(loadTheme(),'dark');storage.set('nofy-desktop:theme','system');assert.equal(loadTheme(),'system');
  applyTheme('system');assert.match(html.className,/theme-zai-light/);assert.equal(listeners.size,1);
  media.matches=true;for(const listener of listeners)listener();assert.match(html.className,/theme-zai-dark/);
  applyTheme('light');assert.equal(listeners.size,0);
  saveFontSize(18);assert.equal(loadFontSize(),18);assert.equal(css.get('--ui-font-size'),'18px');
  storage.set('nofy-desktop:font-size','900');assert.equal(loadFontSize(),14);
 } finally {
  if(savedWindow)Object.defineProperty(globalThis,'window',savedWindow);else Reflect.deleteProperty(globalThis,'window');
  if(savedDocument)Object.defineProperty(globalThis,'document',savedDocument);else Reflect.deleteProperty(globalThis,'document');
  if(savedNavigator)Object.defineProperty(globalThis,'navigator',savedNavigator);else Reflect.deleteProperty(globalThis,'navigator');
 }
});
