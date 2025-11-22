import React from 'react';
import { TRANSLATIONS } from '../constants/translations';

const MatchCard = ({ match, onPredict, language = 'en' }) => {
    console.log('Match Data:', match); // Debug log

    const t = TRANSLATIONS[language] || TRANSLATIONS.en;

    let matchDate = 'Date TBD';
    try {
        const dateObj = new Date(match.utcDate);
        if (!isNaN(dateObj.getTime())) {
            matchDate = dateObj.toLocaleString(language === 'id' ? 'id-ID' : 'en-US');
        }
    } catch (e) {
        console.error('Date parsing error:', e);
    }

    return (

        <div className="card match-card">
            <div className="match-info">
                {match.competition.name} • {matchDate}
            </div>

            <div className="team-container team-home">
                <div className="team-details">
                    <h3 className="team-name">{match.homeTeam.name}</h3>
                    <span className="team-label">{t.home}</span>
                </div>
                {match.homeTeam.crest && (
                    <img
                        src={match.homeTeam.crest}
                        alt={match.homeTeam.name}
                        className="team-crest"
                    />
                )}
            </div>

            {['FINISHED', 'IN_PLAY', 'PAUSED'].includes(match.status) ? (
                <div className="score-badge" style={{ flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                    {['IN_PLAY', 'PAUSED'].includes(match.status) && (
                        <span className="live-indicator">● LIVE</span>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span>{match.score?.fullTime?.home ?? match.score?.current?.home ?? 0}</span>
                        <span>:</span>
                        <span>{match.score?.fullTime?.away ?? match.score?.current?.away ?? 0}</span>
                    </div>
                </div>
            ) : (
                <div className="vs-badge">
                    VS
                </div>
            )}

            <div className="team-container team-away">
                {match.awayTeam.crest && (
                    <img
                        src={match.awayTeam.crest}
                        alt={match.awayTeam.name}
                        className="team-crest"
                    />
                )}
                <div className="team-details away">
                    <h3 className="team-name">{match.awayTeam.name}</h3>
                    <span className="team-label">{t.away}</span>
                </div>
            </div>

            {match.status !== 'FINISHED' && (
                <button
                    className="btn predict-btn"
                    onClick={() => onPredict(match)}
                >
                    {t.predict}
                </button>
            )}
        </div>
    );

};

export default MatchCard;
