import csv, re, os, collections, json, sys
MOD = 'desktop/src/src/modules'
BUSY = {'LegacyDocEngine3.tsx','LegacyDocEngine4.tsx','LegacyDocEngineBPageRegistry.tsx','LegacyDocEngineBPageRenderer.tsx','LazyPreviewViewers.ts','pptxPreviewViewer.tsx','XlsxPreviewWasmBridge.tsx','XlsxDeepA.tsx','XlsxDeepB.tsx','XlsxDeepC.tsx','XlsxDeepP.tsx','XlsxDeepT.tsx','XlsxPreview.tsx','OfficeWiring.tsx',
        'LegacyDocEngineC1.tsx','LegacyDocEngineC2.tsx','LegacyDocEngineC3.tsx','LegacyDocEngineC4.tsx','LegacyDocEngineC5.tsx',
        'LegacyDocEngineBEditorState.tsx','LegacyDocEngineBLayout.tsx','LegacyDocEngineBModel.ts','previewPaneOfficeLegacyDocContent.tsx',
        'DocxWasmGlue.tsx','pptxEngineGeometry.ts','PptxGeometryDeferredPresets.ts','PptxGeometryMultiRegion.ts',
        'rendererEntry.tsx','appUsageChartPalette.tsx','appUsageDailyModelBarChart.tsx','appUsageModelUsagePieChart.tsx',
        'codingPlanUsageLineChart.tsx','button.tsx','ChartShadcn.tsx','e2eStoreBridgeBootstrap.tsx','highlightedCodeBlockBody.tsx',
        'ImeComposition.tsx','intlProvider.tsx','logger.tsx','UtilsCn.tsx','SrcSharedA.tsx','SrcSharedB.tsx','SkillStore.tsx',
        'RemoteWizard.tsx','RemoteGapSegments.tsx','WebRemote.tsx'}
DRY = '--apply' not in sys.argv
ONLY_FILES = set(os.environ.get('ONLY_FILES','').split(',')) if os.environ.get('ONLY_FILES') else None

plan = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-wiring-plan.tsv'), delimiter='\t'))
declares = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-declares.tsv'), delimiter='\t'))
symbols = list(csv.DictReader(open('desktop/src/src/a0-wiring-data/a0-symbols.tsv'), delimiter='\t'))
auto = [r for r in plan if r['status'] in ('UNIQUE','UNIQUE_ADDEXPORT')]
dec_by_file_name = collections.defaultdict(list)
for d in declares:
    dec_by_file_name[(d['file'], d['name'])].append(d)
sym_line = {}
for s in symbols:
    if s['sem'] and s['owner'] and s['owner'] != '—':
        sym_line.setdefault((s['sem'], s['owner']), int(s['line']) if s['line'].isdigit() else None)


# Lane-4 exclusions: vendored radix/shadcn symbols with no reconstructed owner yet
LANE4_NAMES = {'useHeroTextSizes','useModelProviders','TooltipRoot','useControllableState','Slot','SearchResultsStore','useTaskListItems','applyOptimisticTaskMutation','buildTaskFeedbackDescription','sshDecoratedProjectName'}
DEFER_S2A_NAMES = set(['Tooltip', 'TooltipTrigger', 'TooltipContent', 'TooltipProvider'])
auto = [r for r in auto if r['name'] not in LANE4_NAMES and r['name'] not in DEFER_S2A_NAMES]

report = collections.defaultdict(list)
files_touched = set()

# ---------- owner-side export adds ----------
adds = [r for r in auto if r['status']=='UNIQUE_ADDEXPORT' and r['target'] not in BUSY and r['target'] != '—' and r['target'].endswith(('.tsx','.ts')) and (ONLY_FILES is None or r['target'] in ONLY_FILES)]
owner_cache = {}
def owner_text(f):
    if f not in owner_cache:
        owner_cache[f] = open(os.path.join(MOD, f), encoding='utf-8').read().splitlines(keepends=False)
    return owner_cache[f]
