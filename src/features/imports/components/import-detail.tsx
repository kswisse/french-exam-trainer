import { ImportReview } from "./import-review";
import type { ImportDetail } from "../types";

export function ImportDetail({ importData }: { importData: ImportDetail }) {
  return <ImportReview importData={importData} />;
}
