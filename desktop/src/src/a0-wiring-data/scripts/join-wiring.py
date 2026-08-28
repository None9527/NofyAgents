import json, csv, collections
exports = json.load(open('desktop/src/src/a0-wiring-data/a0-exports.json'))
rows = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-declares.tsv'), delimiter='\t'))
plan = []
status_count = collections.Counter()
per_file = collections.Counter()
ambig = collections.defaultdict(list)
for r in rows:
    f, name = r['file'], r['name']
    exporters = [e[0] for e in exports.get(name, []) if e[0] != f]
    if len(exporters) == 1:
        st, tgt = 'UNIQUE', exporters[0]
    elif len(exporters) == 0:
        st, tgt = 'UNRESOLVED', ''
    else:
        st, tgt = 'AMBIGUOUS', ';'.join(exporters)
        ambig[name].append(f)
    status_count[st] += 1
    per_file[f] += 1
    plan.append({'file': f, 'name': name, 'kind': r['kind'], 'status': st, 'target': tgt, 'obf': r['obf_hint']})
with open('desktop/src/src/a0-wiring-data/a0-wiring-plan.tsv', 'w') as fh:
    w = csv.DictWriter(fh, fieldnames=['file','name','kind','status','target','obf'], delimiter='\t')
    w.writeheader(); w.writerows(plan)
print('status:', dict(status_count))
print()
print('declares per file (top 25):')
for f, n in per_file.most_common(25):
    print(f'  {n:4d}  {f}')
print()
print('ambiguous names:', len(ambig))
