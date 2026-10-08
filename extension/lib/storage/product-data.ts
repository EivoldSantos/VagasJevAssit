import {
  deleteAllIndexedDb,
  deleteProfileDatabase,
} from "./profile-db";
import { PRODUCT_STORAGE_KEYS } from "./product-keys";
import { setExecutionState } from "./config";

export async function deleteAllProductData(): Promise<void> {
  await deleteAllIndexedDb();
  await deleteProfileDatabase();
  await chrome.storage.local.remove([...PRODUCT_STORAGE_KEYS]);
  await setExecutionState("IDLE");
}
