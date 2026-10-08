import { useCallback, useEffect, useState } from "react";
import type {
  ExecutionState,
  FieldsExtractedPayload,
  FillResult,
} from "@/lib/messaging/schemas";
import type { FillResultStatus } from "@/lib/form-engine/types";
import { getExecutionState } from "@/lib/storage/config";
import {
  classifyTabError,
  extractFieldsOnTab,
  formatTabError,
  getTabUrl,
  resolveActiveTab,
  shouldBlockBeforeInject,
} from "@/lib/messaging/handle-analyze";

const PROFILE_INCOMPLETE_HINT =
  "Perfil incompleto: cadastre pelo menos nome completo ou e-mail em Perfil antes de autopreencher.";

function statusBadgeClass(status: FillResultStatus): string {
  switch (status) {
    case "FILLED":
      return "badge ok";
    case "FAILED":
      return "badge err";
    case "SKIPPED":
      return "badge warn";
    default:
      return "badge warn";
  }
}

function truncateText(text: string, max = 36): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function resolveFieldLabel(
  fieldId: string,
  fields: FieldsExtractedPayload | null,
): string {
  const f = fields?.fields.find((x) => x.fieldId === fieldId);
  return (
    f?.label?.trim() ||
    f?.name?.trim() ||
    f?.placeholder?.trim() ||
    f?.id?.trim() ||
    "Campo"
  );
}

export default function ApplicationSection() {
  const [tabUrl, setTabUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fillLoading, setFillLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldsExtractedPayload | null>(null);
  const [fillResults, setFillResults] = useState<FillResult[] | null>(null);
  const [lastFillSnapshotId, setLastFillSnapshotId] = useState<string | null>(
    null,
  );
  const [execState, setExecState] = useState<ExecutionState>("IDLE");

  const refreshTab = useCallback(async () => {
    const tab = await resolveActiveTab();
    setTabUrl(getTabUrl(tab));
  }, []);

  useEffect(() => {
    refreshTab();
    getExecutionState().then((s) => setExecState(s as ExecutionState));

    const onMessage = (msg: {
      type?: string;
      state?: ExecutionState;
      data?: { snapshotId: string; results: FillResult[] };
    }) => {
      if (msg.type === "EXECUTION_STATE" && msg.state) {
        setExecState(msg.state);
      }
      if (msg.type === "FILL_COMPLETE" && msg.data?.results) {
        setFillResults(msg.data.results);
        setLastFillSnapshotId(msg.data.snapshotId);
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

  const autofill = async () => {
    setFillLoading(true);
    setError(null);
    setFillResults(null);

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

      await syncState("FILLING");

      const response = (await chrome.runtime.sendMessage({
        type: "AUTOFILL_FORM",
      })) as
        | {
            ok: true;
            snapshotId: string;
            results: FillResult[];
          }
        | { ok: false; error: string };

      if (!response?.ok) {
        setError(response?.error ?? "Autopreencher falhou.");
        await syncState("FAILED");
        return;
      }

      setFillResults(response.results);
      setLastFillSnapshotId(response.snapshotId);
      await syncState("READY");
    } catch (e) {
      const tab = await resolveActiveTab();
      const code = classifyTabError(tab, e);
      setError(formatTabError(code));
      await syncState("FAILED");
    } finally {
      setFillLoading(false);
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
          disabled={loading || fillLoading}
          onClick={() => void analyze()}
        >
          {loading ? "Analisando…" : "Analisar formulário"}
        </button>
        <button
          type="button"
          className="secondary"
          disabled={loading || fillLoading || restricted}
          onClick={() => void autofill()}
        >
          {fillLoading ? "Preenchendo…" : "Autopreencher"}
        </button>
      </div>

      {error && (
        <div
          className={`error-box${error === PROFILE_INCOMPLETE_HINT || error.includes("Perfil incompleto") ? " profile-missing" : ""}`}
          role="alert"
        >
          {error}
        </div>
      )}

      {fields && (
        <>
          <p className="muted">
            {fields.count} campo(s) — snapshot {fields.snapshotId.slice(0, 8)}…
          </p>
          <ul className="field-list">
            {fields.fields.map((f) => (
              <li key={f.fieldId}>
                <strong>{f.label || f.name || f.id || "Campo"}</strong> —{" "}
                {f.inputType}
                {f.visible ? "" : " (oculto)"}
                {f.sensitive ? " (sensível)" : ""}
              </li>
            ))}
          </ul>
        </>
      )}

      {fillResults && (
        <>
          <h2>Resultado do autopreenchimento</h2>
          {lastFillSnapshotId && (
            <p className="muted">
              Snapshot fill: {lastFillSnapshotId.slice(0, 8)}…
            </p>
          )}
          <ul className="field-list fill-results">
            {fillResults.map((r) => {
              const label = resolveFieldLabel(r.fieldId, fields);
              return (
                <li key={r.actionId}>
                  <span className={statusBadgeClass(r.status)}>{r.status}</span>{" "}
                  <strong>{label}</strong>
                  <span className="muted">
                    {" "}
                    · id {truncateText(r.fieldId, 10)}
                  </span>
                  {r.verified ? (
                    <span className="muted"> · verificado</span>
                  ) : (
                    <>
                      {r.observedValue ? (
                        <span className="muted">
                          {" "}
                          · visto: {truncateText(r.observedValue)}
                        </span>
                      ) : null}
                      {r.reason ? (
                        <span className="muted"> · {r.reason}</span>
                      ) : (
                        <span className="muted"> · não verificado</span>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
