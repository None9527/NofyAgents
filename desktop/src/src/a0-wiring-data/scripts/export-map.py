import re, os, json
MOD = "/Users/mac/nofy-build/desktop/src/src/modules"
export_map = {}
EXPORT_RE = re.compile(r"^export\s+(?:async\s+)?(function|const|var|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)")
for fn in sorted(os.listdir(MOD)):
    if not (fn.endswith(".tsx") or fn.endswith(".ts")) or fn.endswith(".d.ts"):
        continue
    text = open(os.path.join(MOD, fn), encoding="utf-8").read()
    for line in text.splitlines():
        m = EXPORT_RE.match(line)
        if m:
            export_map.setdefault(m.group(2), []).append((fn, m.group(1)))
    # multi-line export { ... } blocks (no from-clause = local re-exports)
    for m in re.finditer(r"^export\s*\{([^}]*)\}", text, re.M | re.S):
        body = m.group(1)
        if ' from ' in body: continue
        for part in body.split(","):
            part = part.strip()
            if not part: continue
            name = part.split(" as ")[-1].strip() if " as " in part else part
            if re.match(r"^[A-Za-z_$][\w$]*$", name):
                export_map.setdefault(name, []).append((fn, "list"))
json.dump(export_map, open("desktop/src/src/a0-wiring-data/a0-exports.json","w"), ensure_ascii=False)
multi = {k: {f for f,_ in v} for k,v in export_map.items()}
print("distinct exported names:", len(export_map))
print("multi-file names:", sum(1 for v in multi.values() if len(v)>1))
