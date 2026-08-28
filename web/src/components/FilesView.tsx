import { useEffect, useState } from "react";
import type { HostClient } from "../lib/rpc";
import { IconFolder } from "../icons";
import { useI18n } from "../lib/i18n";

interface Entry {
  name: string;
  isDir: boolean;
}

interface Props {
  client: HostClient;
  cwd: string;
  onBack: () => void;
}

export function FilesView({ client, cwd, onBack }: Props) {
  const { tr } = useI18n();
  const [dir, setDir] = useState(cwd);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [file, setFile] = useState<{ path: string; content: string } | null>(null);

  useEffect(() => {
    if (!client.isDesktop) return;
    setFile(null);
    client.listFiles(dir).then((list) => setEntries(list));
  }, [dir, client]);

  if (!client.isDesktop) {
    return (
      <section className="list-view">
        <div className="task-head">
          <span className="back" onClick={onBack}>←</span>
          <span className="task-title">{tr("files")}</span>
        </div>
        <div className="empty" style={{ padding: 24 }}>{tr("filesNeedDesktop")}</div>
      </section>
    );
  }

  const open = (entry: Entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDir) {
      setDir(path);
      return;
    }
    void client.readFile(path).then((content) => {
      setFile({ path, content: content ?? "(无法读取)" });
    });
  };

  const parent = dir.includes("/") ? dir.slice(0, dir.lastIndexOf("/")) : null;

  return (
    <section className="list-view">
      <div className="task-head">
        <span className="back" onClick={onBack}>←</span>
        <span className="task-title">{tr("files")}</span>
        <span className="files-path" title={dir}>{dir}</span>
      </div>
      <div className="files-body">
        <div className="files-tree">
          {parent && (
            <div className="files-row" onClick={() => setDir(parent)}>
              <span className="files-icon">↩</span> ..
            </div>
          )}
          {entries.map((entry) => (
            <div className="files-row" key={entry.name} onClick={() => open(entry)}>
              <span className="files-icon">{entry.isDir ? "🗀" : "·"}</span>
              {entry.name}
            </div>
          ))}
          {entries.length === 0 && <div className="empty">{tr("emptyDir")}</div>}
        </div>
        <div className="files-viewer">
          {file ? (
            <>
              <div className="files-viewer-head">
                <IconFolder width={13} height={13} /> {file.path.split("/").pop()}
                <span className="files-viewer-close" onClick={() => setFile(null)}>✕</span>
              </div>
              <pre className="files-content">{file.content}</pre>
            </>
          ) : (
            <div className="empty">{tr("filesHint")}</div>
          )}
        </div>
      </div>
    </section>
  );
}
