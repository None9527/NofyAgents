# Grok Build 桌面前端 · PRD v3（parity 基线版）

> 2026-08-26 · 上游依据：`nofy-tui-full-spec.md`（TUI 穷尽规格）、`zcode-wrap-logic.md`（包装逻辑）、
> `product-design-v2.md`（增强层设计）。v1/v2 PRD 作废，以本文档为准。

## 1. 定位

**nofy 内核的桌面控制台**：把 TUI 已验证的交互范式一个动作不落地 GUI 化（parity），
再叠加桌面增强（注意力/契约/看板/tray/通知/远程）。

我们不是"在 kernel 上发明新产品"，而是 kernel 的**表达层**——这正是 ZCode 之于
Claude Code 的逻辑：内核定义功能边界，GUI 的完整性=产品合格线，差异化放在表达质量
与桌面层，不放在阉割内核能力上。

## 2. 用户与场景

| 角色 | 场景 | 核心诉求 |
|---|---|---|
| 内核老用户（TUI 熟练） | 换桌面端不丢肌肉记忆 | 每个 TUI 动作有 GUI 等价；键位语义保真 |
| 多任务指挥者 | 同时跑 5+ 会话/子代理/工作流 | 一屏观察、分级裁决、不打断 |
| 放权探索者 | 想从 L1 审批逐步放权到 L3/L4 | 回滚覆盖率+校准建议给安全感 |
| 离开-回来者 | 会议后回来看 agent 干了啥 | digest 摘要+未读语义+原地判决 |

## 3. 产品原则

1. **内核定义边界**：TUI 动作集=功能基线（见 §5 parity 表）。TUI 没有的不承诺，TUI 有的不缺席。
2. **表达不发明**：GUI 组件是 kernel 事件的投影（D1 渲染日志不拥有状态）；自研概念（注意力轨/契约/看板）
   只能**聚合**内核已有数据，不能**替代**内核交互面。
3. **诚实降级（D3）**：能力缺失=琥珀文案+保留最后已知；无死按钮；web/桌面差异显式标注。
4. **不打断式打断（D2）**：注意力按 L0–L3 分级上升；队列/interject/btw 保证"想说话时不必等"。
5. **手感保真**：权限选项级语义、rewind 锚点暗化、queue 乐观重排、plan 行级评论等"手感"是合格线，不是装饰。

## 4. 范围三层

```
┌ D 桌面层   tray Companion / 系统通知 / 远程配对 / 多 agent 并行 tab / zen 布局
├ E 增强层   注意力轨 / 任务看板 / 信任契约 / digest（已有，冻结打磨）
├ P parity层 TUI 全交互面 GUI 化（P1–P7，本 PRD 主体）
└ 内核      nofy daemon + ACP（不重实现）
```

## 5. parity 需求清单（P1–P7）

> 验收通则：每条以"TUI 同动作可在 GUI 完成"为 DoD；键位语义见 prototype-design §4。

### P1 会话内环（合格线核心）
| ID | 需求 | TUI 源 | 验收 |
|---|---|---|---|
| P1-01 | 会话重命名（含 --auto 恢复自动标题） | /rename | 右键+头部内联编辑，乐观更新 |
| P1-02 | fork：复制 transcript 分叉+worktree 询问模态(Yes/No/Always/Never) | /fork | 分叉后子会话可见、父会话留 "Forked" 标记 |
| P1-03 | export（剪贴板/.md）与 transcript 全屏查看 | /export /transcript | 导出内容=渲染块 markdown |
| P1-04 | session-info 信息卡（ID/cwd/模型/上下文/分支） | /session-info | 头部徽章点击弹出 |
| P1-05 | 会话内搜索（增量+高亮+n/N） | /find | Ctrl+F 搜索条 |
| P1-06 | jump 轮跳转（移动即滚动） | /jump | 轮索引浮层 |
| P1-07 | prompt 历史（Up 浏览+模糊搜索） | /history | composer Up/搜索浮层 |
| P1-08 | 历史用户块内联编辑→截断重发 | inline edit | 编辑提交=rewind+重发 |
| P1-09 | 时间戳开关+timeline 轮刻度导航 | /timestamps /timeline | 设置项+脊柱右侧刻度条 |
| P1-10 | copy [N][file] 轮级复制 | /copy | 轮级动作菜单 |

### P2 审批/计划/问答保真
| P2-01 | 权限卡选项级：allow-once/allow-always-command(选词±)/allow-edits-session/reject+followup 附言/pattern 编辑/1-9 直选/光标预选链 | permission_view | 七种选项全可操作 |
| P2-02 | plan 审批：计划查看+行级评论+批准/请求修改/放弃；空计划占位 | plan_approval_view | 评论随 cancelled 回传 |
| P2-03 | 多问题表单（多 tab/单选/多选/自由文本/强制提交） | question_view | requestedSchema 全类型渲染 |
| P2-04 | 取消时子代理仍运行四选项模态 | CancelTurn | Stop/Continue/Always×2 |
| P2-05 | 模式三态循环 Normal→Plan→Always-Approve（Shift+Tab 等价）+持久化回滚+toast | cycle mode | 头部模式芯片 |

