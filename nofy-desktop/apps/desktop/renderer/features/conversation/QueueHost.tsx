import { memo, useMemo } from "react";
import type { DesktopClient } from "../../application/contracts/public.ts";
import { createQueueSelector } from "../../application/shell/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { QueueStrip } from "./QueueStrip.tsx";
import { recordRender } from "../../ui/renderDiagnostics.ts";
export const QueueHost = memo(function QueueHost({ client }: { client: DesktopClient }) {
  recordRender("QueueHost");
  const selector = useMemo(createQueueSelector, []);
  const { id, entries, ready } = useProjection(client.projection, selector);
  const handlers = useMemo(() => {
    if (!id) return undefined;
    const ensure = async (result: { ok: boolean; error?: string }) => { if (!result.ok) throw new Error(result.error); };
    return { edit: async (entryId: string, text: string) => ensure(await client.sessions.editQueue(id, entryId, text)), remove: async (entryId: string) => ensure(await client.sessions.removeQueue(id, entryId)), clear: async () => ensure(await client.sessions.clearQueue(id)) };
  }, [client, id]);
  return <QueueStrip key={id ?? "none"} entries={entries} disabled={!ready} handlers={handlers} />;
});
