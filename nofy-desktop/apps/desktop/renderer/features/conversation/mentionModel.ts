/**
 * mentionModel —— 「@ 添加上下文」与「$ 选择技能」两个草稿触发器的纯模型。
 *
 * ## @ 的线路真相：内核在**消息文本任意位置**收集 @token
 *
 * collect_file_references（prompt_parser.rs:205-228）扫全文找 '@'，取其后
 * **空白分隔的第一个 token** 当路径，再 join 会话 cwd 后读文件内容进上下文。
 * ⇒ "@相对路径" 与 "@/绝对路径" 都有效；插入相对路径只是可读性选择，线路等价。
 *
 * ## $ 为什么只认开头
 *
 * $ 是**纯界面触发器**（内核不解析 '$'）：选中后落成 "/name "，而斜杠命令只在
 * 首块文本开头生效（parse_slash_prefix，slash_commands.rs:1471-1489 先 trim 再
 * strip_prefix('/')）。文中插 "/name" 是死命令，故 $ 触发器只认草稿第 0 位。
 *
 * ## @ 触发器的边界判据（2026-09-13 修：中文不打空格也要触发）
 *
 * 旧判据是「前一字符必须在白名单里」，把 CJK 全挡在门外——中文用户几乎不打空格，
 * 「看下这个文件@readers」永远不弹面板，等于功能废掉。
 * 新判据反过来：前一字符**不是路径/标识符续接符**（字母数字与 . _ / \ - @）就触发。
 * 于是 mail@host、foo@bar.ts 这类代码/邮箱不抢键，而 CJK、标点、空白、行首都触发。
 */
import type { AttachItem } from "./attachModel.ts";
import { attachDisplayPath } from "./attachModel.ts";

export type TriggerToken = { prefix: "@" | "$"; start: number; query: string };

/** 路径/标识符续接符：前一字符是这些之一时视为代码里的 @，不弹面板。 */
const CONTINUATION = /[A-Za-z0-9_.\/\-@]/;

export function triggerTokenOf(draft: string): TriggerToken | null {
  if (draft.startsWith("$")) {
    const rest = draft.slice(1);
    if (/\s/.test(rest)) return null; // 已进入参数模式
    return { prefix: "$", start: 0, query: rest };
  }
  const idx = draft.lastIndexOf("@");
  if (idx === -1) return null;
  if (idx > 0 && CONTINUATION.test(draft[idx - 1] as string)) return null;
  const rest = draft.slice(idx + 1);
  if (/\s/.test(rest)) return null;
  return { prefix: "@", start: idx, query: rest };
}

/** 用替换串覆盖触发 token（含前缀符），光标语义＝替换到 token 末尾。 */
export function spliceToken(draft: string, start: number, replacement: string): string {
  return draft.slice(0, start) + replacement;
}

/** @token 插入值：cwd 下剥相对（内核 join cwd 后等价），其余绝对；末尾留空格收 token。 */
export function mentionTokenFor(item: AttachItem, cwd: string | null): string {
  return "@" + attachDisplayPath(item.path, cwd) + " ";
}
