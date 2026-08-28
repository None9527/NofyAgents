import { useState } from "react";
import type { HostClient } from "../lib/rpc";
import { useI18n } from "../lib/i18n";

interface Props {
  client: HostClient;
  cwd: string;
  onBack: () => void;
}

export function TerminalView({ client, cwd, onBack }: Props) {
  const { tr } = useI18n();
  const [lines, setLines] = useState<string[]>([`# cwd: ${cwd}`]);
  const [command, setCommand] = useState("");

  const run = async () => {
    const text = command.trim();
    if (!text) return;
    setCommand("");
    setLines((prev) => [...prev, `$ ${text}`]);
    const result = await client.exec(text, cwd);
    setLines((prev) => [...prev, result.output || "(no output)"]);
  };

  return (
    <section className="list-view">
      <div className="task-head">
        <span className="back" onClick={onBack}>
          ←
        </span>
        <span className="task-title">{tr("terminal")}</span>
      </div>
      <div className="task-scroll terminal-scroll">
        {lines.map((line, i) => (
          <pre className="terminal-line" key={i}>
            {line}
          </pre>
        ))}
      </div>
      <div className="task-composer">
        <input
          className="composer-input"
          placeholder={tr("terminalPlaceholder")}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void run();
          }}
        />
      </div>
    </section>
  );
}
