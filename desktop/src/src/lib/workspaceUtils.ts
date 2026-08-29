// A0-S4-1: 自 modules/SrcSharedA.tsx §0/§1 原样迁入（B5-10a · src-HCld2afU jsx 2–86；WorkspaceDescriptor 随唯一消费者同迁；原文件现为薄 re-export shim）。

interface WorkspaceDescriptor {
  kind: string;
  [key: string]: any;
}

/** jsx 2 ★Ns —— ssh 描述符去 password/privateKeyPassphrase；server 描述符去 token */
export function sanitizeWorkspaceDescriptor(descriptor: WorkspaceDescriptor): WorkspaceDescriptor {
  if (descriptor.kind === `ssh`) {
    let {
      password: password,
      privateKeyPassphrase: privateKeyPassphrase,
      ...rest
    } = descriptor;
    return rest;
  }
  if (descriptor.kind === `server`) {
    let {
      token: token,
      ...rest
    } = descriptor;
    return rest;
  }
  return descriptor;
}

interface PathRootPrefix {
  prefix: string;
  body: string;
  blocksParentTraversal: boolean;
}

/** jsx 20 —— Windows 盘符（`C:/` 与 `C:` 两形）、UNC（`//srv/share`）、POSIX 绝对、`~/` 四路前缀解析 */
function parsePathRootPrefix(path: string): PathRootPrefix {
  let driveSlash = path.match(/^([A-Z]:)\/(.*)$/);
  if (driveSlash) return {
    prefix: `${driveSlash[1]}/`,
    body: driveSlash[2] ?? ``,
    blocksParentTraversal: !0
  };
  if (path.startsWith(`//`)) {
    let segments = path.slice(2).split(`/`).filter(Boolean);
    if (segments.length >= 2) {
      let [server, share, ...rest] = segments;
      return {
        prefix: `//${server}/${share}/`,
        body: rest.join(`/`),
        blocksParentTraversal: !0
      };
    }
    return {
      prefix: `//`,
      body: segments.join(`/`),
      blocksParentTraversal: !0
    };
  }
  if (path.startsWith(`/`)) return {
    prefix: `/`,
    body: path.replace(/^\/+/, ``),
    blocksParentTraversal: !0
  };
  if (path.startsWith(`~/`)) return {
    prefix: `~/`,
    body: path.slice(2),
    blocksParentTraversal: !1
  };
  let driveOnly = path.match(/^([A-Z]:)(.*)$/);
  return driveOnly ? {
    prefix: driveOnly[1] ?? ``,
    body: driveOnly[2] ?? ``,
    blocksParentTraversal: !1
  } : {
    prefix: ``,
    body: path,
    blocksParentTraversal: !1
  };
}

/** jsx 64 —— 反斜杠归一 + 盘符大写 + `.`/`..` 段消解（`..` 越界时按 blocksParentTraversal 裁决） */
function normalizeTraversalPath(raw?: string | null): string {
  let trimmed = raw?.trim();
  if (!trimmed) return ``;
  let root = parsePathRootPrefix(trimmed.replace(/\\/g, `/`).replace(/^([a-z]):/i, (m, drive) => `${drive.toUpperCase()}:`)),
    segments: string[] = [];
  for (let segment of root.body.split(`/`)) if (!(!segment || segment === `.`)) {
    if (segment === `..`) {
      if (segments.length > 0 && segments.at(-1) !== `..`) {
        segments.pop();
        continue;
      }
      if (root.blocksParentTraversal) continue;
      segments.push(segment);
      continue;
    }
    segments.push(segment);
  }
  return `${root.prefix}${segments.join(`/`)}` || root.prefix;
}

/** jsx 83 —— ssh 认证方式三态判定：私钥路径 → private-key；password/passwordCredentialKey → password；否则 agent */
function resolveSshAuthMethod(descriptor: any): `private-key` | `password` | `agent` {
  return descriptor.privateKeyPath?.trim() ? `private-key` : `password` in descriptor && typeof descriptor.password == `string` || `passwordCredentialKey` in descriptor && descriptor.passwordCredentialKey?.trim() ? `password` : `agent`;
}

/** jsx 86 ★Ms —— ssh 目标身份键（版本化 JSON 元组：host 小写、port 缺省 22、认证方式、私钥路径归一） */
export function sshTargetIdentityKey(descriptor: any): string {
  return JSON.stringify([`ssh:v1`, descriptor.host.trim().toLowerCase(), descriptor.port ?? 22, descriptor.username.trim(), resolveSshAuthMethod(descriptor), normalizeTraversalPath(descriptor.privateKeyPath)]);
}
