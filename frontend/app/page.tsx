'use client';
import React, { useState, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
    Camera01Icon,
    Clock01Icon,
    KitchenUtensilsIcon,
    UserGroupIcon,
} from '@hugeicons/core-free-icons';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Ingredient = { name: string; amount: string };
type Recipe = {
    dish_name: string;
    description: string;
    cooking_time: string;
    servings: string;
    ingredients: Ingredient[];
    steps: string[];
};

function normalizeRecipe(input: unknown): Recipe | null {
    if (typeof input === 'string') {
        const parsed = safeJsonParse(input);
        if (!parsed || typeof parsed !== 'object') {
            return parseRecipeFromText(input);
        }
        return normalizeRecipe(parsed);
    }

    if (!input || typeof input !== 'object') return null;

    const root = input as Record<string, unknown>;
    const source = (root.recipe && typeof root.recipe === 'object'
        ? root.recipe
        : root) as Record<string, unknown>;
    const ingredientsSource = Array.isArray(source.ingredients) ? source.ingredients : [];
    const stepsSource = Array.isArray(source.steps) ? source.steps : [];

    const ingredients = ingredientsSource
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        .map((item) => ({
            name: String(item.name ?? ''),
            amount: String(item.amount ?? ''),
        }))
        .filter((item) => item.name || item.amount);

    const steps = stepsSource
        .map((step) => String(step ?? '').trim())
        .filter(Boolean);

    return {
        dish_name: String(source.dish_name ?? source.title ?? source.name ?? ''),
        description: String(source.description ?? ''),
        cooking_time: String(source.cooking_time ?? ''),
        servings: String(source.servings ?? ''),
        ingredients,
        steps,
    };
}

function parseRecipeFromText(text: string): Recipe {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    const findLine = (patterns: RegExp[]): string => {
        for (const line of lines) {
            if (patterns.some((pattern) => pattern.test(line))) {
                return line;
            }
        }
        return '';
    };

    const dishLine = findLine([/料理名|メニュー|dish|title/i]);
    const dishName = dishLine
        .replace(/^[【\[]?.{0,8}?[】\]]?[:：]?/u, '')
        .trim() || '提案レシピ';

    const stepLines = lines
        .filter((line) => /^\d+[\.)、\s]/.test(line) || /^[-・*]/.test(line))
        .map((line) => line.replace(/^\d+[\.)、\s]*/, '').replace(/^[-・*]\s*/, '').trim())
        .filter(Boolean);

    return {
        dish_name: dishName,
        description: '',
        cooking_time: '',
        servings: '',
        ingredients: [],
        steps: stepLines,
    };
}

function safeJsonParse(value: string): unknown {
    const trimmed = value.trim();

    const direct = tryParseJson(trimmed);
    if (direct !== null) return direct;

    const withoutFences = trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/, '');
    const fenced = tryParseJson(withoutFences);
    if (fenced !== null) return fenced;

    const firstObj = withoutFences.match(/\{[\s\S]*\}/);
    if (firstObj) {
        const extracted = tryParseJson(firstObj[0]);
        if (extracted !== null) return extracted;
    }

    return null;
}

function tryParseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

