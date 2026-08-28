#!/usr/bin/env python3
"""Extract declare statements (v3: brace + angle-bracket depth tracking)."""
import re, os, collections
MOD = "/Users/mac/nofy-build/desktop/src/src/modules"
rows = []
NAME_RE = re.compile(r"declare\s+(const|function|var|let|class|enum)\s+([A-Za-z_$][\w$]*)")
def stripped(s):
    return re.split(r"//", s)[0].rstrip() if "//" in s else s.rstrip()
def depths(s):
    s2 = s.replace("=>", "  ")
    return s.count("{") - s.count("}"), s2.count("<") - s2.count(">")
for fn in sorted(os.listdir(MOD)):
    if not (fn.endswith(".tsx") or fn.endswith(".ts")) or fn.endswith(".d.ts"):
        continue
    lines = open(os.path.join(MOD, fn), encoding="utf-8").readlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("declare "):
            gm = re.match(r"declare\s+(global|module|namespace)\b", line)
            if gm:
                db, da = depths(line)
                j = i
                while (db > 0 or da > 0) and j + 1 < len(lines):
                    j += 1
                    b, a = depths(lines[j])
                    db += b; da += a
                i = j + 1
                continue
            start = i
            m = NAME_RE.match(line)
            kind = m.group(1) if m else "?"
            name = m.group(2) if m else "?"
            cm = re.search(r"//\s*([A-Za-z_$][\w$]*)\s*$", line.rstrip())
            obf = cm.group(1) if cm else ""
            db, da = depths(line)
            acc = stripped(line)
            j = i
            def term():
                return db <= 0 and da <= 0 and (acc.endswith(";") or (acc.endswith("}") and kind in ("class", "enum")))
            while not term():
                if j + 1 >= len(lines):
                    print(f"WARN unterminated {fn}:{start+1} name={name}")
                    break
                j += 1
                acc = acc + " " + stripped(lines[j])
                b, a = depths(lines[j])
                db += b; da += a
                if term():
                    break
            if j - i > 90:
                print(f"WARN huge range {fn}:{start+1}-{j+1} name={name}")
            rows.append({"file": fn, "start": start+1, "end": j+1, "kind": kind, "name": name, "obf_hint": obf, "lines": j-i+1})
            i = j + 1
        else:
            i += 1
with open("desktop/src/src/a0-wiring-data/a0-declares.tsv", "w") as fh:
    fh.write("file\tstart\tend\tkind\tname\tobf_hint\tlines\n")
    for r in rows:
        fh.write("\t".join(str(r[k]) for k in ("file","start","end","kind","name","obf_hint","lines")) + "\n")
print("declares extracted:", len(rows))
counts = collections.Counter(r['file'] for r in rows)
bad = 0
for fn in sorted(os.listdir(MOD)):
    if not (fn.endswith(".tsx") or fn.endswith(".ts")) or fn.endswith(".d.ts"): continue
    n = sum(1 for l in open(os.path.join(MOD, fn)) if re.match(r'declare (?!global\b|module\b|namespace\b)', l))
    if counts.get(fn, 0) != n:
        print(f'MISMATCH {fn}: extracted {counts.get(fn,0)} vs grep {n}'); bad += 1
print('count mismatches:', bad)
# swallow check
byf = collections.defaultdict(list)
for r in rows: byf[r['file']].append(r)
swallow = 0
for fn, rs in byf.items():
    rs.sort(key=lambda r: int(r['start']))
    ls = open(os.path.join(MOD, fn)).readlines()
    for r in rs:
        s, e = int(r['start']), int(r['end'])
        inner = [k for k in range(s, e) if ls[k].startswith('declare ')]
        if inner: print('SWALLOW', fn, r['name'], s, e, inner[:3]); swallow += 1
print('swallowing ranges:', swallow)
