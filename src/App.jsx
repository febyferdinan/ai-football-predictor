import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import MatchCard from './components/MatchCard'
import PredictionModal from './components/PredictionModal'
import Settings from './pages/Settings'
import SignIn from './pages/SignIn'
import { fetchMatches, predictScore, getSettings } from './services/api'
import * as auth from './services/auth'
import { TRANSLATIONS } from './constants/translations'

function Header() {
  const [user, setUser] = useState(auth.getCurrentUser())
  const navigate = useNavigate()
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const handleAuthChange = () => setUser(auth.getCurrentUser())
    const handleSettingsChange = () => {
      const settings = getSettings()
      setLanguage(settings.language || 'en')
    }

    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('settings-change', handleSettingsChange)

    // Load initial language setting
    handleSettingsChange()

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('settings-change', handleSettingsChange)
    }
  }, [])

  const handleLogout = () => {
    auth.logout()
    navigate('/')
  }

  const t = TRANSLATIONS[language] || TRANSLATIONS.en

  return (
    <header style={{ padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
      <div className="container app-header-content">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="app-title">⚽ {t.appTitle}</h1>
        </Link>
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)' }}>
                {t.signOut}
              </button>
            </div>
          ) : (
            <Link to="/signin" className="btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              {t.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Home({ matches, finishedMatches, loading, error, onRefresh, onPredict }) {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const handleSettingsChange = () => {
      const settings = getSettings()
      setLanguage(settings.language || 'en')
    }
    window.addEventListener('settings-change', handleSettingsChange)
    handleSettingsChange()
    return () => window.removeEventListener('settings-change', handleSettingsChange)
  }, [])

  const t = TRANSLATIONS[language] || TRANSLATIONS.en

  return (
    <>
      <main className="container" style={{ flex: 1, padding: '2rem 0' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="home-controls-header">
            <h2 style={{ margin: 0 }}>{t.upcomingMatches}</h2>
            <div className="home-controls-buttons">
              <button onClick={onRefresh} className="btn" style={{
                fontSize: '0.9rem',
                padding: '0.6rem 1.2rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--secondary)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}>
                🔄 {t.refresh}
              </button>
              <Link to="/settings" className="btn" style={{
                fontSize: '0.9rem',
                padding: '0.6rem 1.2rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}>
                ⚙️ {t.settings}
              </Link>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {t.selectMatch}
          </p>

          {error && (
            <div style={{
              background: 'rgba(255, 0, 85, 0.1)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              fontSize: '0.9rem'
            }}>
              <strong>{t.mockDataWarning}:</strong> {error}
              <br />
              {t.checkApiKey}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '2rem', color: 'var(--primary)' }}>{t.loading}</div>
          ) : (
            <>
              <div className="match-list">
                {matches.length > 0 ? (
                  matches.map(match => (
                    <MatchCard key={match.id} match={match} onPredict={onPredict} language={language} />
                  ))
                ) : (
                  <p>{t.noMatches}</p>
                )}
              </div>

              <div style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <h2 style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{t.finishedMatches}</h2>
                {finishedMatches.length > 0 ? (
                  <div className="match-list">
                    {finishedMatches.map(match => (
                      <MatchCard key={match.id} match={match} onPredict={() => { }} language={language} />
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>{t.noFinishedMatches}</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}

function App() {
  const [matches, setMatches] = useState([])
  const [finishedMatches, setFinishedMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Prediction state
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [language, setLanguage] = useState('en')

  const loadMatches = async () => {
    setLoading(true)
    setError(null)

    // Fetch Scheduled Matches
    const { matches: scheduledData, error: apiError } = await fetchMatches('SCHEDULED')
    setMatches(scheduledData)

    // Fetch Finished Matches
    const { matches: finishedData } = await fetchMatches('FINISHED')
    setFinishedMatches(finishedData)

    if (apiError) {
      setError(apiError)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadMatches()

    // Listen for language changes for the modal
    const handleSettingsChange = () => {
      const settings = getSettings()
      setLanguage(settings.language || 'en')
    }
    window.addEventListener('settings-change', handleSettingsChange)
    handleSettingsChange()
    return () => window.removeEventListener('settings-change', handleSettingsChange)
  }, [])

  const handlePredict = async (match) => {
    setPredicting(true)
    setSelectedMatch(match)
    const result = await predictScore(match)
    setPrediction(result)
    setPredicting(false)
  }

  const closePrediction = () => {
    setSelectedMatch(null)
    setPrediction(null)
  }

  return (
    <Router>
      <div className="app-shell">
        <Header />

        <Routes>
          <Route path="/" element={
            <Home
              matches={matches}
              finishedMatches={finishedMatches}
              loading={loading}
              error={error}
              onRefresh={loadMatches}
              onPredict={handlePredict}
            />
          } />
          <Route path="/settings" element={<Settings />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>

        {selectedMatch && (
          <PredictionModal
            match={selectedMatch}
            prediction={prediction}
            loading={predicting}
            onClose={closePrediction}
            language={language}
          />
        )}

        <footer style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p>&copy; 2025 Score Predictor Pro. AI Powered.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
