import {
  executeFillSession,
  type FillSessionInput,
  type FillSessionOutput,
} from "@/lib/form-engine/fill-session";

export type { FillSessionInput, FillSessionOutput };

export default defineUnlistedScript(() => {
  (
    window as unknown as {
      __vjaFill?: (input: FillSessionInput) => FillSessionOutput;
    }
  ).__vjaFill = (input) => executeFillSession(input);
});
