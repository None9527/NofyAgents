import type { ToolEditPreview } from "./store/state.ts";
/** ACP ToolCallContent Diff schema: path/newText required, oldText optional. */
export function toolEditPreviews(content:unknown):ToolEditPreview[]|null {
  if(!Array.isArray(content))return null;
  const previews:ToolEditPreview[]=[];
  for(const item of content) {
    if(!item||typeof item!=="object")continue;
    const value=item as Record<string,unknown>;
    if(value.type!=="diff"||typeof value.path!=="string"||typeof value.newText!=="string")continue;
    previews.push({path:value.path,newText:value.newText,oldText:typeof value.oldText==="string"?value.oldText:null});
  }
  return previews.length?previews:null;
}
