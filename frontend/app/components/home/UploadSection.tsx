import type React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon } from "@hugeicons/core-free-icons";

type UploadSectionProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  loading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function UploadSection({ inputRef, loading, onUpload }: UploadSectionProps) {
  return (
    <div className="upload-card" onClick={() => inputRef.current?.click()}>
      <div className="upload-icon-circle">
        <HugeiconsIcon icon={Camera01Icon} size={36} color="currentColor" strokeWidth={1.8} />
      </div>
      <div className="upload-title">食材の写真をアップロード</div>
      <div className="upload-subtitle">JPG / PNG / HEIC に対応しています</div>
      <div className="upload-btn-fake">
        <HugeiconsIcon icon={Camera01Icon} size={16} color="currentColor" strokeWidth={2} />
        写真を選ぶ
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onUpload}
        disabled={loading}
        style={{ display: "none" }}
      />
    </div>
  );
}
