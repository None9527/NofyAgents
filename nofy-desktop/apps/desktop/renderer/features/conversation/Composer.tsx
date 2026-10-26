import { recordRender } from "../../ui/renderDiagnostics.ts";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * Composer —— 提示输入 + 模式与能力的家。
 *
 * ## 活壳解剖（chat-composer-region，CDP 实测；docs/contract/zcode-live-metrics.md §1.4）
 *
 *   输入区  min-h-10(40) max-h-40(160)、text-ui-base leading-5、无内边距（首行顶格）
 *   工具条  h-28、gap 4；左簇 → 右簇之间 ml-auto
 *     左：添加上下文 28×28(plus) ／ 切换模式 h28(shield-alert, warning 色 + 档位名 + chevron)
 *        ／ 电脑操作 h28(monitor-cog + 名)
 *     右：上下文计量 28×28(14px 环, 悬停出用量浮层) ／ 选择模型 h28(package + 名 + chevron)
 *        ／ 推理档 h28(brain + 档名 + chevron) ／ 发送 28×28(arrow-up, 实心 primary, radius 8)
 *   容器    rounded-2xl bg-surface、**无边框**、padding 12、输入区与工具条间距 12
 *
 * 两处诚实的占位（灰着 + title 写明缺什么，不放假动作）：
 *   添加上下文 —— 线路已核实（embeddedContext:true，prompt 收 resource_link，内核自己
 *                 展开 @路径），缺的是选文件浮层与多块 prompt；image/audio 仍 false，不上 UI。
 *   切换模式   —— 线路已核实（session/set_mode 的 plan/ask/default + nofy/yolo_mode_changed
 *                 的 always-approve/auto），缺读回与菜单。
 * 推理档不再常驻灰按钮：内核只在模型 supports_reasoning_effort 时才生成 category=mode
 * 选项（agent_ops.rs:2343），且不支持时 set_model 的 effort 会被**静默丢弃**
 * （model_switch.rs:127-143）⇒ 没选项就整枚不画，同「电脑操作开了才显示」的裁定。
 *
 * 模型选择器是**自绘弹层**（MenuButton），不是原生 select；数据源不变：
 * session/new|load 响应 _meta["nofy/sessionConfig"].options（label 展示、id 提交）。
 *
 * 斜杠面板：草稿以 "/" 开头且未出现空白时开（slashModel.slashQueryOf）；
 * 选中＝把 "/name " 填回草稿——内核在 prompt 文本里自己解析斜杠命令
 * （slash_commands.rs:1390），不需要第二条线路。键盘 ↑↓/Tab/Enter/Esc 在
 * textarea 上统一接管；Esc 关到查询串变化为止。
 *
 * 「+」是活壳同构的四行菜单（2026-09-13 实机截图对照）：添加附件／使用 @ 添加上下文／
 * 使用 / 选择能力／使用 $ 选择技能。三族选择器共用 PickerPopover 壳：
 *   附件  ＝浮层自带输入框，走 _nofy/search/fuzzy，选中进芯片随 prompt 发 resource_link；
 *   @    ＝查询住在草稿 token 里（内核全文收集 @token，prompt_parser.rs:205），选中就地替换；
 *   $    ＝只认草稿第 0 位（技能最终落成 "/name "，斜杠只在首块生效），本地过滤技能族。
 *
 * 文本是**受控**的：草稿态住在 App（空态建议芯片要能填进来），但它是窗口局部态，不进 store。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  IconAt,
  IconBot,
  IconBrain,
  IconChevronDown,
  IconClipboardList,
  IconDollar,
  IconHand,
  IconMonitorCog,
  IconPackage,
  IconPaperclip,
  IconPlus,
  IconSend,
  IconShieldAlert,
  IconShieldCheck,
  IconSlash,
  IconStop,
} from "../../ui/icons.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import type { CommandInfo, ContextInfo, FuzzyMatch, ModelOption } from "../../ui/readers.ts";
import { splitModelOptions } from "../../ui/readers.ts";
import type { TurnUsage } from "../../core/store/state.ts";
import { ContextMeter } from "./ContextMeter.tsx";
import { PickerPopover } from "./PickerPopover.tsx";
import type { PickerRow } from "./PickerPopover.tsx";
import type { AttachItem } from "./attachModel.ts";
import { attachDisplayPath, dedupeAttach, matchToAttach } from "./attachModel.ts";
import { contextView } from "./contextModel.ts";
import type { TriggerToken } from "./mentionModel.ts";
import { mentionTokenFor, spliceToken, triggerTokenOf } from "./mentionModel.ts";
import type { PermId } from "./permModel.ts";
import { PERM_CHOICES, permLabel } from "./permModel.ts";
import { SlashPanel } from "./SlashPanel.tsx";
import type { SlashView } from "./slashModel.ts";
import {
  filterCommands,
  filterSlashGroups,
  slashInsert,
  slashQueryOf,
  slashStep,
} from "./slashModel.ts";

