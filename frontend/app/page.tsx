'use client';

import { useState } from 'react';

export default function Home() {
    const [message, setMessage] = useState('まだ通信できてない！');

    const handleClick = async () => {
        try {
            const response = await fetch('http://localhost:8000/recipe-test');
            const data = await response.json();

            if(response.status === 200) {
                setMessage(`成功！ メッセージ：${data.message}`);
            }
        } catch (error) {
            setMessage(`エラーが発生した！`);
        }
    }

    return (
        <div>
            <button 
                onClick = {handleClick}
                style = {{ padding: '10px 20px', fontSize: '16px' }}
            >
                FastAPIを叩く！
            </button>
            <p>{message}</p>
        </div>
    );
}