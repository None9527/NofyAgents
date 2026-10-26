import ts from "typescript";

export type Reference = { specifier: string; typeOnly: boolean; line: number };
export type Edge = Reference & { from: string; to: string };
export type Problem = { id: string; rule: string; from: string; to: string; typeOnly: boolean; line: number };
export type ModuleRule = { prefix: string; allow: string[] };
export type Policy = { modules: ModuleRule[]; exceptions: Array<{ id: string; reason: string; removal: string }> };

/** Read syntax rather than comments or quote-dependent regular expressions. */
export function scanModuleReferences(filename: string, text: string): { references: Reference[]; computed: number[] } {
  const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true);
  const references: Reference[] = [];
  const computed: number[] = [];
  const add = (literal: ts.Expression, typeOnly: boolean) => {
    const line = source.getLineAndCharacterOfPosition(literal.getStart(source)).line + 1;
    if (ts.isStringLiteralLike(literal)) references.push({ specifier: literal.text, typeOnly, line });
    else computed.push(line);
  };
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const named = clause?.namedBindings;
      const allNamedTypes = named && ts.isNamedImports(named) && named.elements.length > 0 && named.elements.every(e => e.isTypeOnly);
      add(node.moduleSpecifier, Boolean(clause?.isTypeOnly || (!clause?.name && allNamedTypes)));
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      const named = node.exportClause;
      const allNamedTypes = named && ts.isNamedExports(named) && named.elements.length > 0 && named.elements.every(e => e.isTypeOnly);
      add(node.moduleSpecifier, Boolean(node.isTypeOnly || allNamedTypes));
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) && node.moduleReference.expression) {
      add(node.moduleReference.expression, node.isTypeOnly);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteralLike(node.argument.literal)) {
      add(node.argument.literal, true);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const argument = node.arguments[0];
      if (argument) add(argument, false);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { references, computed };
}

export function owner(file: string, policy: Policy): string | null {
  return policy.modules.find(module => file.startsWith(module.prefix))?.prefix ?? null;
}

export function inspectEdges(edges: Edge[], policy: Policy): Problem[] {
  const problems = new Map<string, Problem>();
  const add = (rule: string, edge: Edge) => {
    const mode = edge.typeOnly ? "type" : "runtime";
    const id = `${rule}|${mode}|${edge.from}|${edge.to}`;
    problems.set(id, { id, rule, from: edge.from, to: edge.to, typeOnly: edge.typeOnly, line: edge.line });
  };
  for (const edge of edges) {
    const rule = policy.modules.find(module => edge.from.startsWith(module.prefix));
    if (!rule) continue;
    const target = owner(edge.to, policy);
    if (target && !rule.allow.includes(target)) add("layer", edge);
    if ((rule.prefix === "renderer/core/" || rule.prefix === "main/") && /^(react|react-dom)(\/|$)/.test(edge.specifier)) add("react", edge);
    if (rule.prefix.startsWith("renderer/features/") && /^@nofy-desktop\/acp(?:\/|$)/.test(edge.specifier)) add("wire-package", edge);
    if (rule.prefix.startsWith("renderer/features/") && edge.to.startsWith("renderer/application/") && !edge.to.endsWith("/public.ts")) add("application-private", edge);
    if (target?.startsWith("renderer/features/") && rule.prefix !== target && !edge.to.endsWith("/public.ts")) add("feature-private", edge);
  }
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.typeOnly || !owner(edge.to, policy)) continue;
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to]);
  }
  const reaches = (start: string, goal: string): boolean => {
    const visited = new Set<string>();
    const pending = [start];
    while (pending.length) {
      const node = pending.pop()!;
      if (node === goal) return true;
      if (visited.has(node)) continue;
      visited.add(node);
      pending.push(...(adjacency.get(node) ?? []));
    }
    return false;
  };
  for (const edge of edges) if (!edge.typeOnly && owner(edge.to, policy) && reaches(edge.to, edge.from)) add("runtime-cycle", edge);
  return [...problems.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/** Exact edges only; removed exceptions must also be removed from the budget. */
export function checkBudget(problems: Problem[], policy: Policy): { unexpected: Problem[]; stale: string[]; invalid: string[] } {
  const ids = new Set(problems.map(problem => problem.id));
  const allowed = new Set<string>();
  const invalid: string[] = [];
  for (const exception of policy.exceptions) {
    if (!exception.reason.trim() || !exception.removal.trim() || allowed.has(exception.id)) invalid.push(exception.id);
    allowed.add(exception.id);
  }
  return {
    unexpected: problems.filter(problem => !allowed.has(problem.id)),
    stale: policy.exceptions.filter(exception => !ids.has(exception.id)).map(exception => exception.id),
    invalid,
  };
}