const MAX_HEIGHT_PX = 160; // 活壳 max-h-40

/** 面板关时的空视图（常量，避免每次渲染新建对象）。 */
const SLASH_CLOSED: SlashView = { open: false, groups: [], flat: [], hidden: 0 };

/** 「+」菜单三族选择器。attach 由菜单开；mention/skill 由草稿触发器开。 */
/**
 * 应用内浮层的两族（2026-09-13 用户裁定后）：
 *   mention ＝ @ 触发，走 _nofy/search/fuzzy；skill ＝ $ 触发，本地过滤技能族。
 * 「添加附件」不再走应用内搜索——它弹**系统选文件框**（props.pickFiles）。
 */
type PickerMode = "mention" | "skill";

export type ComposerProps = {
  permissionOpenToken?: number;
  disabled: boolean;
  running: boolean;
  error: string | null;
  models: ModelOption[];
  modelId: string | null;
  /** _nofy/session/info 的 context 块（实测）；null 时计量环不渲染。 */
  context: ContextInfo | null;
  promptCapabilities: { image: boolean; audio: boolean; embeddedContext: boolean } | null;
  value: string;
  onChange: (text: string) => void;
  /** attach = 本次随 prompt 发出的附加项（resource_link 块，排在文本块前）。 */
  onSend: (text: string, attach: AttachItem[]) => Promise<boolean>;
  attachments?: AttachItem[];
  onAttachmentsChange?: (items: AttachItem[]) => void;
  onStop: () => void;
  onModel: (modelId: string) => void;
  /** 推理档选择：session/set_model + _meta.reasoningEffort（内核 pager 同线路）。 */
  onEffort: (effortId: string) => void;
  /**
   * 内核命令表（available_commands_update 实测 167 条；技能带 _meta.scope）。
   * 斜杠面板的数据源；⌘K 用同一份。
   */
  commands: CommandInfo[];
  /**
   * 「+ 添加上下文」的搜索面：fuzzy open/change/close 的生命周期在 App（要 runtime），
   * 这里只消费 matches 与三个回调。null = 无活跃会话，「+」灰着。
   */
  attachSearch: {
    ready: boolean;
    matches: FuzzyMatch[];
    onOpen: () => void;
    onClose: () => void;
    onQuery: (query: string) => void;
  } | null;
  /** 活跃会话 cwd：附加芯片与选文件行显示相对路径用。 */
  cwd: string | null;
  /** 权限模式当前档；null = 无活跃会话，灰着。三源合成见 permModel.currentPermId。 */
  perm: PermId | null;
  onPerm: (id: PermId) => void;
  /** 轮级 usage（turn_completed.usage）：上下文环内圈画本轮缓存命中率；null = 还没跑过一轮。 */
  turnUsage: TurnUsage | null;
  /** 「添加附件」：系统选文件框（宿主能力）。取消＝[]，不报错。 */
  pickFiles: () => Promise<AttachItem[]>;
  /** 电脑操作开关态：true 才画芯片（带绿点、可点关）。CUA 接线批落地前 App 不传＝不画。 */
  computerUseEnabled?: boolean;
  onToggleComputerUse?: () => void;
  /**
   * 运行中的子智能体数（回合内与 detached 都算；活壳 2026-09-11 实机同口径）。>0 才画
   * 后台工作胶囊（活壳 BackgroundWorksCapsule：bot 图标 × 计数、totalCount=0 即 null，
   * 结束即消失）；点击 = 打开侧栏子智能体目录。
   */
  backgroundAgentCount?: number;
  onOpenBackgroundWorks?: () => void;
  /**
   * 聚焦令牌：值一变就把焦点交给输入框。
   * ⌘K 选中内核命令后草稿被填成 "/name "，此时焦点必须回到 composer，
   * 否则用户还得再点一次——命令面板的意义就没了。
   */
  focusToken?: number;
};

