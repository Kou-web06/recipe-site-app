'use client';
import React, { useState } from 'react';

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
            const response = await fetch('http://localhost:8000/upload-recipe', {
                method: 'POST',
                body: formData,
            });
            console.log(response);
            const data = await response.json();
            setMessage(data.recipe || "レシピが見つかりませんでした");
        } catch (error) {
            setMessage(`エラーが発生した！`);
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