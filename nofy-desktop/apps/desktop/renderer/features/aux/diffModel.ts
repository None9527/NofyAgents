/**
 * unified diff 的**纯模型**：解析 + 折叠（审查面用）。
 *
 * ## 为什么自己解析
 *
 * 活壳的 diff 体是一个 shadow-DOM web component（diffs-container，CDP 穿透量过：
 * gutter 38px、代码行 h-20、折叠行 h-32「N unmodified lines」）。干净室不取它的资产，
 * 但**度量跟它对齐**；解析 unified diff 是二十行的字符串活，自己写比引一个黑盒组件诚实。
 *
 * ## 输入
 *
 * git/status（includePatches=true）与 git/diffs（includePatch=true）的条目 patch 字段，
 * 标准 unified 格式：@@ -old,len +new,len @@ 头、空格=上下文、+=增、-=删、
 * 「\ No newline at end of file」标记。解析失败（坏头/缺行号）的行降级为上下文，不抛。
 *
 * ## 折叠语义（抄活壳的可见行为）
 *
 * 连续上下文超过 threshold 行折成一段「N 行未修改」；hunk 之间的空档（内核没吐的
 * 未修改区间）按行号差补成折叠段。展开是**窗口局部态**（组件持有），模型只负责切段。
 */

export type DiffLineKind = "ctx" | "add" | "del";

export type DiffLine = {
  kind: DiffLineKind;
  oldNo: number | null;
  newNo: number | null;
  text: string;
};

export type DiffHunk = {
  /** 原样保留的 @@ 头文本（渲染 hunk 分隔时用） */
  header: string;
  oldStart: number;
  newStart: number;
  lines: DiffLine[];
};

const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

export function parseUnifiedDiff(patch: string): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  let cur: DiffHunk | null = null;
  let oldNo = 0;
  let newNo = 0;
  const rawLines = patch.split("\n");
  for (const line of rawLines) {
    const m = HUNK_RE.exec(line);
    if (m !== null) {
      cur = {
        header: line,
        oldStart: Number(m[1] ?? "0"),
        newStart: Number(m[3] ?? "0"),
        lines: [],
      };
      hunks.push(cur);
      oldNo = cur.oldStart;
      newNo = cur.newStart;
      continue;
    }
    if (cur === null) continue; // ---/+++ 等文件头：不属于任何 hunk，跳过
    if (line.startsWith("\\")) continue; // 「\ No newline …」标记：行号不动
    const first = line.slice(0, 1);
    const text = line.slice(1);
    if (first === "+") {
      cur.lines.push({ kind: "add", oldNo: null, newNo: newNo, text });
      newNo += 1;
    } else if (first === "-") {
      cur.lines.push({ kind: "del", oldNo: oldNo, newNo: null, text });
      oldNo += 1;
    } else if (first === " " || line.length === 0) {
      cur.lines.push({ kind: "ctx", oldNo: oldNo, newNo: newNo, text });
      oldNo += 1;
      newNo += 1;
    } else {
      // 认不出的行：降级为上下文（不抛、不丢），行号两侧都走
      cur.lines.push({ kind: "ctx", oldNo: oldNo, newNo: newNo, text: line });
      oldNo += 1;
      newNo += 1;
    }
  }
  return hunks;
}

export type DiffSegment =
  | { kind: "show"; lines: DiffLine[] }
  | {
      kind: "fold";
      /** 折掉的上下文行（展开时原样画回）。hunk 间空档没有行文本 ⇒ 空数组。 */
      lines: DiffLine[];
      /** true = hunk 间空档：内核没吐这段上下文，本地展不开（title 会说明） */
      gap: boolean;
      count: number;
    };

/**
 * 把 hunks 切成渲染段：连续上下文 > threshold 折一段；hunk 之间的空档按行号差补折叠段。
 * threshold=0 表示「不折」（全展开视图，比如用户点了「展开全部上下文」）。
 */
export function foldContext(hunks: DiffHunk[], threshold: number): DiffSegment[] {
  const segs: DiffSegment[] = [];
  let show: DiffLine[] = [];
  const flush = (): void => {
    if (show.length > 0) {
      segs.push({ kind: "show", lines: show });
      show = [];
    }
  };
  const pushFold = (count: number, oldNo: number, newNo: number): void => {
    if (count <= 0) return;
    segs.push({ kind: "fold", lines: [], gap: true, count });
  };
  let prevOldEnd: number | null = null;
  let prevNewEnd: number | null = null;
  for (const h of hunks) {
    if (prevOldEnd !== null && prevNewEnd !== null) {
      const gapOld = h.oldStart - prevOldEnd;
      const gapNew = h.newStart - prevNewEnd;
      const gap = Math.max(gapOld, gapNew);
      if (gap > 0 && threshold > 0) {
        flush();
        pushFold(gap, prevOldEnd, prevNewEnd);
      }
    }
    let run: DiffLine[] = [];
    const flushRun = (): void => {
      if (run.length === 0) return;
      if (threshold > 0 && run.length > threshold) {
        flush();
        segs.push({ kind: "fold", lines: run, gap: false, count: run.length });
      } else {
        show = show.concat(run);
      }
      run = [];
    };
    for (const line of h.lines) {
      if (line.kind === "ctx") run.push(line);
      else {
        flushRun();
        show.push(line);
      }
    }
    flushRun();
    const last = h.lines[h.lines.length - 1];
    if (last !== undefined) {
      prevOldEnd = (last.oldNo ?? h.oldStart) + 1;
      prevNewEnd = (last.newNo ?? h.newStart) + 1;
    }
  }
  flush();
  return segs;
}

/** 汇总条的两个数：增行 / 删行（优先用内核给的 additions/deletions，这是兜底）。 */
export function diffTotals(hunks: DiffHunk[]): { add: number; del: number } {
  let add = 0;
  let del = 0;
  for (const h of hunks) {
    for (const l of h.lines) {
      if (l.kind === "add") add += 1;
      else if (l.kind === "del") del += 1;
    }
  }
  return { add, del };
}
