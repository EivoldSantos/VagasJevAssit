import { useCallback, useEffect, useState } from "react";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { mergeProfiles } from "@/lib/profile/merge-from-pdf";
import { structureResumeText } from "@/lib/profile/structure-resume-text";
import { isByokConfigured } from "@/lib/profile/is-byok-configured";
import {
  getProfile,
  saveDocument,
  saveProfile,
} from "@/lib/storage/profile-db";
import type { CandidateProfile } from "@/lib/profile/schema";

const MAX_BLOB_BYTES = 5 * 1024 * 1024;

type Props = {
  onNavigateToProfile: () => void;
  onStructuredDraft?: (
    profile: CandidateProfile,
    conflicts: ReturnType<typeof mergeProfiles>["conflicts"],
    incoming: CandidateProfile,
  ) => void;
};

export default function ResumeSection({
  onNavigateToProfile,
  onStructuredDraft,
}: Props) {
  const [extractedText, setExtractedText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [byok, setByok] = useState<boolean | null>(null);

  const refreshByok = useCallback(async () => {
    setByok(await isByokConfigured());
  }, []);

  useEffect(() => {
    void refreshByok();
  }, [refreshByok]);

  const onFile = async (file: File | null) => {
    setError(null);
    setInfo(null);
    setExtractedText("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Selecione um arquivo PDF.");
      return;
    }
    setLoading(true);
    setFileName(file.name);
    try {
      await refreshByok();
      const buf = await file.arrayBuffer();
      const text = await extractPdfText(buf.slice(0));
      setExtractedText(text);

      if (text.trim().length === 0) {
        setInfo(
          "Este PDF não tem camada de texto selecionável (ex.: escaneado). OCR não está disponível no MVP — preencha o perfil manualmente.",
        );
        return;
      }

      const docId = crypto.randomUUID();
      await saveDocument({
        id: docId,
        kind: "pdf",
        name: file.name,
        extractedText: text,
        blob: file.size <= MAX_BLOB_BYTES ? buf.slice(0) : undefined,
        updatedAt: new Date().toISOString(),
      });
      if (file.size > MAX_BLOB_BYTES) {
        setInfo("Arquivo grande: apenas o texto extraído foi guardado (limite 5 MB).");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao ler PDF.");
    } finally {
      setLoading(false);
    }
  };

  const structureWithAi = async () => {
    setError(null);
    setLoading(true);
    try {
      const incoming = await structureResumeText(extractedText);
      const base = (await getProfile()) ?? incoming;
      const { merged, conflicts } = mergeProfiles(base, incoming, {
        mode: "fill-absent-only",
      });
      await saveProfile(merged);
      onStructuredDraft?.(merged, conflicts, incoming);
      if (conflicts.length > 0) {
        setInfo(
          `${conflicts.length} conflito(s) com dados manuais — revise no Perfil.`,
        );
      } else {
        setInfo("Perfil atualizado a partir do currículo.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao estruturar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Currículo</h1>
      <p className="muted">Importe um PDF textual para extrair e revisar.</p>

      <input
        type="file"
        accept="application/pdf"
        disabled={loading}
        onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
      />

      {fileName && <p className="muted">Arquivo: {fileName}</p>}

      {loading && <p className="muted">Processando…</p>}

      {extractedText.length > 0 && (
        <pre className="field-list">{extractedText}</pre>
      )}

      <div className="actions">
        <button
          type="button"
          disabled={loading || extractedText.trim().length === 0}
          onClick={onNavigateToProfile}
        >
          Revisar no Perfil
        </button>
        {byok && extractedText.trim().length > 0 && (
          <button
            type="button"
            disabled={loading}
            onClick={() => void structureWithAi()}
          >
            Estruturar com IA
          </button>
        )}
      </div>

      {info && <p className="muted">{info}</p>}
      {error && <div className="error-box">{error}</div>}
    </div>
  );
}
