import {
  BYOK_API_KEY_KEY,
  BYOK_PROVIDER_KEY,
} from "@/lib/storage/product-keys";

export async function isByokConfigured(): Promise<boolean> {
  const data = await chrome.storage.local.get([
    BYOK_PROVIDER_KEY,
    BYOK_API_KEY_KEY,
  ]);
  const provider = data[BYOK_PROVIDER_KEY];
  const apiKey = data[BYOK_API_KEY_KEY];
  return (
    typeof provider === "string" &&
    provider.trim().length > 0 &&
    typeof apiKey === "string" &&
    apiKey.trim().length > 0
  );
}
