import { extractFieldsFromDocument } from "@/lib/dom/extract-fields";

export default defineUnlistedScript(() => {
  (
    window as unknown as {
      __vjaExtract?: () => ReturnType<typeof extractFieldsFromDocument>;
    }
  ).__vjaExtract = () => extractFieldsFromDocument();
});
