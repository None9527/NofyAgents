import { useState } from "react";
import type { HostClient, Provider } from "../lib/rpc";
import { greeting } from "../lib/format";
import { useI18n } from "../lib/i18n";
import { Composer } from "./Composer";
import { IconChevronDown, IconClose, IconFolder, IconMegaphone, IconMoon } from "../icons";

const SUGGESTION_KEYS = [
  ["suggest1Title", "suggest1Body"],
  ["suggest2Title", "suggest2Body"],
  ["suggest3Title", "suggest3Body"],
] as const;

interface Props {
  client: HostClient;
  workspaceName: string;
  recentProjects: string[];
  onSwitchWorkspace: (path: string) => void;
  providers: Provider[];
  selection: { providerId: string; modelName: string } | null;
  onSelectModel: (providerId: string, modelName: string) => void;
  draft: string;
  setDraft: (value: string | ((prev: string) => string)) => void;
  onSubmit: () => void;
  planMode: boolean;
  setPlanMode: (value: boolean) => void;
  confirmMode: boolean;
  setConfirmMode: (value: boolean) => void;
  gitStatus: { branch: string | null; changes: number } | null;
  commands: Array<{ name: string; description: string }>;
  tasks?: Array<{ taskId: string; title: string }>;
  skills?: Array<{ name: string; description?: string }>;
  /** original no-model banner actions */
  onOpenSettings?: () => void;
  onToast?: (msg: string) => void;
}

export function HomeView({
  client,
  workspaceName,
  recentProjects,
  onSwitchWorkspace,
  providers,
  selection,
  onSelectModel,
  draft,
  setDraft,
  onSubmit,
  planMode,
  setPlanMode,
  confirmMode,
  setConfirmMode,
  gitStatus,
  commands,
  tasks,
  skills,
  onOpenSettings,
  onToast,
}: Props) {
  const { tr, locale } = useI18n();
  const [bannerOpen, setBannerOpen] = useState(true);
  const [modelBannerDismissed, setModelBannerDismissed] = useState(false);
  const [workspaceMenu, setWorkspaceMenu] = useState(false);

  return (
    <>
      <section className="hero">
        <svg className="hero-mark" viewBox="0 0 465 135" width="465" height="135">
          <path d="M120 0 L345 0 L310 34 L155 34 L96 101 L130 101 L165 67 L330 67 L240 135 L60 135 Z" fill="none" stroke="#3f3f3f" />
          <path d="M365 0 L423 0 L317 135 L259 135 Z" fill="none" stroke="#3f3f3f" />
        </svg>
        <h1>{greeting(locale)}</h1>
      </section>

      <section className="composer">
        {providers.length === 0 && !modelBannerDismissed && (
          <div className="model-banner">
            <span>ⓘ {tr("noModelBanner")}</span>
            <span className="model-banner-actions">
              <button className="btn-primary" onClick={() => onToast?.(tr("lvIdleSoon"))}>
                {tr("noModelUpgrade")}
              </button>
              <button className="settings-button" onClick={onOpenSettings}>
                {tr("noModelConfig")}
              </button>
              <button className="msg-act" onClick={() => setModelBannerDismissed(true)}>
                ✕
              </button>
            </span>
          </div>
        )}
        <div className="home-composer">
          <div className="workspace-chip" onClick={() => setWorkspaceMenu((v) => !v)}>
            <IconFolder width={14} height={14} />
            <span>{workspaceName}</span>
            {gitStatus?.branch && (
              <span className="git-chip">
                {gitStatus.branch}
                {gitStatus.changes ? ` · ${gitStatus.changes}` : ""}
              </span>
            )}
            <IconChevronDown width={12} height={12} />
            {workspaceMenu && (
              <div className="menu">
                {recentProjects.map((project) => (
                  <div
                    className="menu-item"
                    key={project}
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceMenu(false);
                      onSwitchWorkspace(project);
                    }}
                  >
                    {project.split("/").pop()}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Composer
            client={client}
            draft={draft}
            setDraft={setDraft}
            onSubmit={onSubmit}
            providers={providers}
            selection={selection}
            onSelectModel={onSelectModel}
            planMode={planMode}
            setPlanMode={setPlanMode}
            confirmMode={confirmMode}
            setConfirmMode={setConfirmMode}
            commands={commands}
            tasks={tasks}
            skills={skills}
            workspacePath={undefined}
          />
        </div>

        {bannerOpen && (
          <div className="banner">
            <IconMegaphone width={14} height={14} />
            <span>{tr("banner")}</span>
            <span className="banner-close" onClick={() => setBannerOpen(false)}>
              <IconClose width={12} height={12} />
            </span>
          </div>
        )}

        <div className="suggestions">
          {SUGGESTION_KEYS.map(([titleKey, bodyKey]) => (
            <div
              className="suggestion"
              key={titleKey}
              style={{ cursor: "pointer" }}
              title={tr("suggestClickHint")}
              onClick={() => setDraft(`${tr(titleKey)}：${tr(bodyKey)}`)}
            >
              <div className="suggestion-title">
                <IconMoon width={13} height={13} />
                <span>{tr(titleKey)}</span>
              </div>
              <div className="suggestion-body">{tr(bodyKey)}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
