export default function LoadingSection() {
  return (
    <div className="loading-section">
      <div className="loading-dots">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>
      <div className="loading-msg">AIがレシピを考えています...</div>
      <div className="loading-sub">しばらくお待ちください</div>
    </div>
  );
}