function attachTitle(caps: ComposerProps["promptCapabilities"]): string {
  if (caps === null) return tr("内核能力未知（initialize 未完成）");
  return (
    tr("添加上下文：选中项以 resource_link 块随 prompt 发出，内核自己展开 @路径 进上下文") +
    "（embeddedContext:" + String(caps?.embeddedContext) + "）；image:" + String(caps?.image) +
    " audio:" + String(caps?.audio) + tr(" —— 图/音模态内核不支持，不上 UI")
  );
}

const MODE_TITLE =
  tr("权限模式：session/set_mode 管 plan/ask/default，nofy/yolo_mode_changed 管 auto/always-approve；") +
  tr("读回三源 = roster.yolo、settings 的 auto_permission_mode_enabled、current_mode_update。") +
  tr("全放行时内核完全不发权限请求（permission-flow-measured.md §0）");

/** 权限菜单行图标：逐档对齐活壳（hand / shield-check / clipboard-list / shield-alert）。 */
const PERM_ICONS: Record<PermId, ReactNode> = {
  confirm: <IconHand size={15} />,
  autoedit: <IconShieldCheck size={15} />,
  plan: <IconClipboardList size={15} />,
  full: <IconShieldAlert size={15} />,
};
export function Composer(props: ComposerProps) {
  recordRender("Composer");
  const locale = useLocale();
  const {
    disabled, running, error, models, modelId, context, promptCapabilities,
    value, onChange, onSend, onStop, onModel, focusToken,
    onEffort,
  } = props;
  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (!props.permissionOpenToken) return;
    areaRef.current?.closest(".composer")?.querySelector(".perm")?.closest<HTMLButtonElement>("button")?.click();
  }, [props.permissionOpenToken]);

  /* ── 斜杠面板状态（先于选择器块：pickerVisible 要用 slash.open 做互斥） ── */
  const [slashIdx, setSlashIdx] = useState(0);
  /** 用户按过 Esc 的查询串：在它变化前面板保持关。 */
  const [slashEscQuery, setSlashEscQuery] = useState<string | null>(null);
  const slashQuery = slashQueryOf(value);
  const slash = useMemo<SlashView>(() => {
    if (slashQuery === null || slashEscQuery === slashQuery) return SLASH_CLOSED;
    return filterSlashGroups(props.commands, slashQuery);
  }, [props.commands, slashQuery, slashEscQuery, locale]);
  useEffect(() => {
    setSlashIdx(0);
  }, [slashQuery]);
  const pickSlash = useCallback(
    (name: string) => {
      onChange(slashInsert(name));
      setSlashIdx(0);
      setSlashEscQuery(null);
      areaRef.current?.focus();
    },
    [onChange],
  );

  /* ── 附加上下文（「+」）状态：窗口局部，随草稿清空 ── */
  const [localAttach, setLocalAttach] = useState<AttachItem[]>([]);
  const attach = props.attachments ?? localAttach;
  const setAttach = (change: AttachItem[] | ((items: AttachItem[]) => AttachItem[])): void => {
    const next = typeof change === "function" ? change(attach) : change;
    if (props.onAttachmentsChange) props.onAttachmentsChange(next);
    else setLocalAttach(next);
  };
  const [sending, setSending] = useState(false);
  const [pickerIdx, setPickerIdx] = useState(0);
  /** 用户按过 Esc 的触发键（前缀:查询）：在它变化前浮层保持关。 */
  const [pickerEsc, setPickerEsc] = useState<string | null>(null);
  const trig: TriggerToken | null = triggerTokenOf(value);
  const pickerMode: PickerMode | null =
    trig === null ? null : trig.prefix === "@" ? "mention" : "skill";
  const pickerKey = trig === null ? null : trig.prefix + ":" + trig.query;
  // 与斜杠面板互斥：草稿 "/compact @read" 这类输入会让两个浮层叠在同一位置画成糊。
  // 斜杠优先（它是命令语义，@ 只是参数里的引用，等斜杠收口后 @ 自然接管）。
  const pickerVisible =
    pickerMode !== null && !slash.open && pickerEsc !== pickerKey;
  // @ 族的 fuzzy 搜索生命周期跟 pickerVisible；技能族是本地过滤，不碰搜索。
  useEffect(() => {
    if (pickerVisible && pickerMode === "mention") props.attachSearch?.onOpen();
    else props.attachSearch?.onClose();
  }, [pickerVisible, pickerMode, props.attachSearch]);
  useEffect(() => {
    setPickerIdx(0);
  }, [pickerKey, pickerMode]);
  const pickerRows = useMemo<PickerRow[]>(() => {
    if (pickerMode === "skill") {
      return filterCommands(
        props.commands.filter((c) => c.scope !== null),
        trig === null ? "" : trig.query,
      ).map((c) => ({ key: c.name, label: "/" + c.name, sub: c.description }));
    }
    if (pickerMode === null || props.attachSearch === null) return [];
    return props.attachSearch.matches.map((m) => ({
      key: m.path,
      label: m.name,
      sub: attachDisplayPath(m.path, props.cwd),
    }));
  }, [pickerMode, props.commands, props.attachSearch, trig, props.cwd, locale]);
  const closePicker = useCallback(() => {
    setPickerEsc(pickerKey);
    props.attachSearch?.onClose();
    areaRef.current?.focus();
  }, [pickerKey, props.attachSearch]);
  const pickPickerRow = useCallback(
    (index: number) => {
      const row = pickerRows[index];
      if (row === undefined) return;
      if (pickerMode === "mention" && trig !== null) {
        const m = props.attachSearch === null ? undefined : props.attachSearch.matches[index];
        if (m === undefined) return;
        onChange(spliceToken(value, trig.start, mentionTokenFor(matchToAttach(m), props.cwd)));
      } else if (pickerMode === "skill" && trig !== null) {
        onChange(spliceToken(value, trig.start, "/" + row.key + " "));
      } else {
        return;
      }
      setPickerIdx(0);
      setPickerEsc(null);
      areaRef.current?.focus();
    },
    [pickerRows, pickerMode, props.attachSearch, trig, value, onChange, props.cwd],
  );

  // 令牌变化 ⇒ 聚焦（跳过首次挂载：那时不该抢焦点）
  const firstFocus = useRef(true);
  useEffect(() => {
    if (firstFocus.current) {
      firstFocus.current = false;
      return;
    }
    areaRef.current?.focus();
  }, [focusToken]);

  const resize = useCallback(() => {
    const el = areaRef.current;
    if (el === null) return;
    el.style.height = "auto";
    el.style.height = String(Math.min(el.scrollHeight, MAX_HEIGHT_PX)) + "px";
  }, []);

  useEffect(resize, [value, resize]);

  const submit = (): void => {
    const trimmed = value.trim();
    if ((trimmed.length === 0 && attach.length === 0) || disabled || sending) return;
    setSending(true);
    // 清草稿由父层按提交版本负责，失败与发送期间的新输入均保留。
    void onSend(trimmed, attach).finally(() => setSending(false));
  };

  const current = models.find((m) => m.id === modelId) ?? null;
  /* 内核 sessionConfig.options 是模型项与推理档项混装一张表（session_config.rs）：
   * 选择器只吃 category=model，推理档菜单只吃 category=mode。 */
  const { models: modelChoices, modes: modeChoices } = splitModelOptions(models);
  const currentMode = modeChoices.find((m) => m.selected) ?? null;

  return (
    <div className="composer" data-input-state={disabled ? "unavailable" : sending ? "submitting" : running ? "busy" : "ready"}>
      <div className="composer__inner conversation-column">
        {slash.open ? (
          <SlashPanel view={slash} activeIndex={slashIdx} onHover={setSlashIdx} onPick={pickSlash} />
        ) : null}
        {pickerVisible ? (
          <PickerPopover
            ready={pickerMode === "skill" ? true : props.attachSearch?.ready === true}
            rows={pickerRows}
            activeIndex={pickerIdx}
            onHover={setPickerIdx}
            onPick={pickPickerRow}
            onClose={closePicker}
            loadingText={tr("正在打开工作区索引（_nofy/search/fuzzy/open）…")}
            emptyText={pickerMode === "skill" ? tr("没有命中的技能") : tr("没有命中的文件")}
          />
        ) : null}
        {attach.length > 0 ? (
          <div className="attach__chips">
            {attach.map((a) => (
              <span key={a.path} className="attach__chip">
                <span className="attach__chipname">{attachDisplayPath(a.path, props.cwd)}</span>
                <button
                  type="button"
                  className="attach__chipx"
                  aria-label={tr("移除附加 ") + a.name}
                  title={tr("移除附加 ") + a.name}
                  onClick={() => setAttach((list) => list.filter((x) => x.path !== a.path))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <textarea
          ref={areaRef}
          rows={1}
          className="composer__input"
          value={value}
          disabled={disabled}
          title={tr("Enter 发送 · Shift+Enter 换行")}
          placeholder={disabled ? tr("等待内核就绪…") : running ? tr("可继续输入，消息由内核排队处理…") : tr("给 Nofy 一条提示…")}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (slash.open) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSlashIdx((i) => slashStep(slash.flat.length, i, 1));
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setSlashIdx((i) => slashStep(slash.flat.length, i, -1));
                return;
              }
              if (
                (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) &&
                !e.nativeEvent.isComposing
              ) {
                const hit = slash.flat[slashIdx];
                if (hit !== undefined) {
                  e.preventDefault();
                  pickSlash(hit.name);
                }
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setSlashEscQuery(slashQuery);
                return;
              }
            }
            if (pickerVisible && (pickerMode === "mention" || pickerMode === "skill")) {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setPickerIdx((i) => slashStep(pickerRows.length, i, 1));
                return;
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setPickerIdx((i) => slashStep(pickerRows.length, i, -1));
                return;
              }
              if (
                (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                pickPickerRow(pickerIdx);
                return;
              }
              if (e.key === "Escape") {
                e.preventDefault();
                closePicker();
                return;
              }
            }
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="composer__row">
          {/* 活壳同构四行菜单（2026-09-13 实机截图）：附件／@／/／$。
              / 与 $ 两行在「插进去也是死命令」的位置上灰着并说明原因——
              斜杠只在首块开头生效（slash_commands.rs:1479-1480），$ 落成斜杠同约束。 */}
          <MenuButton
            align="left"
            up
            variant="icon"
            chevron={false}
            disabled={props.attachSearch === null}
            title={attachTitle(promptCapabilities)}
            trigger={<IconPlus size={16} />}
            items={[
              { id: "attach", icon: <IconPaperclip size={15} />, label: tr("添加附件") },
              {
                id: "mention",
                icon: <IconAt size={15} />,
                label: (
                  <span className="menu__lab">{tr("使用")}<span className="menu__kbd">@</span>{tr("添加上下文")}</span>
                ),
              },
              {
                id: "slash",
                icon: <IconSlash size={15} />,
                label: (
                  <span className="menu__lab">{tr("使用")}<span className="menu__kbd">/</span>{tr("选择能力")}</span>
                ),
                disabled: value.trim().length > 0 && !value.trimStart().startsWith("/"),
                hint:
                  value.trim().length > 0 && !value.trimStart().startsWith("/")
                    ? tr("斜杠只在提示开头生效")
                    : undefined,
              },
              {
                id: "skill",
                icon: <IconDollar size={15} />,
                label: (
                  <span className="menu__lab">{tr("使用")}<span className="menu__kbd">$</span>{tr("选择技能")}</span>
                ),
                disabled: value.length > 0 && !value.startsWith("$"),
                hint: value.length > 0 && !value.startsWith("$") ? tr("技能落在开头斜杠命令") : undefined,
              },
            ]}
            onPick={(id) => {
              if (id === "attach") {
                // 系统选文件框（用户裁定 2026-09-13）；取消＝[] 静默返回。
                void props.pickFiles().then((items) => {
                  if (items.length === 0) return;
                  setAttach((list) => items.reduce((acc, it) => dedupeAttach(acc, it), list));
                });
                return;
              }
              if (id === "mention") {
                onChange(value + "@");
                setPickerEsc(null);
                areaRef.current?.focus();
                return;
              }
              if (id === "slash") {
                if (value.trim().length === 0) onChange("/");
                setSlashEscQuery(null);
                areaRef.current?.focus();
                return;
              }
              if (value.length === 0) onChange("$");
              setPickerEsc(null);
              areaRef.current?.focus();
            }}
          />
          {props.perm === null ? (
            <button type="button" className="toolbtn" disabled title={MODE_TITLE} aria-label={tr("权限模式")}>
              <IconShieldAlert size={16} />
              <span className="toolbtn__label">{tr("权限模式")}</span>
              <IconChevronDown size={14} className="toolbtn__chev" />
            </button>
          ) : (
            <MenuButton
              align="left"
              up
              variant="plain"
              chevron={false}
              title={MODE_TITLE}
              trigger={
                <span
                  className={
                    "perm" +
                    (PERM_CHOICES.find((c) => c.id === props.perm)?.danger === true
                      ? " perm--danger"
                      : "")
                  }
                >
                  <IconShieldAlert size={16} />
                  <span className="toolbtn__label">{permLabel(props.perm)}</span>
                  <IconChevronDown size={14} className="toolbtn__chev" />
                </span>
              }
              items={PERM_CHOICES.map((c) => ({
                id: c.id,
                label: (
                  <span className="menurow">
                    <span className="menurow__t">{c.label}</span>
                    <span className="menurow__d">{c.desc}</span>
                  </span>
                ),
                icon: PERM_ICONS[c.id],
                selected: c.id === props.perm,
              }))}
              onPick={(id) => props.onPerm(id as PermId)}
            />
          )}
          {/* 电脑操作：**开启才显示**（2026-09-11 用户裁定）。活壳这枚是开关态芯片（开启带绿点）；
              我们 CUA 未接线 ⇒ 没有「开启」态 ⇒ 整枚不画，不放假按钮也不放灰按钮。
              接线批落地后由 App 传 computerUseEnabled + onToggleComputerUse。 */}
          {props.computerUseEnabled === true ? (
            <button
              type="button"
              className="toolbtn toolbtn--on"
              title={tr("电脑操作已开启（点击关闭）。computer-use 能力由内核声明后此芯片才会出现")}
              aria-label={tr("电脑操作（已开启）")}
              onClick={props.onToggleComputerUse}
            >
              <IconMonitorCog size={16} />
              <span className="toolbtn__label">{tr("电脑操作")}</span>
              <span className="toolbtn__dot" aria-hidden="true" />
            </button>
          ) : null}
          {error !== null ? <span className="composer__error">{error}</span> : null}
          <span className="composer__spacer" />
          {props.backgroundAgentCount !== undefined && props.backgroundAgentCount > 0 ? (
            <button
              type="button"
              className="bgworks"
              title={tr("查看本会话子智能体")}
              aria-label={tr("后台运行中的子智能体 ") + String(props.backgroundAgentCount) + tr(" 个")}
              onClick={props.onOpenBackgroundWorks}
            >
              <IconBot size={14} />
              <span className="bgworks__n">{String(props.backgroundAgentCount)}</span>
            </button>
          ) : null}
          <ContextMeter view={contextView(context, props.turnUsage)} />
          {modelChoices.length > 0 ? (
            <MenuButton
              align="right"
              up
              variant="plain"
              chevron={false}
              title={tr("选择模型：数据源是 session/new|load 响应 _meta 的 nofy/sessionConfig.options（category=model 族）")}
              trigger={
                <>
                  <IconPackage size={16} />
                  <span className="toolbtn__label">{current?.label ?? tr("选择模型")}</span>
                  <IconChevronDown size={14} className="toolbtn__chev" />
                </>
              }
              items={modelChoices.map((m) => ({ id: m.id, label: m.label, selected: m.id === modelId }))}
              onPick={onModel}
            />
          ) : null}
          {modeChoices.length > 0 ? (
            <MenuButton
              align="right"
              up
              variant="plain"
              chevron={false}
              title={tr("推理档：category=mode 族；选中经 session/set_model 的 _meta.reasoningEffort 发出（内核 pager 同线路）")}
              trigger={
                <>
                  <IconBrain size={16} />
                  <span className="toolbtn__label">{currentMode?.label ?? tr("推理档")}</span>
                  <IconChevronDown size={14} className="toolbtn__chev" />
                </>
              }
              items={modeChoices.map((m) => ({
                id: m.id,
                label: m.label,
                hint: m.description ?? undefined,
                selected: m.selected,
              }))}
              onPick={onEffort}
            />
          ) : null}
          {running && value.trim().length === 0 && attach.length === 0 ? (
            <button type="button" className="sendbtn sendbtn--stop" onClick={onStop} title="session/cancel（notification）" aria-label={tr("停止")}>
              <IconStop size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="sendbtn"
              onClick={submit}
              disabled={disabled || sending || (value.trim().length === 0 && attach.length === 0)}
              title={running ? tr("发送到内核队列（Enter）") : tr("发送（Enter）")}
              aria-label={tr("发送")}
            >
              <IconSend size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
