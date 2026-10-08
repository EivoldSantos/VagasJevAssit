import { useCallback, useEffect, useState } from "react";
import type { ExecutionState, FieldsExtractedPayload } from "@/lib/messaging/schemas";
import { getExecutionState } from "@/lib/storage/config";
import {
  classifyTabError,
  extractFieldsOnTab,
  formatTabError,
  getTabUrl,
  resolveActiveTab,
  shouldBlockBeforeInject,
} from "@/lib/messaging/handle-analyze";

export default function ApplicationSection() {
  const [tabUrl, setTabUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldsExtractedPayload | null>(null);
  const [execState, setExecState] = useState<ExecutionState>("IDLE");

  const refreshTab = useCallback(async () => {
    const tab = await resolveActiveTab();
    setTabUrl(getTabUrl(tab));
  }, []);

  useEffect(() => {
    refreshTab();
    getExecutionState().then((s) => setExecState(s as ExecutionState));

    const onMessage = (msg: { type?: string; state?: ExecutionState }) => {
      if (msg.type === "EXECUTION_STATE" && msg.state) {
        setExecState(msg.state);
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [refreshTab]);

  const syncState = async (state: ExecutionState) => {
    setExecState(state);
    try {
      await chrome.runtime.sendMessage({
        type: "EXECUTION_STATE_SYNC",
        state,
      });
    } catch {
      /* background asleep */
    }
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const tab = await resolveActiveTab();
      if (!tab?.id) {
        setError("Nenhuma aba ativa — clique na aba do lab e tente de novo.");
        await syncState("FAILED");
        return;
      }

      setTabUrl(getTabUrl(tab));

      const blockCode = shouldBlockBeforeInject(tab);
      if (blockCode) {
        setError(formatTabError(blockCode));
        await syncState("FAILED");
        return;
      }

      await syncState("ANALYZING");

      const data = await extractFieldsOnTab(tab.id);

      setFields(data);
      await syncState("READY");

      await chrome.runtime.sendMessage({
        type: "EXTRACT_COMPLETE",
        data,
      });
    } catch (e) {
      const tab = await resolveActiveTab();
      const code = classifyTabError(tab, e);
      setError(formatTabError(code));
      setFields(null);
      await syncState("FAILED");
    } finally {
      setLoading(false);
    }
  };

  const restricted =
    tabUrl.startsWith("chrome:") || tabUrl.startsWith("chrome-extension:");

  return (
    <div>
      <h1>Candidatura</h1>
      <p className="muted">Aba ativa: {tabUrl || "(desconhecida)"}</p>
      <p>
        Status:{" "}
        <span
          className={`badge ${execState === "READY" ? "ok" : execState === "FAILED" ? "err" : "warn"}`}
        >
          {execState}
        </span>{" "}
        {restricted ? (
          <span className="badge warn">Restrita</span>
        ) : (
          <span className="badge ok">Permitida</span>
        )}
      </p>

      <div className="actions">
        <button
          type="button"
          className="primary"
          disabled={loading}
          onClick={() => void analyze()}
        >
          {loading ? "Analisando…" : "Analisar formulário"}
        </button>
        <button
          type="button"
          className="secondary"
          disabled
          title="Disponível na Phase 4 (motor determinístico)"
        >
          Autopreencher
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}

      {fields && (
        <>
          <p className="muted">{fields.count} campo(s) encontrado(s)</p>
          <ul className="field-list">
            {fields.fields.map((f) => (
              <li key={`${f.id}-${f.index}`}>
                <strong>{f.label || f.name || f.id || "Campo"}</strong> —{" "}
                {f.inputType}
                {f.visible ? "" : " (oculto)"}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
