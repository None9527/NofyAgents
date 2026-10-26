/** Compatibility entry; geometry decisions have one owner in windowLayout. */
import { resolveWorkArea, WINDOW_LAYOUT } from "./windowLayout.ts";
export const CHAT_MIN_WIDTH = WINDOW_LAYOUT.conversationMin;
export const AUX_MIN_WIDTH = 320;
export const PANE_HANDLE_WIDTH = WINDOW_LAYOUT.divider;
export const CHAT_CHROME_WIDTH = 0;
export function resolveConversationSplit(available:number, preferred:number) { return resolveWorkArea(available,preferred); }
