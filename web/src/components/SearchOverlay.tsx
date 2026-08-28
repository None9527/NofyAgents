import { useEffect, useState } from "react";
import type { HostClient, Task } from "../lib/rpc";
import { IconFolder, IconSearch, IconTask } from "../icons";
import { useI18n } from "../lib/i18n";

interface Props {
  client: HostClient;
  onClose: () => void;
  onOpenTask: (task: Task) => void;
  onSwitchWorkspace: (path: string) => void;
}

export function SearchOverlay({ client, onClose, onOpenTask, onSwitchWorkspace }: Props) {
  const { tr } = useI18n();
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      client.search(query).then((result) => {
        setTasks(result.tasks);
        setWorkspaces(result.workspaces);
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [query, client]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-input-row">
          <IconSearch width={15} height={15} />
          <input
            autoFocus
            className="composer-input"
            placeholder={tr("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
        </div>
        <div className="overlay-results">
          {workspaces.map((workspace) => (
            <div
              className="overlay-item"
              key={workspace}
              onClick={() => {
                onSwitchWorkspace(workspace);
                onClose();
              }}
            >
              <IconFolder width={14} height={14} />
              <span>{workspace}</span>
            </div>
          ))}
          {tasks.map((task) => (
            <div
              className="overlay-item"
              key={task.taskId}
              onClick={() => {
                onOpenTask(task);
                onClose();
              }}
            >
              <IconTask width={14} height={14} />
              <span>{task.title}</span>
            </div>
          ))}
          {query && !tasks.length && !workspaces.length && <div className="empty">{tr("noResults")}</div>}
        </div>
      </div>
    </div>
  );
}