add_ok = add_skip = add_fail = 0
done_owner = set()
for r in adds:
    key = (r['target'], r['name'])
    if key in done_owner: continue
    done_owner.add(key)
    lines = owner_text(r['target'])
    ln = sym_line.get(key)
    found = None
    candidates = range(ln-1, ln+4) if ln else range(len(lines))
    if ln is None:
        # full scan fallback
        for i, l in enumerate(lines):
            if re.match(r'^(?:export\s+)?(?:async\s+)?(?:const|function|class|enum)\s+' + re.escape(r['name']) + r'\b', l):
                found = i; break
    else:
        for i in candidates:
            if 0 <= i < len(lines) and re.match(r'^(?:export\s+)?(?:async\s+)?(?:const|function|class|enum)\s+' + re.escape(r['name']) + r'\b', lines[i]):
                found = i; break
    if found is None:
        report[r['target']].append(f'ADD-EXPORT FAIL: {r["name"]} (no def near line {ln})'); add_fail += 1; continue
    l = lines[found]
    if l.startswith('export '):
        add_skip += 1; continue
    lines[found] = 'export ' + l
    report[r['target']].append(f'ADD-EXPORT: {r["name"]} @L{found+1}')
    add_ok += 1; files_touched.add(r['target'])

# ---------- declaring-side rewrites ----------
by_file = collections.defaultdict(list)
for r in auto:
    if r['file'] not in BUSY and (ONLY_FILES is None or r['file'] in ONLY_FILES):
        by_file[r['file']].append(r)
rewired = skipped_busy = already = mismatch = 0
for f, rows in sorted(by_file.items()):
    path = os.path.join(MOD, f)
    lines = open(path, encoding='utf-8').read().splitlines(keepends=False)
    # existing import names
    existing = set(re.findall(r'\{([^}]*)\}', '\n'.join(l for l in lines if l.startswith('import '))))
    existing_names = set(n.strip().split(' as ')[-1].strip() for n in ''.join(existing).split(',') if n.strip())
    kill = set()
    imports = collections.defaultdict(list)
    for r in rows:
        if r['name'] in existing_names:
            report[f].append(f'SKIP already-imported: {r["name"]}'); already += 1; continue
        decs = dec_by_file_name.get((f, r['name']), [])
        if not decs:
            report[f].append(f'NO-DECLARE-RANGE: {r["name"]}'); mismatch += 1; continue
        ok = True
        for d in decs:
            s, e = int(d['start']), int(d['end'])
            if s-1 >= len(lines) or r['name'] not in lines[s-1] or 'declare' not in lines[s-1]:
                report[f].append(f'RANGE-MISMATCH: {r["name"]} @L{s} -> {lines[s-1][:70] if s-1<len(lines) else "EOF"}'); mismatch += 1; ok = False; break
        if not ok: continue
        for d in decs:
            for i in range(int(d['start'])-1, int(d['end'])):
                kill.add(i)
        imports[r['target']].append(r['name'])
        rewired += 1
    if not kill and not imports:
        continue
    newlines = [l for i, l in enumerate(lines) if i not in kill]
    # insertion point: after END of last top-level import statement (multi-line aware)
    last_imp = None
    ii = 0
    while ii < len(newlines):
        if newlines[ii].startswith('import '):
            jj = ii
            while jj < len(newlines) and not newlines[jj].rstrip().endswith(';'):
                jj += 1
            last_imp = jj
            ii = jj + 1
        else:
            ii += 1
    imps = [f"import {{ {', '.join(sorted(set(ns)))} }} from './{tgt[:-4] if tgt.endswith(('.tsx','.ts')) else tgt}';"
            for tgt, ns in sorted(imports.items())]
    # strip extension properly
    imps = []
    for tgt, ns in sorted(imports.items()):
        base = re.sub(r'\.(tsx|ts)$', '', tgt)
        imps.append(f"import {{ {', '.join(sorted(set(ns)))} }} from './{base}';")
    if last_imp is not None:
        for j, im in enumerate(imps): newlines.insert(last_imp+1+j, im)
    else:
        # insert before first remaining declare, or at first non-comment code line
        ins = next((i for i, l in enumerate(newlines) if l.startswith('declare ')), len(newlines))
        for j, im in enumerate(imps): newlines.insert(ins+j, im)
    if not DRY:
        open(path, 'w', encoding='utf-8').write('\n'.join(newlines) + '\n')
    files_touched.add(f)
    report[f].append(f'REWIRE: -{len(kill)} declare lines, +{len(imps)} import stmts ({sum(len(v) for v in imports.values())} names)')

print('MODE:', 'DRY-RUN' if DRY else 'APPLIED')
print(f'owner export adds: ok={add_ok} skip={add_skip} fail={add_fail}')
print(f'declaring-side: rewired={rewired} already={already} mismatch={mismatch} files={len(by_file)}')
print(f'files touched: {len(files_touched)}')
with open('desktop/src/src/a0-wiring-data/autowire-report.txt','w') as fh:
    for f in sorted(report):
        fh.write(f'## {f}\n')
        for line in report[f]: fh.write('  ' + line + '\n')
print('report -> desktop/src/src/a0-wiring-data/autowire-report.txt')
