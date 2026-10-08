const DEFAULT_DEBOUNCE_MS = 120;

type FieldBinding = {
  fieldId: string;
  element: HTMLElement;
};

/**
 * MutationObserver com debounce escopado ao form root (FORM-06 / D-12).
 * Invalida fieldIds quando nós são removidos ou substituídos.
 */
export class FillSessionObserver {
  private staleFieldIds = new Set<string>();
  private filledFieldIds = new Set<string>();
  private bindings = new Map<string, FieldBinding>();
  private observer: MutationObserver | null = null;
  private debounceMs = DEFAULT_DEBOUNCE_MS;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingRecords: MutationRecord[] = [];
  private mutationFlushCount = 0;
  private onFlush: (() => void) | null = null;

  /** Apenas para testes — quantas vezes o debounce disparou o flush. */
  get flushCount(): number {
    return this.mutationFlushCount;
  }

  start(formRoot: ParentNode, options?: { debounceMs?: number; onFlush?: () => void }): void {
    this.stop();
    this.debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
    this.onFlush = options?.onFlush ?? null;

    this.observer = new MutationObserver((records) => {
      this.pendingRecords.push(...records);
      this.scheduleProcess();
    });

    this.observer.observe(formRoot, {
      childList: true,
      subtree: true,
    });
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.observer?.disconnect();
    this.observer = null;
    this.onFlush = null;
  }

  bindField(fieldId: string, element: HTMLElement): void {
    this.bindings.set(fieldId, { fieldId, element });
  }

  markStale(fieldId: string): void {
    this.staleFieldIds.add(fieldId);
  }

  isFieldStale(fieldId: string): boolean {
    if (this.staleFieldIds.has(fieldId)) return true;
    const binding = this.bindings.get(fieldId);
    if (!binding) return false;
    if (!binding.element.isConnected) {
      this.staleFieldIds.add(fieldId);
      return true;
    }
    return false;
  }

  wasFilledInSession(fieldId: string): boolean {
    return this.filledFieldIds.has(fieldId);
  }

  markFilled(fieldId: string): void {
    this.filledFieldIds.add(fieldId);
  }

  resetSessionState(): void {
    this.staleFieldIds.clear();
    this.filledFieldIds.clear();
    this.bindings.clear();
    this.mutationFlushCount = 0;
  }

  private scheduleProcess(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      const batch = this.pendingRecords;
      this.pendingRecords = [];
      this.processMutations(batch);
      this.mutationFlushCount += 1;
      this.onFlush?.();
    }, this.debounceMs);
  }

  private processMutations(records: MutationRecord[]): void {
    for (const record of records) {
      if (record.type !== "childList") continue;
      for (const node of record.removedNodes) {
        this.invalidateIfBound(node);
      }
      if (record.target instanceof HTMLElement) {
        this.invalidateDetachedBindings();
      }
    }
  }

  private invalidateIfBound(node: Node): void {
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    const visit = (el: Element) => {
      for (const [fieldId, binding] of this.bindings) {
        if (binding.element === el || el.contains(binding.element)) {
          this.markStale(fieldId);
        }
      }
      el.querySelectorAll("*").forEach((child) => {
        for (const [fieldId, binding] of this.bindings) {
          if (binding.element === child) {
            this.markStale(fieldId);
          }
        }
      });
    };
    if (node instanceof Element) visit(node);
    else if (node instanceof DocumentFragment) {
      node.childNodes.forEach((n) => {
        if (n instanceof Element) visit(n);
      });
    }
  }

  private invalidateDetachedBindings(): void {
    for (const [fieldId, binding] of this.bindings) {
      if (!binding.element.isConnected) {
        this.markStale(fieldId);
      }
    }
  }
}
