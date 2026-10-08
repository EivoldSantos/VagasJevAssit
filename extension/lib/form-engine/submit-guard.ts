import { SUBMIT_HINTS, isSubmitLikeControl } from "@/lib/form-engine/action-space";

export { SUBMIT_HINTS, isSubmitLikeControl as isSubmitControl };

type GuardState = {
  listener: (ev: Event) => void;
};

const GUARD_KEY = "__vjaSubmitGuard__";

function getState(): GuardState | undefined {
  return (window as unknown as Record<string, GuardState | undefined>)[GUARD_KEY];
}

function setState(state: GuardState | undefined): void {
  (window as unknown as Record<string, GuardState | undefined>)[GUARD_KEY] =
    state;
}

/** Block accidental submit during fill session (D-19). */
export function installSubmitGuard(): void {
  if (getState()) return;
  const listener = (ev: Event) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    if (!isSubmitLikeControl(target)) return;
    ev.preventDefault();
    ev.stopPropagation();
    (
      window as unknown as { __LAB_SUBMIT_FIRED__?: boolean }
    ).__LAB_SUBMIT_FIRED__ = false;
  };
  document.addEventListener("click", listener, true);
  document.addEventListener("submit", listener, true);
  setState({ listener });
}

export function removeSubmitGuard(): void {
  const state = getState();
  if (!state) return;
  document.removeEventListener("click", state.listener, true);
  document.removeEventListener("submit", state.listener, true);
  setState(undefined);
}
