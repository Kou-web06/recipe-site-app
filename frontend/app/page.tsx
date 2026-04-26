'use client';
import React, { useState, useRef } from 'react';
import type { Recipe } from "../types/recipe";
import { normalizeRecipe } from "../lib/recipe-parser";
import HeroSection from "./components/home/HeroSection";
import UploadSection from "./components/home/UploadSection";
import PreviewSection from "./components/home/PreviewSection";
import LoadingSection from "./components/home/LoadingSection";
import ErrorBanner from "./components/home/ErrorBanner";
import RecipeResult from "./components/home/RecipeResult";
import RetrySection from "./components/home/RetrySection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

    const handleRetry = () => {
        setRecipe(null);
        setError('');
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        inputRef.current?.click();
    };

    return (
        <>
            {/* Hero */}
            {!recipe && !loading && <HeroSection />}

            {/* Main */}
            <main className="main-content">
                {/* Upload */}
                <UploadSection inputRef={inputRef} loading={loading} onUpload={handleUpload} />

                {/* Preview */}
                {preview && <PreviewSection preview={preview} />}

                {/* Loading */}
                {loading && <LoadingSection />}

                {/* Error */}
                {error && <ErrorBanner message={error} />}

                {/* Recipe Result */}
                {recipe && <RecipeResult recipe={recipe} />}

                {/* Retry */}
                {(recipe || error) && !loading && <RetrySection onRetry={handleRetry} />}
            </main>
        </>
    );
}
