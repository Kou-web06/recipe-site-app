import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon } from "@hugeicons/core-free-icons";

type RetrySectionProps = {
  onRetry: () => void;
};

export default function RetrySection({ onRetry }: RetrySectionProps) {
  return (
    <div className="retry-section">
      <button className="retry-button" onClick={onRetry}>
        <HugeiconsIcon icon={Camera01Icon} size={18} color="currentColor" strokeWidth={2} />
        別の食材で試す
      </button>
    </div>
  );
}
