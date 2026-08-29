// A0-S4-3: 自 modules/SkillStore.tsx §14 原样迁入（jsx 1801–2014 白板 store 域；原文件现为薄 re-export shim）。
import { generateUuid as createUuid } from '../modules/SrcSharedB'; // 原 s（src 的 ot 导出 = 内部 cx）：uuid（crypto.randomUUID 回退手写 v4）
import { create } from './zustand'; // 原 _（jsx 38）
import { isE2EStoreBridgeEnabled } from './e2eStoreBridge'; // 原 v（jsx 50）

/* ============================================================================
 * 14. 白板域（原 bn–In，jsx 1802–2014；In 导出 o）
 * ==========================================================================*/

/** 原 bn（jsx 1802）：白板缺省宽。 */
const WHITEBOARD_DEFAULT_WIDTH = 1280;

/** 原 xn（jsx 1803）：白板缺省高。 */
const WHITEBOARD_DEFAULT_HEIGHT = 800;

/** 原 Sn（jsx 1804）：白板深色（导出 c）。 */
const WHITEBOARD_DARK_COLOR = `#111827`;

/** 原 Cn（jsx 1805）：「白板加入聊天」事件名（导出 s）。 */
const WHITEBOARD_ADD_TO_CHAT_EVENT = `zcode:add-whiteboard-to-chat`;

/** 原 wn（jsx 1806）：白板背景色。 */
const WHITEBOARD_BACKGROUND_COLOR = `#ffffff`;

interface WhiteboardPoint {
  x: number;
  y: number;
}

interface WhiteboardStroke {
  id: string;
  tool: string;
  color: string;
  width: number;
  points: WhiteboardPoint[];
}

interface WhiteboardBoard {
  id: string;
  name: string;
  width: number;
  height: number;
  strokes: WhiteboardStroke[];
  undoneStrokes: WhiteboardStroke[];
  createdAt: number;
  updatedAt: number;
}

interface WhiteboardWorkspaceState {
  boardIds: string[];
  boardsById: Record<string, WhiteboardBoard>;
}

interface WhiteboardStoreState {
  workspaces: Record<string, WhiteboardWorkspaceState>;
}

/** 原 W（jsx 1807）：白板工作区键（身份优先；导出 l）。 */
function resolveWhiteboardWorkspaceKey(args: { workspacePath: string; workspaceIdentity?: string | null }): string {
  return args.workspaceIdentity?.trim() || args.workspacePath;
}

/** 原 Tn（jsx 1813）：创建白板。 */
function createWhiteboard(args: { defaultNamePrefix: string; existingNames: string[] }): WhiteboardBoard {
  const createdAt = Date.now();
  return {
    id: `whiteboard:${createUuid()}`,
    name: createUniqueWhiteboardName(args.existingNames, args.defaultNamePrefix),
    width: WHITEBOARD_DEFAULT_WIDTH,
    height: WHITEBOARD_DEFAULT_HEIGHT,
    strokes: [],
    undoneStrokes: [],
    createdAt: createdAt,
    updatedAt: createdAt,
  };
}

/** 原 En（jsx 1826）：不重名白板名（`Whiteboard N`）。 */
function createUniqueWhiteboardName(existingNames: string[], defaultNamePrefix: string): string {
  const prefix = defaultNamePrefix.trim() || `Whiteboard`;
  const taken = new Set(existingNames.map((name) => name.trim()));
  let index = 1;
  for (; taken.has(`${prefix} ${index}`); ) index += 1;
  return `${prefix} ${index}`;
}

/** 原 Dn（jsx 1833）：创建笔画（导出 d）。 */
function createWhiteboardStroke(args: { tool: string; color: string; width: number; points: WhiteboardPoint[] }): WhiteboardStroke {
  return {
    id: `stroke:${createUuid()}`,
    tool: args.tool,
    color: args.color,
    width: args.width,
    points: args.points,
  };
}

/** 原 On（jsx 1842）：白板渲染到 2D 上下文（导出 p）。 */
function renderWhiteboardToContext(
  context: CanvasRenderingContext2D,
  board: WhiteboardBoard,
  options: { scale?: number; backgroundColor?: string; draftStroke?: WhiteboardStroke | null } = {},
): void {
  const scale = options.scale ?? 1;
  const backgroundColor = options.backgroundColor ?? WHITEBOARD_BACKGROUND_COLOR;
  context.save(),
    context.setTransform(scale, 0, 0, scale, 0, 0),
    context.clearRect(0, 0, board.width, board.height),
    (context.fillStyle = backgroundColor),
    context.fillRect(0, 0, board.width, board.height);
  for (const stroke of [...board.strokes, ...(options.draftStroke ? [options.draftStroke] : [])]) drawWhiteboardStroke(context, stroke, backgroundColor);
  context.restore();
}

