/**
 * 客户端身份。
 *
 * [实测] 内核认识 "nofy-desktop"：Desktop/TUI 类客户端拿到比 Generic 更丰富的
 * bash 作用域权限选项（PORTING-PLAN §2.1 initialize 请求侧要点）。
 * 内核源码亦点名该标识——crates/codegen/nofy-shell/src/agent/app.rs:177：
 * 「Log the client that launched us (set by nofy-desktop when spawning
 * `nofy agent stdio`)」。
 */
export const CLIENT_IDENTIFIER = "nofy-desktop";

