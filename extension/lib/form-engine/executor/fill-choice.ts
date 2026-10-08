export function fillSelect(select: HTMLSelectElement, value: string): void {
  select.value = value;
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export function fillRadioGroup(
  name: string,
  value: string,
  root: ParentNode,
): void {
  const inputs = root.querySelectorAll(
    `input[type="radio"][name="${CSS.escape(name)}"]`,
  );
  for (const input of inputs) {
    if (!(input instanceof HTMLInputElement)) continue;
    if (input.value === value) {
      input.click();
      return;
    }
  }
}

export function fillCheckbox(input: HTMLInputElement, checked: boolean): void {
  if (input.checked !== checked) {
    input.click();
  }
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export type ChoiceExpected =
  | { kind: "checkbox"; checked: boolean }
  | { kind: "select"; value: string };

export function verifyChoice(
  el: HTMLElement,
  expected: ChoiceExpected,
): boolean {
  if (expected.kind === "checkbox" && el instanceof HTMLInputElement) {
    if (el.type === "checkbox" || el.type === "radio") {
      return el.checked === expected.checked;
    }
  }
  if (expected.kind === "select" && el instanceof HTMLSelectElement) {
    return el.value === expected.value;
  }
  return false;
}
