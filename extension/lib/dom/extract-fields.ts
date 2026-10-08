export type ExtractedField = {
  index: number;
  label: string;
  tagName: string;
  inputType: string;
  name: string;
  id: string;
  currentValue: string;
  visible: boolean;
};

const SUBMIT_HINTS = ["submit", "enviar", "send", "candidatura"];

function isSubmitControl(el: HTMLElement): boolean {
  if (el.tagName === "BUTTON") {
    const type = (el.getAttribute("type") || "").toLowerCase();
    if (type === "submit") return true;
  }
  if (el instanceof HTMLInputElement && el.type === "submit") return true;
  const id = (el.id || "").toLowerCase();
  const text = (el.textContent || "").toLowerCase();
  for (const h of SUBMIT_HINTS) {
    if (id.includes(h) || text.includes(h)) {
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") return true;
    }
  }
  return false;
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (el.offsetParent === null && style.position !== "fixed") return false;
  return true;
}

function resolveLabel(el: HTMLElement): string {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const list = (el as HTMLInputElement).labels;
    if (list?.length) return list[0].innerText.trim();
  }
  const id = el.id;
  if (id) {
    const lbl = el.ownerDocument.querySelector(
      `label[for="${CSS.escape(id)}"]`,
    );
    if (lbl?.textContent) return lbl.textContent.trim();
  }
  return (
    el.getAttribute("aria-label") ||
    el.getAttribute("placeholder") ||
    el.getAttribute("name") ||
    el.id ||
    ""
  );
}

function controlType(el: HTMLElement): string {
  if (el instanceof HTMLSelectElement) return "select";
  if (el instanceof HTMLTextAreaElement) return "textarea";
  if (el instanceof HTMLInputElement) {
    const t = (el.type || "text").toLowerCase();
    if (t === "checkbox" || t === "radio") return t;
    return t;
  }
  return "unknown";
}

function readValue(el: HTMLElement, type: string): string {
  if (el instanceof HTMLInputElement) {
    if (type === "checkbox" || type === "radio") {
      return el.checked ? "checked" : "";
    }
    return el.value;
  }
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    return el.value;
  }
  return "";
}

export function extractFieldsFromDocument(): {
  count: number;
  fields: ExtractedField[];
} {
  const root =
    document.querySelector("#lab-application-form") ?? document.body;
  const nodes = root.querySelectorAll("input, textarea, select, button");
  const fields: ExtractedField[] = [];

  nodes.forEach((node, index) => {
    if (!(node instanceof HTMLElement)) return;
    if (isSubmitControl(node)) return;
    if (node.tagName === "BUTTON") return;
    if (node instanceof HTMLInputElement && node.type === "hidden") return;

    const inputType = controlType(node);
    fields.push({
      index,
      label: resolveLabel(node),
      tagName: node.tagName.toLowerCase(),
      inputType,
      name: node.getAttribute("name") || "",
      id: node.id || "",
      currentValue: readValue(node, inputType),
      visible: isVisible(node),
    });
  });

  return { count: fields.length, fields };
}
