import csv, json, re, collections
exports = json.load(open('desktop/src/src/a0-wiring-data/a0-exports.json'))
symbols = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-symbols.tsv'), delimiter='\t'))
# universe of known names -> owner files
universe = collections.defaultdict(set)
for name, exps in exports.items():
    for f, k in exps:
        universe[name].add(f)
for s in symbols:
    if s['sem'] and s['owner'] and s['owner'] != '—':
        universe[s['sem']].add(s['owner'])
names = list(universe.keys())
def tokens(n):
    return [t.lower() for t in re.findall(r'[A-Z]+(?![a-z])|[A-Z][a-z0-9]*|[a-z0-9]+', n) if len(t) > 1]
tok_index = collections.defaultdict(set)
for n in names:
    for t in tokens(n):
        tok_index[t].add(n)
lower_map = collections.defaultdict(list)
for n in names:
    lower_map[n.lower()].append(n)

unres = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-unres-cross.tsv'), delimiter='\t'))
out = []
hit_exact_ci = hit_token = hit_substr = none = 0
for r in unres:
    dn = r['name']
    cands = []
    # 1. case-insensitive exact
    for n in lower_map.get(dn.lower(), []):
        if n != dn:
            cands.append(('CI_EXACT', n))
    # 2. substring containment (len>=7)
    if len(dn) >= 7:
        for n in names:
            if n == dn or len(n) < 7: continue
            if dn in n or n in dn:
                cands.append(('SUBSTR', n))
    # 3. token overlap
    dt = set(tokens(dn))
    if len(dt) >= 2:
        seen = set()
        for t in dt:
            for n in tok_index.get(t, set()):
                if n == dn or n in seen: continue
                seen.add(n)
                nt = set(tokens(n))
                common = dt & nt
                if len(common) >= 2 and len(common) >= min(len(dt), len(nt)) - 1:
                    cands.append(('TOKEN', n))
    # dedupe keep best class
    best = {}
    order = {'CI_EXACT': 0, 'SUBSTR': 1, 'TOKEN': 2}
    for cls, n in cands:
        if n not in best or order[cls] < order[best[n]]:
            best[n] = cls
    cands = sorted(best.items(), key=lambda kv: (order[kv[1]], kv[0]))[:6]
    if not cands:
        none += 1
    elif best and list(best.values())[0] == 'CI_EXACT':
        hit_exact_ci += 1
    out.append({'file': r['file'], 'name': dn, 'kind': r['kind'],
                'candidates': ' | '.join(f'{n} [{cls}] -> {";".join(sorted(universe[n]))}' for n, cls in cands)})
with open('desktop/src/src/a0-wiring-data/a0-unres-candidates.tsv', 'w') as fh:
    w = csv.DictWriter(fh, fieldnames=['file','name','kind','candidates'], delimiter='\t')
    w.writeheader(); w.writerows(out)
print('unresolved:', len(unres), '| with candidates:', len(unres)-none, '| zero candidates:', none)
