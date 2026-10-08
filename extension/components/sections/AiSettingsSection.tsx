import { useState } from "react";
import { deleteAllProductData } from "@/lib/storage/product-data";

type Props = {
  onDeleted?: () => void;
};

export default function AiSettingsSection({ onDeleted }: Props) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const startDelete = () => {
    setError(null);
    setConfirmText("");
    setStep("confirm");
  };

  const executeDelete = async () => {
    if (confirmText.trim() !== "APAGAR") {
      setError('Digite APAGAR para confirmar.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteAllProductData();
      setStep("idle");
      onDeleted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao apagar dados.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Configurações de IA</h1>
      <p className="muted">BYOK e provedor — em breve (Phase 5).</p>

      <section className="privacy-block">
        <h2>Privacidade</h2>
        <p className="muted">
          Remove perfil, currículos importados e configurações locais desta
          extensão.
        </p>
        {step === "idle" ? (
          <button type="button" className="destructive" onClick={startDelete}>
            Apagar todos os meus dados
          </button>
        ) : (
          <div>
            <p>Esta ação não pode ser desfeita. Digite <strong>APAGAR</strong>.</p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
            <div className="actions">
              <button type="button" disabled={busy} onClick={() => void executeDelete()}>
                {busy ? "Apagando…" : "Confirmar exclusão"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep("idle")}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        {error && <div className="error-box">{error}</div>}
      </section>
    </div>
  );
}
