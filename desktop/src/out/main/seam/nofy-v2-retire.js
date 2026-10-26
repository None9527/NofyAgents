// nofy：~/.nofy/v2 目录（ZCode 遗留存储）退休——桌面状态统一归 ~/.nofy/desktop。
//
// 背景：v2 曾是并行于内核 ~/.nofy/config.toml 的第二配置体系（config.json 按供应商
// 形制存模型与 API Key、setting.json UI 偏好、tasks-index.sqlite 任务索引）。裁定：
// v2 不该存在。模型唯一真源＝config.toml（provider 存储已废除，见 host/index.js
// readRawZCodeConfigFile/writeProviderStoreFile 注）；其余桌面状态改落 desktop/。
//
// 本模块在 main 进程模块加载期同步执行（先于 settingService / 任务索引打开路径）：
//   setting.json、tasks-index.sqlite(-shm/-wal) → desktop/（目标已存在则不覆盖）；
//   config.json（秘密副本，真值在 config.toml）与 logs/certs/crash 随目录删除
//   （均可再生或已按设计废除）。
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MOVED_FILES = [
  "setting.json",
  "tasks-index.sqlite",
  "tasks-index.sqlite-shm",
  "tasks-index.sqlite-wal",
];

export function retireV2Directory() {
  const v2 = join(homedir(), ".nofy", "v2");
  if (!existsSync(v2)) return { retired: false };
  const desktop = join(homedir(), ".nofy", "desktop");
  mkdirSync(desktop, { recursive: true });
  const moved = [];
  for (const f of MOVED_FILES) {
    const src = join(v2, f);
    const dst = join(desktop, f);
    if (!existsSync(src) || existsSync(dst)) continue;
    try {
      renameSync(src, dst);
    } catch {
      copyFileSync(src, dst);
      unlinkSync(src);
    }
    moved.push(f);
  }
  rmSync(v2, { recursive: true, force: true });
  return { retired: true, moved };
}

retireV2Directory();