### P3 活任务面
| P3-01 | 任务抽屉四源（Workflows/Subagents/Bg+Monitor/Scheduled）+kill+复制 stdout+跟随 | tasks_pane | 实时刷新，running 优先 |
| P3-02 | todo 面板（□▶✓✗+隐藏已完成） | todo_pane | Plan 更新流驱动 |
| P3-03 | 队列面板全操作：删/编辑/重排/强发/origin 标识 | queue_pane | 乐观更新+服务器调和 |
| P3-04 | follow-up 建议芯片（≤6，可点击发送） | follow_ups | 回合结束后出现 |
| P3-05 | btw 不打断侧问+折叠块沉淀 | /btw | 运行中可用 |
| P3-06 | send-now（运行中空输入 Enter 强发队首）+ [↓] 转后台 | interject/SendToBackground | composer 语义 |

### P4 上下文/用量/记忆/诊断
| P4-01 | 上下文条（断点混色 0/50/65/75/85/95%） | context_bar | 状态栏常驻 |
| P4-02 | 用量视图（cached/reasoning 拆分/By model/incomplete 标记/绝不 $0） | /usage | 视图+设置页 |
| P4-03 | compact 动作+AutoCompact 事件块 | /compact | 经 ACP 队列 |
| P4-04 | recap 摘要块（迟到/重复闸门） | /recap | 头部动作 |
| P4-05 | 记忆浏览器（Global/Workspace/Sessions 分组+预览+删） | memory_modal | 模态 |
| P4-06 | 诊断模态（13 类警告+fix 征询） | /doctor | 桌面探针等价 |

### P5 生态面
| P5-01 | 扩展模态五页签：Hooks/Plugins/Marketplace/Skills/MCP 运行态（auth+setup 表单+行内状态补丁） | extensions_modal | 运行时状态实时 |
| P5-02 | agents/personas 管理（启停/设默认/外部编辑器/新建表单/详情 IO 表） | agents_modal | 磁盘定义可管 |

### P6 全局面
| P6-01 | 看板升级：attach 会话浮层+peek（live-tail+行内回复+1-9 答权限）+pin/rename/stop 双击 | dashboard | 不离开看板可裁决 |
| P6-02 | 会话浏览器：来源过滤循环/仓库分组/内容深搜/删除武装/UUID 直载 | session_picker | 跨项目 |
| P6-03 | 管家面：trash 恢复/forensics 账本（设置页签） | CLI 动词 | 选择性增强 |

### P7 媒体/查看器
| P7-01 | 块全屏查看器（raw 切换/补丁复制/拖选/运行中跟随） | block_viewer | 工具块 Enter |
| P7-02 | 行查看器 @file:N-M 引用构建 | line_viewer | composer @ 流 |
| P7-03 | 图片/视频/mermaid 内联渲染 | media | DOM 等价 |
| P7-04 | 幽灵下一提示（Tab 接受/Esc 本轮不再） | prompt_suggestion | composer |

## 6. 增强层（E，冻结打磨）
E1 注意力轨 L0–L3+SLA+一键动作（已实现，补 P2 选项级裁决入口）；E2 任务看板（补 P6-01）；
E3 信任契约（autonomy/预算/回滚覆盖率/校准，已实现）；E4 digest（已实现）。

## 7. 桌面层（D，parity 后）
D1 tray Companion 药丸（注意力 L2+ 上升）；D2 系统通知（turn_complete/approval_required 默认，失焦≥3s）；
D3 远程配对客户端；D4 多 agent 并行 tab（Electron 多 BrowserView）；D5 zen 布局。

## 8. 非目标
- 不重实现 agent 运行时（内核真实存在）。
- TUI-only 终端机制不做字面移植（vim 模式/kitty 协议/re-exec），做桌面等价物或舍弃。
- 移动端不在本期。

## 9. 路线图
R1 = P1+P2（合格线）→ R2 = P3+P4 → R3 = P5+P6 → R4 = P7 → R5 = E 打磨+D 层。
每 R 结束跑 parity  checklist：P1/P2 覆盖率必须 100% 才进 R3。

## 10. 成功指标
- parity checklist P1–P2 100%、P3–P4 ≥90%；
- 老用户任务：TUI 常用 20 动作在 GUI 全部≤2 次交互完成；
- D3 演练：断 daemon/断网/无能力三态零死按钮；
- 性能：spine 1000 块滚动 60fps；看板 100 会话 <16ms 渲染。
