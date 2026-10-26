/**
 * spineModel —— 脊柱回合分组的**纯模型**（活壳 history-message collapsible 的同位）。
 *
 * 活壳实测（2026-09-11 在 ZCode 真发一轮子智能体、CDP 观察）：
 * - 回合结束后中间过程（思考行 / 工具行 / 中间文本）默认**收**在「已工作 Ns」turn 头
 *   （button.group/history-message + aria-expanded + chevron）下，最终答案留在折叠外；
 * - 运行中中间过程展开内联流式；
 * - 轮询行（get_command_or_subagent_output 族）完全不画（agentModel.linkedPollBlockIds）。
 *
 * 分组规则：user 块开回合；回合内最后一个 agent-message = 最终答案，
 * 更早的 agent-message 在后一个 agent-message 到来时退回中间过程。
 * 回合计时用 store.turns（本地墙钟，开/关 = user_message_chunk / turn_completed）。
 */
import type { Block, TurnRecord } from "../../core/store/state.ts";

export type TurnSegment = {
  key: string;
  /** 开回合的用户块；回放碎片等无用户块前缀时 null（原样平铺）。 */
  user: Extract<Block, { kind: "user-message" }> | null;
  turn: TurnRecord | null;
  /** 中间过程：思考 / 工具行 / 中间文本（最终答案之前的 agent 文本也在内）。 */
  middle: Block[];
  /** 最终答案：回合内最后一个 agent-message；没有则 null。 */
  final: Block | null;
  /** Work emitted after the visible answer must remain after it. */
  following?: Block[];
  running: boolean;
};

export function buildTurnSegments(blocks: Block[], turns: TurnRecord[]): TurnSegment[] {
  const segments: TurnSegment[] = [];
  let current: TurnSegment | null = null;
  let turnIdx = 0;
  let lead = 0;
  for (const b of blocks) {
    if (b.kind === "user-message") {
      current = { key: "seg:" + b.id, user: b, turn: turns[turnIdx] ?? null, middle: [], final: null, running: false };
      turnIdx += 1;
      segments.push(current);
      continue;
    }
    if (current === null) {
      current = { key: "lead:" + String(lead), user: null, turn: null, middle: [], final: null, running: false };
      lead += 1;
      segments.push(current);
    }
    current.middle.push(b);
  }
  // 收尾：回合内最后一个 agent-message = 最终答案（留折叠外），其余按**时间序**留在中间过程
  // （活壳展开态就是时间序：思考 → 文本 → 子智能体行 → 思考 → 最终文本）。
  for (const s of segments) {
    let lastAgentIdx = -1;
    for (let i = s.middle.length - 1; i >= 0; i--) {
      if (s.middle[i]?.kind === "agent-message") {
        lastAgentIdx = i;
        break;
      }
    }
    if (lastAgentIdx >= 0) {
      const finalBlock = s.middle[lastAgentIdx];
      if (finalBlock !== undefined) {
        s.following = s.middle.slice(lastAgentIdx + 1);
        s.middle = s.middle.slice(0, lastAgentIdx);
        s.final = finalBlock;
      }
    }
  }
  for (const s of segments) s.running = s.turn !== null && s.turn.endedAt === null;
  return segments;
}

/** Hook execution is diagnostic data, not conversation content. */
export function isConversationBlockVisible(block: Block): boolean {
  return block.kind !== "event" || !block.tag.startsWith("hook:");
}

/** turn 头文案的秒数：结束回合用墙钟区间；运行中用 now 顶替终点（至少 1s，与活壳「已工作 N 秒」同口径）。 */
export function turnSeconds(turn: TurnRecord, now: number): number {
  const end = turn.endedAt ?? now;
  return Math.max(1, Math.round((end - turn.startedAt) / 1000));
}
