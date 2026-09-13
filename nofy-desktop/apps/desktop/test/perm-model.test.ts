/**
 * 权限模式门禁（2026-09-13 四档重写后）。钉四件事：
 *  1. clientIdentifier 与 initialize 发的同字（不带＝内核一个会话都不匹配，静默无效）；
 *  2. 通知载荷四键逐字对齐 acp_agent.rs:1250-1305 的读取面；
 *  3. 当前档合成优先级 yolo > auto > plan > confirm（ask/default/表外皆归 confirm）；
 *  4. 单选语义：每档都清另两轴（full 只置 yolo、autoedit 只置 auto、其余双清）。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { CLIENT_IDENTIFIER } from "@nofy-desktop/acp";
import {
  PERM_CHOICES,
  PERM_CLIENT_ID,
  currentPermId,
  permAction,
  permLabel,
} from "../renderer/features/conversation/permModel.ts";

test("clientIdentifier 与 initialize 同字（mvp_agent/mod.rs:1611 按它匹配会话）", () => {
  assert.equal(PERM_CLIENT_ID, CLIENT_IDENTIFIER);
});

test("currentPermId：yolo > auto > plan > confirm", () => {
  assert.equal(currentPermId({ yolo: false, auto: false, mode: null }), "confirm");
  assert.equal(currentPermId({ yolo: false, auto: false, mode: "ask" }), "confirm", "活壳无独立询问档");
  assert.equal(currentPermId({ yolo: false, auto: false, mode: "default" }), "confirm");
  assert.equal(currentPermId({ yolo: false, auto: false, mode: "plan" }), "plan");
  assert.equal(currentPermId({ yolo: false, auto: true, mode: "plan" }), "autoedit");
  assert.equal(currentPermId({ yolo: true, auto: true, mode: "plan" }), "full");
  assert.equal(currentPermId({ yolo: false, auto: false, mode: "mystery" }), "confirm", "表外模式不猜");
});

test("permAction：四键逐字；单选清另两轴", () => {
  assert.deepEqual(permAction("confirm").notify, {
    clientIdentifier: PERM_CLIENT_ID,
    permission_mode: "default",
    yolo_mode: false,
    auto_mode: false,
  });
  assert.equal(permAction("confirm").modeId, "default");
  assert.deepEqual(permAction("autoedit").notify, {
    clientIdentifier: PERM_CLIENT_ID,
    permission_mode: "auto",
    yolo_mode: false,
    auto_mode: true,
  });
  assert.equal(permAction("autoedit").modeId, "default");
  assert.deepEqual(permAction("plan").notify, {
    clientIdentifier: PERM_CLIENT_ID,
    permission_mode: "default",
    yolo_mode: false,
    auto_mode: false,
  });
  assert.equal(permAction("plan").modeId, "plan", "计划档走模式轴");
  assert.deepEqual(permAction("full").notify, {
    clientIdentifier: PERM_CLIENT_ID,
    permission_mode: "always-approve",
    yolo_mode: true,
    auto_mode: false,
  });
  assert.equal(permAction("full").modeId, "default", "全放行先退计划");
});

test("菜单四档＝安全→危险；仅 full 标危险；标题逐字活壳", () => {
  assert.deepEqual(PERM_CHOICES.map((c) => c.id), ["confirm", "autoedit", "plan", "full"]);
  assert.equal(PERM_CHOICES.filter((c) => c.danger).map((c) => c.id).join(), "full");
  assert.equal(permLabel("confirm"), "变更前确认");
  assert.equal(permLabel("autoedit"), "自动编辑");
  assert.equal(permLabel("plan"), "计划模式");
  assert.equal(permLabel("full"), "完全访问");
});

