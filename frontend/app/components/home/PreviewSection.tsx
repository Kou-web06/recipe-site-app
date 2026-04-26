type PreviewSectionProps = {
  preview: string;
};

export default function PreviewSection({ preview }: PreviewSectionProps) {
  return (
    <div className="preview-section">
      <div className="preview-label">アップロードした写真</div>
      <img src={preview} alt="アップロードした食材" />
    </div>
  );
}
