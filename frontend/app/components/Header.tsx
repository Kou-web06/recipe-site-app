export default function Header() {
    return (
            <nav className="navbar">
                <div className="navbar-inner">
                    <div className="navbar-brand">
                        <div className="navbar-logo">
                            <img src="/assets/Noodle.png" alt="logo" />
                        </div>
                        <span className="navbar-name">AI レシピメーカー</span>
                    </div>
                    <span className="navbar-tagline">写真から、今日のごはん</span>
                </div>
            </nav>
    )
}