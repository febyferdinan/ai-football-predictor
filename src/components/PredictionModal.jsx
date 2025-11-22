import React from 'react';
import { TRANSLATIONS } from '../constants/translations';

const PredictionModal = ({ match, prediction, loading, onClose, language = 'en' }) => {
    if (!match) return null;

    const t = TRANSLATIONS[language] || TRANSLATIONS.en;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t.predictionResult}</h2>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        {match.homeTeam.name} vs {match.awayTeam.name}
                    </h3>

                    {loading ? (
                        <div style={{ padding: '2rem', color: 'var(--primary)' }}>
                            <div className="spinner" style={{ marginBottom: '1rem' }}>⚽</div>
                            {t.analyzing}
                        </div>
                    ) : prediction ? (
                        <div className="prediction-content">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '2rem',
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                marginBottom: '1rem'
                            }}>
                                <span style={{ color: 'var(--primary)' }}>{prediction.homeScore}</span>
                                <span>-</span>
                                <span style={{ color: 'var(--secondary)' }}>{prediction.awayScore}</span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.confidence}</div>
                                <div style={{
                                    width: '100%',
                                    height: '6px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '3px',
                                    marginTop: '0.5rem',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${prediction.confidence}%`,
                                        height: '100%',
                                        background: `linear-gradient(90deg, var(--primary), var(--secondary))`
                                    }} />
                                </div>
                                <div style={{ marginTop: '0.25rem', fontSize: '0.8rem' }}>{prediction.confidence}%</div>
                            </div>

                            {prediction.reason && (
                                <div style={{
                                    textAlign: 'left',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '1rem'
                                }}>
                                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t.aiReasoning}</h4>
                                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{prediction.reason}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {!loading && (
                    <button className="btn" style={{ width: '100%' }} onClick={onClose}>
                        {t.close}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PredictionModal;
