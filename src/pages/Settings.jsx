import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../services/api';
import { TRANSLATIONS } from '../constants/translations';

const Settings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        footballApiKey: '',
        aiApiKey: '',
        aiProvider: 'gemini',
        aiBaseUrl: '',
        aiModel: '',
        language: 'en'
    });
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        const settings = getSettings();
        setFormData(settings);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveSettings(formData);
        setShowSaved(true);
        setTimeout(() => {
            setShowSaved(false);
            navigate('/');
        }, 1000);
    };

    const t = TRANSLATIONS[formData.language] || TRANSLATIONS.en;

    return (
        <div className="container" style={{ padding: '2rem 0', maxWidth: '600px' }}>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>{t.settingsTitle}</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {t.language}
                        </label>
                        <select
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="en">English</option>
                            <option value="id">Bahasa Indonesia</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {t.footballApiKey}
                        </label>
                        <input
                            type="password"
                            name="footballApiKey"
                            value={formData.footballApiKey}
                            onChange={handleChange}
                            placeholder="Enter your API key"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                            Get free key from <a href="https://www.football-data.org/" target="_blank" style={{ color: 'var(--primary)' }}>football-data.org</a>
                        </small>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {t.aiProvider}
                        </label>
                        <select
                            name="aiProvider"
                            value={formData.aiProvider}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI (GPT)</option>
                            <option value="openai-compatible">OpenAI Compatible (Local LLM/Other)</option>
                        </select>
                    </div>

                    {formData.aiProvider === 'openai-compatible' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                                Base URL
                            </label>
                            <input
                                type="text"
                                name="aiBaseUrl"
                                value={formData.aiBaseUrl}
                                onChange={handleChange}
                                placeholder="e.g., http://localhost:1234/v1"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            Model Name
                        </label>
                        <input
                            type="text"
                            name="aiModel"
                            value={formData.aiModel}
                            onChange={handleChange}
                            placeholder={
                                formData.aiProvider === 'openai' ? "e.g., gpt-4 (default: gpt-3.5-turbo)" :
                                    formData.aiProvider === 'gemini' ? "e.g., gemini-1.5-flash (default: gemini-pro)" :
                                        "e.g., llama-2-7b-chat"
                            }
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {t.aiApiKey}
                        </label>
                        <input
                            type="password"
                            name="aiApiKey"
                            value={formData.aiApiKey}
                            onChange={handleChange}
                            placeholder={formData.aiProvider === 'openai-compatible' ? "Optional for local models" : "Enter AI API key"}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        style={{ width: '100%' }}
                    >
                        {showSaved ? t.saved : t.save}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
