import type { FormField } from "@/lib/form-engine/types";
import { classifyControl } from "@/lib/form-engine/classifier";
import { isSubmitLikeControl } from "@/lib/form-engine/action-space";

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

function isDisabled(el: HTMLElement): boolean {
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return el.disabled;
  }
  return false;
}

function isRequired(el: HTMLElement): boolean {
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return el.required;
  }
  return false;
}

export function extractFieldsFromDocument(): {
  snapshotId: string;
  count: number;
  fields: FormField[];
} {
  const snapshotId = crypto.randomUUID();
  const root =
    document.querySelector("#lab-application-form") ?? document.body;
  const nodes = root.querySelectorAll("input, textarea, select, button");
  const fields: FormField[] = [];
  let domIndex = 0;

  nodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (isSubmitLikeControl(node)) return;
    if (node.tagName === "BUTTON") return;
    if (node instanceof HTMLInputElement && node.type === "hidden") return;

    const inputType = controlType(node);
    const visible = isVisible(node);
    const disabled = isDisabled(node);
    const autocomplete =
      node instanceof HTMLInputElement
        ? node.getAttribute("autocomplete") || undefined
        : undefined;

    const classified = classifyControl({
      tagName: node.tagName.toLowerCase(),
      inputType,
      name: node.getAttribute("name") || undefined,
      id: node.id || undefined,
      autocomplete,
      disabled,
      visible,
    });

    const sensitive = classified.sensitive;
    const currentValue = sensitive ? undefined : readValue(node, inputType);

    fields.push({
      fieldId: crypto.randomUUID(),
      snapshotId,
      tagName: node.tagName.toLowerCase(),
      inputType,
      label: resolveLabel(node) || undefined,
      name: node.getAttribute("name") || undefined,
      id: node.id || undefined,
      placeholder: node.getAttribute("placeholder") || undefined,
      ariaLabel: node.getAttribute("aria-label") || undefined,
      currentValue,
      required: isRequired(node),
      visible,
      disabled,
      supportedOperations: classified.supportedOperations,
      sensitive,
      domIndex: domIndex++,
    });
  });

  return { snapshotId, count: fields.length, fields };
}

/** Collect visible fillable elements in the same order as extractFieldsFromDocument. */
export function collectFieldElements(root: ParentNode): HTMLElement[] {
  const nodes = root.querySelectorAll("input, textarea, select, button");
  const out: HTMLElement[] = [];
  nodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (isSubmitLikeControl(node)) return;
    if (node.tagName === "BUTTON") return;
    if (node instanceof HTMLInputElement && node.type === "hidden") return;
    out.push(node);
  });
  return out;
}
