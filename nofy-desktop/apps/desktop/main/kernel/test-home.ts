/**
 * 测试用隔离 NOFY_HOME。
 *
 * 为什么要有：smoke 若打真 ~/.nofy，就不是可重复的门——本机会话数随时在变，
 * 而且会读到真实凭据。参照 codex-web 的做法（resolveTestCodexHome + 断言隔离生效），
 * 但**不复制其代码**（该项目 license 为 UNLICENSED，见 docs/contract/codex-web-reference.md）。
 *
 * 内核侧支持已确认：crates/codegen/nofy-config/src/paths.rs:35 的 nofy_home()
 * 读 $NOFY_HOME，未设才落 ~/.nofy。
 *
 * 配置文件是**格式感知**的，照内核 loader.rs:46 的 user_config_filename_at 优先级：
 * config.json 存在则用它（JSON 体系），否则 config.toml（遗留）。本机实测只有
 * config.json（config.toml 仅剩两个 .bak），故复制逻辑必须两者都认。
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const PREFIX = "nofy-desktop-test-home-";

/** 内核优先级序（loader.rs:41-52）。不得改序，否则隔离环境与内核行为不一致。 */
const USER_CONFIG_CANDIDATES = ["config.json", "config.toml"] as const;

export type IsolatedHome = {
  /** 传给子进程 env 的 NOFY_HOME 值 */
  path: string;
  /** 实际复制了哪个配置文件（null = 真 home 里两个都不存在） */
  configCopied: string | null;
  /** 删除临时目录。带路径前缀守卫，绝不误删。 */
  cleanup: () => void;
};

/**
 * 点路径覆盖（`"ui.permission_mode": "default"`）。只对 **config.json** 生效——
 * JSON 可安全读写；若隔离 home 里是遗留 config.toml，覆盖会被拒绝并抛错，
 * 不静默忽略（静默忽略会让「以为切了模式」的夹具录出假数据）。
 */
export type ConfigOverrides = Record<string, unknown>;

export type IsolatedHomeOptions = {
  /**
   * 复制真实用户配置进隔离 home。
   *
   * **默认 false（完全 hermetic）**：实测即使空 home，内核也会给出内置模型
   * （modelState.availableModels[1] = grok-4.5），足以让 smoke 的 ① 号门有意义；
   * 不复制的好处是门不依赖用户配置，也不会把真实凭据带进测试进程。
   *
   * 录**真轮次**夹具时需要 true——空 home 的 authMethods 为 []、无可用凭据，
   * prompt 跑不起来。此时凭据会落进临时目录，故目录 0700、配置 0600，
   * 且用完必须 cleanup()。
   *
   * 会话存储任何情况下都不复制，故 workspace_list 必为空——这正是隔离生效的
   * 可观测证据（真库为 5 工作区 / 82 会话）。
   */
  copyConfig?: boolean;
  /**
   * 覆盖复制来的用户配置。
   *
   * 为什么需要：本机真实 config.json 里 `ui.permission_mode = "always-approve"`
   * （`ui.yolo = false`），内核在该模式下**完全不发** `session/request_permission`
   * ——实测两轮写文件都被自动放行、serverRequests=0。要录权限流必须把它切成
   * `"default"`。取值词汇见 nofy-agent/src/config.rs:996 的 VALID_VALUES
   * （default/acceptEdits/auto/dontAsk/bypassPermissions/plan）与
   * session/telemetry/permission.rs:183（"always-approve" ⇒ yolo）。
   */
  configOverrides?: ConfigOverrides;
};

export function createIsolatedNofyHome(opts: IsolatedHomeOptions = {}): IsolatedHome {
  const copyConfig = opts.copyConfig ?? false;
  const path = join(tmpdir(), PREFIX + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8));
  // 0700：copyConfig=true 时目录里会有真实 API key
  mkdirSync(path, { recursive: true, mode: 0o700 });

  let configCopied: string | null = null;
  if (copyConfig) {
    const realHome = join(homedir(), ".nofy");
    for (const name of USER_CONFIG_CANDIDATES) {
      const src = join(realHome, name);
      if (existsSync(src)) {
        const dest = join(path, name);
        copyFileSync(src, dest);
        configCopied = name;
        break; // 只复制优先级最高的那个，与内核「二选一」语义一致
      }
    }
  }

  const overrides = opts.configOverrides ?? {};
  if (Object.keys(overrides).length > 0) {
    if (configCopied !== "config.json") {
      throw new Error(
        "configOverrides 只支持 config.json；隔离 home 里是 " + String(configCopied ?? "(无配置文件)") +
        "。遗留 TOML 无法安全做点路径覆盖，拒绝静默忽略。",
      );
    }
    const target = join(path, "config.json");
    const doc = JSON.parse(readFileSync(target, "utf8")) as Record<string, unknown>;
    for (const [dotPath, value] of Object.entries(overrides)) {
      const keys = dotPath.split(".");
      let cur: Record<string, unknown> = doc;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i] as string;
        const nxt = cur[k];
        if (typeof nxt !== "object" || nxt === null || Array.isArray(nxt)) cur[k] = {};
        cur = cur[k] as Record<string, unknown>;
      }
      cur[keys[keys.length - 1] as string] = value;
    }
    writeFileSync(target, JSON.stringify(doc, null, 2) + "\n");
  }

  return {
    path,
    configCopied,
    cleanup: () => {
      // 守卫：只删我们自己造的、带前缀的临时目录
      const base = path.split("/").pop() ?? "";
      if (!base.startsWith(PREFIX) || !path.startsWith(tmpdir())) {
        throw new Error("refusing to clean up a path that is not ours: " + path);
      }
      rmSync(path, { recursive: true, force: true });
    },
  };
}

/** 隔离 home 里实际生效的用户配置文件名（供断言与日志）。 */
export function userConfigNameIn(home: IsolatedHome): string | null {
  return home.configCopied;
}


