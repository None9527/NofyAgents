/** Non-secret UI font preference; kernel config is never stored here. */
const KEY='nofy-desktop:font-size';
export const FONT_SIZES=[12,14,16,18] as const;
export function loadFontSize():number {
 try {const value=Number(window.localStorage.getItem(KEY));return FONT_SIZES.some(size=>size===value)?value:14;}catch{return 14;}
}
export function applyFontSize(value:number):void {
 const size=FONT_SIZES.some(size=>size===value)?value:14;
 document.documentElement.style.setProperty('--ui-font-size',String(size)+'px');
}
export function saveFontSize(value:number):void {
 applyFontSize(value);
 try {window.localStorage.setItem(KEY,String(value));}catch{/* Preferences are optional. */}
}
