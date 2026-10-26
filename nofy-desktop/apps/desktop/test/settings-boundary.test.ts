import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
test("settings views cannot emit raw effects, access a bridge or use removed compatibility controls",()=>{
  const directory=new URL("../renderer/features/settings/",import.meta.url);
  for(const file of readdirSync(directory).filter(file=>file.endsWith(".tsx"))){
    const source=readFileSync(new URL(file,directory),"utf8");const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const banned:string[]=[];
    const visit=(node:ts.Node)=>{if(ts.isPropertyAccessExpression(node)&&["effect","bridge","readModelConfig","updateModelConfig"].includes(node.name.text))banned.push(node.name.text);ts.forEachChild(node,visit);};visit(ast);
    assert.deepEqual(banned,[],file);assert.ok(!source.includes("set__write"),file);
  }
});
