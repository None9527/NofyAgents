// A0-S4-3: 自 modules/stores-core.tsx §3 原样迁入（FeedbackStore + 联系方式持久化；原文件现为薄 re-export shim）。
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 3. FeedbackStore（原 yC，js 36992–37066 / jsx 33835）
 * ----------------------------------------------------------------------------
 * 反馈中心（提交/我的工单/功能请求）开关与草稿态。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | open | boolean | 反馈中心对话框是否打开 |
 *  | featureRequestOpen | boolean | 功能请求对话框是否打开（与 open 互斥） |
 *  | tab | 'submit' \| 'tickets' | 反馈中心当前标签 |
 *  | submitDraft | FeedbackSubmitPayload \| null | 预填提交草稿（由帮助菜单注入） |
 *  | submissionJobId | string \| null | 正在查看的提交作业 id |
 *  | selectedTicketId | string \| null | 工单列表选中项 |
 * actions：openSubmit/openSubmissionJob/openFeatureRequest/openTickets/
 *   setTab/setSelectedTicketId/close（7 个）
 * selectors 使用方（抽样）：共 25 处 —— 38355–38357（反馈中心壳）、38670（工单详情）、
 *   38915–38916（提交作业视图）、39108–39109（RMe memo 根）、141806 帮助动作等。
 * 持久化：联系方式草稿 `zcode.feedback.contact`（xC，37091；CC/Wje/wC/TC 助手）。
 * ==========================================================================*/

export interface FeedbackSubmitPayload {
  title?: string;
  type: "bug" | "feature";
  module: string;
  severity: string;
  includeLogs: boolean;
  description?: string;
  screenshots?: Blob[];
}

export interface FeedbackState {
  open: boolean;
  featureRequestOpen: boolean;
  tab: "submit" | "tickets";
  submitDraft: FeedbackSubmitPayload | null;
  submissionJobId: string | null;
  selectedTicketId: string | null;
  openSubmit(draft?: FeedbackSubmitPayload | null): void;
  openSubmissionJob(jobId: string): void;
  openFeatureRequest(): void;
  openTickets(ticketId?: string | null): void;
  setTab(tab: "submit" | "tickets"): void;
  setSelectedTicketId(ticketId: string | null): void;
  close(): void;
}

export const useFeedbackStore: UseBoundStore<FeedbackState> = createStore<FeedbackState>((set) => ({
  open: false,
  featureRequestOpen: false,
  tab: "submit",
  submitDraft: null,
  submissionJobId: null,
  selectedTicketId: null,
  openSubmit: (draft) =>
    set({ open: true, featureRequestOpen: false, tab: "submit", submitDraft: draft ?? null, submissionJobId: null, selectedTicketId: null }),
  openSubmissionJob: (jobId) =>
    set({ open: true, featureRequestOpen: false, tab: "submit", submitDraft: null, submissionJobId: jobId, selectedTicketId: null }),
  openFeatureRequest: () =>
    set({ open: false, featureRequestOpen: true, submitDraft: null, submissionJobId: null, selectedTicketId: null }),
  openTickets: (ticketId) =>
    set({ open: true, featureRequestOpen: false, tab: "tickets", submitDraft: null, submissionJobId: null, selectedTicketId: ticketId ?? null }),
  setTab: (tab) => set({ tab, ...(tab === "submit" ? { submissionJobId: null } : {}) }),
  setSelectedTicketId: (ticketId) => set({ selectedTicketId: ticketId }),
  close: () => set({ open: false, featureRequestOpen: false, submitDraft: null, submissionJobId: null, selectedTicketId: null }),
}));

/* --- 反馈联系方式持久化（原 xC/SC/CC/Wje/wC/TC，js 37091–37125） --- */

const FEEDBACK_CONTACT_KEY = "zcode.feedback.contact"; // 原 xC

function feedbackStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readFeedbackContact(storage: Storage | null = feedbackStorage()): string {
  if (!storage) return "";
  try {
    return storage.getItem(FEEDBACK_CONTACT_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function clearFeedbackContact(storage: Storage | null = feedbackStorage()): void {
  if (!storage) return;
  try {
    storage.removeItem(FEEDBACK_CONTACT_KEY);
  } catch {
    /* 静默 */
  }
}

export function writeFeedbackContact(contact: string, storage: Storage | null = feedbackStorage()): void {
  const trimmed = contact.trim();
  if (!trimmed) {
    clearFeedbackContact(storage);
    return;
  }
  if (storage) {
    try {
      storage.setItem(FEEDBACK_CONTACT_KEY, trimmed);
    } catch {
      /* 静默 */
    }
  }
}

