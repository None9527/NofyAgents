/**
 * 夹具脱敏——录制即脱敏，不留原始件。
 *
 * 为什么必须有：录**真轮次**要 copyConfig=true 才有凭据，于是 initialize 的
 * modelState / session/new 的 models 会把 provider 的 api_key 原样回显进帧里。
 * 实测 golden-turn.jsonl 未脱敏时含 16 处 sk- 前缀密钥、617 处 /Users/<用户名>、
 * hostname 与 agentId。这些一旦提交就等于泄密。
 *
 * 原则：
 *   - 密钥与凭据字段值 → 固定占位，**不可逆**
 *   - 用户名、临时目录、hostname → 占位
 *   - UUID（sessionId/eventId/promptId/…）→ **保持一致性的映射**（同一原值映射到同一
 *     占位），这样去重、路由、顺序类断言仍然有效，但无法反查真实会话
 *   - 事件结构、判别值、_meta 键集、时间戳一律不动——脱敏不得破坏契约
 */

// 同时匹配上一版占位符 sk-REDACTED，使脱敏可重复执行（幂等）
const SECRET_VALUE = /sk-(?:REDACTED|[A-Za-z0-9_-]{6,})/g;
const CRED_KEY = /"(api_?key|apiKey|access_?token|refresh_?token|password|secret|bearer|authorization)"(\s*):(\s*)"(?:[^"\\]|\\.)*"/gi;
const USER_PATH = /\/Users\/(?:USER|[A-Za-z0-9._-]+)/g;
const USER_PATH_ENC = /%2FUsers%2F(?:USER|[A-Za-z0-9._%-]+)/g;
const TMP_HOME = /\/(?:var\/folders|tmp)\/[A-Za-z0-9._/-]*nofy-desktop-test-home-[A-Za-z0-9-]+/g;
const TMP_WS = /\/(?:var\/folders|tmp)\/[A-Za-z0-9._/-]*nofy-desktop-turn-ws-[A-Za-z0-9-]+/g;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const HOSTNAME = /"hostname"(\s*):(\s*)"(?:[^"\\]|\\.)*"/gi;

export type RedactStats = {
  secrets: number;
  credFields: number;
  userPaths: number;
  tmpPaths: number;
  uuids: number;
  hostnames: number;
  distinctUuids: number;
};

/**
 * 脱敏一段 JSON 文本（一帧一行）。
 * uuidMap 跨帧共享，保证同一 UUID 在整个夹具里映射一致。
 */
export function redactLine(line: string, uuidMap: Map<string, string>, stats: RedactStats): string {
  let out = line;

  out = out.replace(CRED_KEY, (_m, k: string, s1: string, s2: string) => {
    stats.credFields++;
    return '"' + k + '"' + s1 + ":" + s2 + '"REDACTED"';
  });
  out = out.replace(SECRET_VALUE, () => {
    stats.secrets++;
    return "<REDACTED_KEY>";
  });
  out = out.replace(HOSTNAME, (_m, s1: string, s2: string) => {
    stats.hostnames++;
    return '"hostname"' + s1 + ":" + s2 + '"test-host.local"';
  });
  out = out.replace(TMP_HOME, () => {
    stats.tmpPaths++;
    return "<NOFY_HOME>";
  });
  out = out.replace(TMP_WS, () => {
    stats.tmpPaths++;
    return "<WORKSPACE>";
  });
  out = out.replace(USER_PATH_ENC, () => {
    stats.userPaths++;
    return "%2FUSER_HOME%2F";
  });
  out = out.replace(USER_PATH, () => {
    stats.userPaths++;
    return "<USER_HOME>";
  });
  out = out.replace(UUID, (m) => {
    const key = m.toLowerCase();
    let v = uuidMap.get(key);
    if (v === undefined) {
      v = "uuid-" + String(uuidMap.size + 1).padStart(4, "0");
      uuidMap.set(key, v);
    }
    stats.uuids++;
    return v;
  });

  return out;
}

export function newRedactStats(): RedactStats {
  return { secrets: 0, credFields: 0, userPaths: 0, tmpPaths: 0, uuids: 0, hostnames: 0, distinctUuids: 0 };
}

/** 整份文件脱敏（供 redact-fixture.ts 对既有夹具补救）。 */
export function redactWhole(raw: string): { text: string; stats: RedactStats } {
  const uuidMap = new Map<string, string>();
  const stats = newRedactStats();
  const text = raw
    .split("\n")
    .map((l) => (l.length === 0 ? l : redactLine(l, uuidMap, stats)))
    .join("\n");
  stats.distinctUuids = uuidMap.size;
  return { text, stats };
}


