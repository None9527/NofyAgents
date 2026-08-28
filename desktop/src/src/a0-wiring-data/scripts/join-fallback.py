import json, csv, collections
exports = json.load(open('desktop/src/src/a0-wiring-data/a0-exports.json'))
symbols = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-symbols.tsv'), delimiter='\t'))
sym_owners = collections.defaultdict(set)
for s in symbols:
    if s['sem']:
        sym_owners[s['sem']].add(s['owner'])
plan = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-wiring-plan.tsv'), delimiter='\t'))
status_count = collections.Counter()
resolved_via = collections.Counter()
for r in plan:
    if r['status'] == 'UNRESOLVED':
        owners = [o for o in sym_owners.get(r['name'], set()) if o != r['file'] and o != '—']
        if len(owners) == 1:
            r['status'], r['target'] = 'UNIQUE_ADDEXPORT', owners[0]
        elif len(owners) > 1:
            r['status'], r['target'] = 'AMBIGUOUS', ';'.join(sorted(owners))
        # else stays UNRESOLVED
    status_count[r['status']] += 1
    if r['status'].startswith('UNIQUE'):
        resolved_via[r['target']] += 1
with open('desktop/src/src/a0-wiring-data/a0-wiring-plan.tsv', 'w') as fh:
    w = csv.DictWriter(fh, fieldnames=['file','name','kind','status','target','obf'], delimiter='\t')
    w.writeheader(); w.writerows(plan)
print('final status:', dict(status_count))
print()
print('wiring targets by owner file (top 30):')
for f, n in resolved_via.most_common(30):
    print(f'  {n:4d}  {f}')
