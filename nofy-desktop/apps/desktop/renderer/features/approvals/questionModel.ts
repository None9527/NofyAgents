/**
 * questionModel —— _nofy/ask_user_question 裁决面的纯模型（node 下可测）。
 *
 * 线路契约逐字来自内核源码（crates/codegen/nofy-tools/src/implementations/
 * nofy_build/ask_user_question/{mod.rs,types.rs}，2026-09-13 读）：
 *
 *  请求 params（camelCase）：{sessionId, toolCallId, questions[], mode}
 *    questions[] = {question, options[{label, description, preview?, id?}],
 *                   multiSelect?（alias multi_select）, id?}
 *  应答（internally tagged on "outcome"，snake_case 变体名）：
 *    accepted        {outcome:"accepted", answers:{<question 原文>: [label,…]},
 *                     annotations?:{<q>:{preview?, notes?}}}
 *    chat_about_this / skip_interview（plan 模式访谈动作，活壳不露、我们也不露）
 *    cancelled       {outcome:"cancelled"}（取消表已登记，effects.ts cancelPayloadFor）
 *
 * 应答细则（types.rs 注释逐字）：
 *  · answers 按原问题顺序、**未答的省略**；键是 question 原文（IndexMap 保序）。
 *  · 只填自由文本＝answers ["Other"] + annotations[q].notes。
 *  · annotations[q].preview＝选中项 preview 逐字（**仅单选**）；空映射整键省略。
 */
import { asObj, asStr } from "../../ui/readers.ts";

export type QuestionOptionView = { label: string; description: string | null; preview: string | null };
export type QuestionView = { question: string; options: QuestionOptionView[]; multiSelect: boolean };
export type QuestionnaireView = { questions: QuestionView[]; mode: "default" | "plan" };

/** 只读契约键；形状不符的问题整条跳过（画半个问题比不画更骗人）。 */
export function readQuestionnaire(params: Record<string, unknown>): QuestionnaireView {
  const raw = params["questions"];
  const questions: QuestionView[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const o = asObj(item);
      const question = asStr(o["question"]);
      if (question === null || !Array.isArray(o["options"])) continue;
      const options: QuestionOptionView[] = [];
      for (const opt of o["options"]) {
        const oo = asObj(opt);
        const label = asStr(oo["label"]);
        if (label === null) continue;
        options.push({ label, description: asStr(oo["description"]), preview: asStr(oo["preview"]) });
      }
      const ms = o["multiSelect"] ?? o["multi_select"];
      questions.push({ question, options, multiSelect: ms === true });
    }
  }
  return { questions, mode: params["mode"] === "plan" ? "plan" : "default" };
}

/** 一道题的当前选择：选中的 label 集合 + 自由文本。 */
export type Selection = { labels: string[]; notes: string };

export function emptySelections(n: number): Selection[] {
  return Array.from({ length: n }, () => ({ labels: [], notes: "" }));
}

export function isAnswered(s: Selection): boolean {
  return s.labels.length > 0 || s.notes.trim().length > 0;
}

/**
 * 造 accepted 应答载荷。未答的题省略；零题已答返回 null（不发空 accepted——
 * 内核会把空答案格式化成「用户没答」，与取消语义混淆，界面宁可禁掉提交）。
 */
export function acceptedPayload(
  questions: QuestionView[],
  selections: Selection[],
): Record<string, unknown> | null {
  const answers: Record<string, string[]> = {};
  const annotations: Record<string, Record<string, unknown>> = {};
  let answered = 0;
  questions.forEach((q, i) => {
    const sel = selections[i];
    if (sel === undefined || !isAnswered(sel)) return;
    answered += 1;
    const notes = sel.notes.trim();
    const labels = sel.labels.length > 0 ? [...sel.labels] : ["Other"];
    answers[q.question] = labels;
    const ann: Record<string, unknown> = {};
    if (!q.multiSelect && labels.length === 1 && labels[0] !== "Other") {
      const preview = q.options.find((o) => o.label === labels[0])?.preview ?? null;
      if (preview !== null) ann["preview"] = preview;
    }
    if (notes.length > 0) ann["notes"] = notes;
    if (Object.keys(ann).length > 0) annotations[q.question] = ann;
  });
  if (answered === 0) return null;
  const payload: Record<string, unknown> = { outcome: "accepted", answers };
  if (Object.keys(annotations).length > 0) payload["annotations"] = annotations;
  return payload;
}