export default function Home() {
    
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setRecipe(null);
        setError('');
        setPreview(URL.createObjectURL(file));
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload-recipe`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            const recipeCandidate = data?.recipe ?? data?.result?.recipe ?? data;
            const normalizedRecipe = normalizeRecipe(recipeCandidate);
            if (!normalizedRecipe) {
                console.error('Unparseable recipe payload:', data);
                setError('レシピ形式の解析に失敗しました。別の画像でお試しください。');
                return;
            }
            setRecipe(normalizedRecipe);
        } catch (err) {
            console.error(err);
            setError('レシピの生成に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    background: #f8f5f0;
                    font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
                    color: #333;
                    -webkit-font-smoothing: antialiased;
                }

                /* ===== Navbar ===== */
                .navbar {
                    background: #fff;
                    border-bottom: 1px solid #e8e2d9;
                    padding: 0 24px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .navbar-inner {
                    max-width: 1080px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-decoration: none;
                }
                .navbar-logo {
                    width: 32px;
                    height: 32px;
                }
                .navbar-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .navbar-name {
                    font-size: 18px;
                    font-weight: 900;
                    color: #e8622a;
                    letter-spacing: 0.5px;
                }
                .navbar-tagline {
                    font-size: 12px;
                    color: #999;
                    font-weight: 500;
                }

                /* ===== Hero ===== */
                .hero {
                    background: linear-gradient(160deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
                    padding: 48px 24px 56px;
                    text-align: center;
                }
                .hero-title {
                    font-size: 32px;
                    font-weight: 900;
                    color: #1a1a1a;
                    line-height: 1.4;
                    margin-bottom: 12px;
                }
                .hero-title-accent {
                    color: #e8622a;
                }
                .hero-desc {
                    font-size: 15px;
                    color: #666;
                    line-height: 1.7;
                    max-width: 480px;
                    margin: 0 auto;
                }

                /* ===== Main Content ===== */
                .main-content {
                    max-width: 760px;
                    margin: -32px auto 0;
                    padding: 0 20px 80px;
                    position: relative;
                    z-index: 10;
                }

                /* ===== Upload Card ===== */
                .upload-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                    padding: 40px 32px;
                    text-align: center;
                    cursor: pointer;
                    transition: box-shadow 0.25s, transform 0.2s;
                    border: 2px solid transparent;
                }
                .upload-card:hover {
                    box-shadow: 0 8px 32px rgba(232,98,42,0.12);
                    transform: translateY(-2px);
                    border-color: #fed7aa;
                }
                .upload-icon-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fff7ed, #ffedd5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    color: #e8622a;
                }
                .upload-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                }
                .upload-subtitle {
                    font-size: 13px;
                    color: #999;
                    margin-bottom: 20px;
                }
                .upload-btn-fake {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #e8622a;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 28px;
                    font-size: 14px;
                    font-weight: 700;
                    pointer-events: none;
                }

                /* ===== Preview ===== */
                .preview-section {
                    margin-top: 24px;
                    background: #fff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                }
                .preview-label {
                    padding: 14px 20px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid #f0ebe4;
                }
                .preview-section img {
                    width: 100%;
                    display: block;
                    max-height: 360px;
                    object-fit: cover;
                }

                /* ===== Loading ===== */
                .loading-section {
                    margin-top: 32px;
                    text-align: center;
                    padding: 40px 20px;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                }
                .loading-dots {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 20px;
                }
                .loading-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #e8622a;
                    animation: bounce 1.4s ease-in-out infinite;
                }
                .loading-dot:nth-child(2) { animation-delay: 0.16s; }
                .loading-dot:nth-child(3) { animation-delay: 0.32s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
                .loading-msg {
                    font-size: 15px;
                    color: #666;
                    font-weight: 500;
                }
                .loading-sub {
                    font-size: 12px;
                    color: #aaa;
                    margin-top: 8px;
                }

                /* ===== Error ===== */
                .error-banner {
                    margin-top: 24px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 12px;
                    padding: 16px 20px;
                    color: #dc2626;
                    font-size: 14px;
                    text-align: center;
                    font-weight: 500;
                }

                /* ===== Recipe Result ===== */
                .recipe-result {
                    margin-top: 32px;
                }
                .recipe-result-header {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                    overflow: hidden;
                    margin-bottom: 20px;
                }
                .recipe-title-bar {
                    padding: 32px 32px 24px;
                    border-bottom: 1px solid #f0ebe4;
                }
                .recipe-category-tag {
                    display: inline-block;
                    background: #fff7ed;
                    color: #e8622a;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    letter-spacing: 0.5px;
                }
                .recipe-name {
                    font-size: 28px;
                    font-weight: 900;
                    color: #1a1a1a;
                    line-height: 1.35;
                    margin-bottom: 8px;
                }
                .recipe-desc {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.7;
                }
                .recipe-meta {
                    display: flex;
                    gap: 0;
                }
                .recipe-meta-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 18px 12px;
                    border-right: 1px solid #f0ebe4;
                    gap: 6px;
                }
                .recipe-meta-item:last-child { border-right: none; }
                .recipe-meta-icon {
                    color: #e8622a;
                    display: flex;
                    align-items: center;
                }
                .recipe-meta-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1a1a1a;
                }
                .recipe-meta-label {
                    font-size: 11px;
                    color: #aaa;
                    font-weight: 500;
                }

                /* ===== Ingredients ===== */
                .ingredients-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                    padding: 28px 32px;
                    margin-bottom: 20px;
                }
                .card-heading {
                    font-size: 16px;
                    font-weight: 900;
                    color: #1a1a1a;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .card-heading-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    background: #fff7ed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #e8622a;
                }
                .ing-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .ing-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #f5f0e8;
                }
                .ing-row:last-child { border-bottom: none; }
                .ing-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                }
                .ing-amount {
                    font-size: 14px;
                    color: #999;
                    font-weight: 500;
                    text-align: right;
                }

                /* ===== Steps ===== */
                .steps-card {
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                    padding: 28px 32px;
                    margin-bottom: 20px;
                }
                .step-row {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    padding: 16px 0;
                    border-bottom: 1px solid #f5f0e8;
                }
                .step-row:last-child { border-bottom: none; }
                .step-num {
                    flex-shrink: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #e8622a;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 900;
                }
                .step-content {
                    font-size: 14px;
                    line-height: 1.8;
                    color: #444;
                    padding-top: 5px;
                }

                /* ===== Retry ===== */
                .retry-section {
                    text-align: center;
                    margin-top: 8px;
                }
                .retry-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: #fff;
                    color: #e8622a;
                    border: 2px solid #e8622a;
                    border-radius: 10px;
                    padding: 14px 32px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .retry-button:hover {
                    background: #e8622a;
                    color: #fff;
                }

                /* ===== Footer ===== */
                .site-footer {
                    text-align: center;
                    padding: 32px 20px;
                    border-top: 1px solid #e8e2d9;
                    color: #bbb;
                    font-size: 12px;
                }

                /* ===== Responsive ===== */
                @media (max-width: 600px) {
                    .hero { padding: 32px 16px 40px; }
                    .hero-title { font-size: 24px; }
                    .main-content { padding: 0 12px 60px; margin-top: -24px; }
                    .upload-card { padding: 28px 20px; }
                    .recipe-title-bar { padding: 24px 20px 20px; }
                    .recipe-name { font-size: 22px; }
                    .ingredients-card, .steps-card { padding: 20px; }
                    .recipe-meta-item { padding: 14px 8px; }
                }
            `}</style>

            {/* Navbar */}
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

            {/* Hero */}
            {!recipe && !loading && (
                <section className="hero">
                    <h1 className="hero-title">
                        冷蔵庫の食材を<span className="hero-title-accent">撮るだけ</span>で<br />
                        AIがレシピを提案
                    </h1>
                    <p className="hero-desc">
                        食材の写真をアップロードするだけで、AIが最適なレシピを自動で考えてくれます。
                    </p>
                </section>
            )}

            {/* Main */}
            <main className="main-content">
                {/* Upload */}
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
                        onChange={handleUpload}
                        disabled={loading}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Preview */}
                {preview && (
                    <div className="preview-section">
                        <div className="preview-label">アップロードした写真</div>
                        <img src={preview} alt="アップロードした食材" />
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="loading-section">
                        <div className="loading-dots">
                            <div className="loading-dot" />
                            <div className="loading-dot" />
                            <div className="loading-dot" />
                        </div>
                        <div className="loading-msg">AIがレシピを考えています...</div>
                        <div className="loading-sub">しばらくお待ちください</div>
                    </div>
                )}

                {/* Error */}
                {error && <div className="error-banner">{error}</div>}

                {/* Recipe Result */}
                {recipe && (
                    <div className="recipe-result">
                        {/* Header Card */}
                        <div className="recipe-result-header">
                            <div className="recipe-title-bar">
                                <div className="recipe-category-tag">AI 提案レシピ</div>
                                <h2 className="recipe-name">{recipe.dish_name}</h2>
                                {recipe.description && (
                                    <p className="recipe-desc">{recipe.description}</p>
                                )}
                            </div>
                            {(recipe.cooking_time || recipe.servings) && (
                                <div className="recipe-meta">
                                    {recipe.cooking_time && (
                                        <div className="recipe-meta-item">
                                            <span className="recipe-meta-icon">
                                                <HugeiconsIcon icon={Clock01Icon} size={20} color="currentColor" strokeWidth={2} />
                                            </span>
                                            <span className="recipe-meta-value">{recipe.cooking_time}</span>
                                            <span className="recipe-meta-label">調理時間</span>
                                        </div>
                                    )}
                                    {recipe.servings && (
                                        <div className="recipe-meta-item">
                                            <span className="recipe-meta-icon">
                                                <HugeiconsIcon icon={UserGroupIcon} size={20} color="currentColor" strokeWidth={2} />
                                            </span>
                                            <span className="recipe-meta-value">{recipe.servings}</span>
                                            <span className="recipe-meta-label">分量</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Ingredients Card */}
                        {recipe.ingredients.length > 0 && (
                            <div className="ingredients-card">
                                <div className="card-heading">
                                    <span className="card-heading-icon">
                                        <HugeiconsIcon icon={KitchenUtensilsIcon} size={16} color="currentColor" strokeWidth={2} />
                                    </span>
                                    材料
                                </div>
                                <div className="ing-table">
                                    {recipe.ingredients.map((ing, i) => (
                                        <div key={i} className="ing-row">
                                            <span className="ing-name">{ing.name}</span>
                                            <span className="ing-amount">{ing.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Steps Card */}
                        {recipe.steps.length > 0 && (
                            <div className="steps-card">
                                <div className="card-heading">
                                    <span className="card-heading-icon">
                                        <HugeiconsIcon icon={Clock01Icon} size={16} color="currentColor" strokeWidth={2} />
                                    </span>
                                    作り方
                                </div>
                                {recipe.steps.map((step, i) => (
                                    <div key={i} className="step-row">
                                        <div className="step-num">{i + 1}</div>
                                        <div className="step-content">{step}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Retry */}
                {(recipe || error) && !loading && (
                    <div className="retry-section">
                        <button className="retry-button" onClick={() => {
                            setRecipe(null);
                            setError('');
                            setPreview(null);
                            if (inputRef.current) inputRef.current.value = '';
                            inputRef.current?.click();
                        }}>
                            <HugeiconsIcon icon={Camera01Icon} size={18} color="currentColor" strokeWidth={2} />
                            別の食材で試す
                        </button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="site-footer">
                AI レシピメーカー - 食材写真からレシピを自動生成
            </footer>
        </>
    );
}