/** 原 kn（jsx 1849）：单笔绘制（橡皮以背景色覆盖；单点画圆）。 */
function drawWhiteboardStroke(context: CanvasRenderingContext2D, stroke: WhiteboardStroke, backgroundColor: string): void {
  const firstPoint = stroke.points[0];
  if (firstPoint) {
    if (
      context.save(),
      (context.globalCompositeOperation = `source-over`),
      (context.strokeStyle = stroke.tool === `eraser` ? backgroundColor : stroke.color),
      (context.fillStyle = stroke.tool === `eraser` ? backgroundColor : stroke.color),
      (context.lineWidth = stroke.width),
      (context.lineCap = `round`),
      (context.lineJoin = `round`),
      stroke.points.length === 1
    ) {
      context.beginPath(), context.arc(firstPoint.x, firstPoint.y, stroke.width / 2, 0, Math.PI * 2), context.fill(), context.restore();
      return;
    }
    context.beginPath(), context.moveTo(firstPoint.x, firstPoint.y);
    for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y);
    context.stroke(), context.restore();
  }
}

/** 原 An（jsx 1861）：白板 → PNG dataURL。 */
function renderWhiteboardToPngDataUrl(board: WhiteboardBoard): string {
  const canvas = document.createElement(`canvas`);
  canvas.width = board.width;
  canvas.height = board.height;
  const context = canvas.getContext(`2d`);
  if (!context) throw Error(`Canvas context is unavailable.`);
  return renderWhiteboardToContext(context, board), canvas.toDataURL(`image/png`);
}

/** 原 jn（jsx 1868）：白板 → PNG 文件（导出 u）。 */
function whiteboardToPngFile(board: WhiteboardBoard): File {
  const dataUrl = renderWhiteboardToPngDataUrl(board);
  const commaIndex = dataUrl.indexOf(`,`);
  if (commaIndex === -1) throw Error(`Whiteboard image data is invalid.`);
  const binary = atob(dataUrl.slice(commaIndex + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], `${sanitizeWhiteboardFileName(board.name)}.png`, {
    type: `image/png`,
  });
}

/** 原 Mn（jsx 1879）：是否「白板加入聊天」事件（导出 m）。
 *  原码 `typeof CustomEvent < 'u'` = minified `typeof CustomEvent !== 'undefined'`（逐字保留）。 */
function isWhiteboardAddToChatEvent(event: Event): boolean {
  return event.type === `zcode:add-whiteboard-to-chat` && typeof CustomEvent < `u` && event instanceof CustomEvent && isWhiteboardAddToChatDetail(event.detail);
}

interface WhiteboardAddToChatDetail {
  workspacePath: string;
  workspaceIdentity?: string | null;
  boardId: string;
}

/** 原 Nn（jsx 1882）：派发「白板加入聊天」事件；返回是否被拦截（导出 f）。
 *  原码 `typeof window > 'u'` = minified `typeof window === 'undefined'`（逐字保留）。 */
function dispatchWhiteboardAddToChat(detail: WhiteboardAddToChatDetail): boolean {
  if (typeof window > `u`) return false;
  const event = new CustomEvent(WHITEBOARD_ADD_TO_CHAT_EVENT, {
    cancelable: true,
    detail: detail,
  });
  return !window.dispatchEvent(event);
}

/** 原 Pn（jsx 1890）：白板文件名消毒（非法字符→`-`，控 32 以下剔除，首尾点剥除）。 */
function sanitizeWhiteboardFileName(name: string): string {
  return (
    Array.from(name.trim().replace(/[<>:"/\\|?*]+/gu, `-`))
      .filter((char) => char.charCodeAt(0) >= 32)
      .join(``)
      .replace(/^\.+|\.+$/gu, ``) || `whiteboard`
  );
}

/** 原 Fn（jsx 1893）：事件 detail 形状校验。 */
function isWhiteboardAddToChatDetail(detail: unknown): detail is WhiteboardAddToChatDetail {
  if (typeof detail != `object` || !detail) return false;
  const candidate = detail as Record<string, unknown>;
  return (
    typeof candidate.workspacePath == `string` &&
    candidate.workspacePath.length > 0 &&
    typeof candidate.boardId == `string` &&
    candidate.boardId.length > 0 &&
    (candidate.workspaceIdentity === void 0 || typeof candidate.workspaceIdentity == `string`)
  );
}

/** 原 G（jsx 1898）：取白板工作区状态（缺省空）。 */
function getWhiteboardWorkspaceState(state: WhiteboardStoreState, workspaceKey: string): WhiteboardWorkspaceState {
  return state.workspaces[workspaceKey] ?? {
    boardIds: [],
    boardsById: {},
  };
}

/** 原 K（jsx 1904）：白板更新器（返回 workspaces 补丁）。 */
function updateWhiteboardBoard(
  state: WhiteboardStoreState,
  args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string; updater: (board: WhiteboardBoard) => WhiteboardBoard },
): { workspaces: Record<string, WhiteboardWorkspaceState> } {
  const workspaceKey = resolveWhiteboardWorkspaceKey(args);
  const workspaceState = getWhiteboardWorkspaceState(state, workspaceKey);
  const board = workspaceState.boardsById[args.boardId];
  return board
    ? {
        workspaces: {
          ...state.workspaces,
          [workspaceKey]: {
            ...workspaceState,
            boardsById: {
              ...workspaceState.boardsById,
              [args.boardId]: args.updater(board),
            },
          },
        },
      }
    : {
        workspaces: state.workspaces,
      };
}

type WhiteboardStore = WhiteboardStoreState & {
  createBoard: (args: { workspacePath: string; workspaceIdentity?: string | null; defaultNamePrefix: string }) => WhiteboardBoard;
  renameBoard: (args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string; name: string }) => void;
  addStroke: (args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string; stroke: WhiteboardStroke }) => void;
  undoStroke: (args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string }) => void;
  redoStroke: (args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string }) => void;
  clearBoard: (args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string }) => void;
  getBoard: (args: { workspacePath: string; workspaceIdentity?: string | null; boardId: string }) => WhiteboardBoard | null;
};

