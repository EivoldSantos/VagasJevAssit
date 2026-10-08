const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const btnList = document.getElementById("btn-list");
const btnFill = document.getElementById("btn-fill");

function setStatus(text) {
  statusEl.textContent = text;
}

function setOutput(obj) {
  outputEl.textContent =
    typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

function summarizeFill(data) {
  if (!data?.fields) return data;
  const verified = data.fields.filter((f) => f.verified).length;
  return {
    ...data,
    verifiedSummary: `${verified}/${data.fields.length} verified`,
    fields: data.fields.map((f) => ({
      label: f.label,
      verified: f.verified,
      inputType: f.inputType,
      name: f.name,
    })),
  };
}

async function runAgent(command) {
  setStatus(command === "LIST" ? "Listando…" : "Preenchendo…");
  setOutput("");

  const response = await chrome.runtime.sendMessage({
    type: "RUN_FORM_AGENT",
    command,
  });

  if (!response?.ok) {
    setStatus("Erro");
    setOutput(response?.error ?? "Falha desconhecida");
    return;
  }

  if (command === "FILL") {
    const summary = summarizeFill(response.data);
    const ok = summary.verifiedSummary || "";
    setStatus(`OK — ${ok}`);
    setOutput(summary);
    return;
  }

  setStatus(`OK — ${response.data?.count ?? 0} campo(s)`);
  setOutput(response.data);
}

async function withLoading(button, fn) {
  button.disabled = true;
  try {
    await fn();
  } catch (err) {
    setStatus("Erro");
    setOutput(err instanceof Error ? err.message : String(err));
  } finally {
    button.disabled = false;
  }
}

btnList.addEventListener("click", () => {
  withLoading(btnList, () => runAgent("LIST"));
});

btnFill.addEventListener("click", () => {
  withLoading(btnFill, () => runAgent("FILL"));
});
