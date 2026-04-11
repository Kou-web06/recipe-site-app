'use client';
import React, { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
    const [message, setMessage] = useState('↑画像を選ぶ');
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage("作成中・・・");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload-recipe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            setMessage(data.recipe || "レシピが見つかりませんでした");
        } catch (error) {
            console.error(error);
            setMessage('アップロードに失敗しました。しばらくしてから再試行してください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{padding: '20px'}}>
            <h1>レシピを作る</h1>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
            <p>{message}</p>
        </main>
    );
}