/** 原 In（jsx 1923）：白板 store（七动作；导出 o）。 */
const useWhiteboardStore = create()<WhiteboardStore>((set, get) => ({
  workspaces: {},
  createBoard: (args) => {
    const workspaceKey = resolveWhiteboardWorkspaceKey(args);
    const workspaceState = getWhiteboardWorkspaceState(get(), workspaceKey);
    const board = createWhiteboard({
      defaultNamePrefix: args.defaultNamePrefix,
      existingNames: workspaceState.boardIds.map((boardId) => workspaceState.boardsById[boardId]?.name ?? ``),
    });
    return (
      set((state) => {
        const current = getWhiteboardWorkspaceState(state, workspaceKey);
        return {
          workspaces: {
            ...state.workspaces,
            [workspaceKey]: {
              boardIds: [...current.boardIds, board.id],
              boardsById: {
                ...current.boardsById,
                [board.id]: board,
              },
            },
          },
        };
      }),
      board
    );
  },
  renameBoard: (args) => {
    const name = args.name.trim();
    name &&
      set((state) =>
        updateWhiteboardBoard(state, {
          ...args,
          updater: (board) => ({
            ...board,
            name: name,
            updatedAt: Date.now(),
          }),
        }),
      );
  },
  addStroke: (args) => {
    set((state) =>
      updateWhiteboardBoard(state, {
        ...args,
        updater: (board) => ({
          ...board,
          strokes: [...board.strokes, args.stroke],
          undoneStrokes: [],
          updatedAt: Date.now(),
        }),
      }),
    );
  },
  undoStroke: (args) => {
    set((state) =>
      updateWhiteboardBoard(state, {
        ...args,
        updater: (board) => {
          const lastStroke = board.strokes.at(-1);
          return lastStroke
            ? {
                ...board,
                strokes: board.strokes.slice(0, -1),
                undoneStrokes: [...board.undoneStrokes, lastStroke],
                updatedAt: Date.now(),
              }
            : board;
        },
      }),
    );
  },
  redoStroke: (args) => {
    set((state) =>
      updateWhiteboardBoard(state, {
        ...args,
        updater: (board) => {
          const lastUndone = board.undoneStrokes.at(-1);
          return lastUndone
            ? {
                ...board,
                strokes: [...board.strokes, lastUndone],
                undoneStrokes: board.undoneStrokes.slice(0, -1),
                updatedAt: Date.now(),
              }
            : board;
        },
      }),
    );
  },
  clearBoard: (args) => {
    set((state) =>
      updateWhiteboardBoard(state, {
        ...args,
        updater: (board) => ({
          ...board,
          strokes: [],
          undoneStrokes: [],
          updatedAt: Date.now(),
        }),
      }),
    );
  },
  getBoard: (args) => {
    const workspaceKey = resolveWhiteboardWorkspaceKey(args);
    return get().workspaces[workspaceKey]?.boardsById[args.boardId] ?? null;
  },
}));

/** 原 jsx 2014：E2E 桥挂载（__whiteboardStoreE2E）。 */
isE2EStoreBridgeEnabled() && (window.__whiteboardStoreE2E = useWhiteboardStore);


/* ============================================================================
 * 导出（A0-S4-3：对应原 SkillStore 导出块中白板域 9 符号 + 类型补导出 2 项）
 * ==========================================================================*/

export {
  WHITEBOARD_DARK_COLOR,
  createWhiteboardStroke,
  dispatchWhiteboardAddToChat,
  resolveWhiteboardWorkspaceKey,
  isWhiteboardAddToChatEvent,
  useWhiteboardStore,
  renderWhiteboardToContext,
  WHITEBOARD_ADD_TO_CHAT_EVENT,
  whiteboardToPngFile,
};
export type { WhiteboardStroke, WhiteboardBoard };
