import { createContext, createElement, useContext } from "react";
import type { ReactNode } from "react";

export const KeyboardScopeContext = createContext(true);
/** Hidden surfaces cannot leave their descendant's window-level bindings active. */
export function KeyboardScope({ enabled, children }: {enabled:boolean;children:ReactNode}) {
  const inherited = useContext(KeyboardScopeContext);
  return createElement(KeyboardScopeContext.Provider,{value:inherited&&enabled},children);
}
