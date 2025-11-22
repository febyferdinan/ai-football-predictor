const FOOTBALL_API_URL = '/api/football';

// Helper to get future dates
const getFutureDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(20, 0, 0, 0); // Set to 8:00 PM
  return date.toISOString();
};

// Mock data for fallback with realistic future dates
const MOCK_MATCHES = [
  {
    id: 1,
    status: 'SCHEDULED',
    homeTeam: { name: 'Manchester City', crest: 'https://crests.football-data.org/65.png' },
    awayTeam: { name: 'Liverpool', crest: 'https://crests.football-data.org/64.png' },
    utcDate: getFutureDate(1),
    competition: { name: 'Premier League' }
  },
  {
    id: 2,
    status: 'SCHEDULED',
    homeTeam: { name: 'Real Madrid', crest: 'https://crests.football-data.org/86.png' },
    awayTeam: { name: 'Barcelona', crest: 'https://crests.football-data.org/81.png' },
    utcDate: getFutureDate(2),
    competition: { name: 'La Liga' }
  },
  {
    id: 3,
    status: 'SCHEDULED',
    homeTeam: { name: 'Bayern Munich', crest: 'https://crests.football-data.org/5.png' },
    awayTeam: { name: 'Dortmund', crest: 'https://crests.football-data.org/4.png' },
    utcDate: getFutureDate(3),
    competition: { name: 'Bundesliga' }
  },
  {
    id: 4,
    status: 'FINISHED',
    score: { fullTime: { home: 2, away: 1 } },
    homeTeam: { name: 'Arsenal', crest: 'https://crests.football-data.org/57.png' },
    awayTeam: { name: 'Chelsea', crest: 'https://crests.football-data.org/61.png' },
    utcDate: getFutureDate(-2),
    competition: { name: 'Premier League' }
  },
  {
    id: 5,
    status: 'FINISHED',
    score: { fullTime: { home: 0, away: 3 } },
    homeTeam: { name: 'Man United', crest: 'https://crests.football-data.org/66.png' },
    awayTeam: { name: 'Tottenham', crest: 'https://crests.football-data.org/73.png' },
    utcDate: getFutureDate(-3),
    competition: { name: 'Premier League' }
  }
];

export const getSettings = () => {
  const saved = localStorage.getItem('score_predictor_settings');
  try {
    return saved ? JSON.parse(saved) : {
      footballApiKey: '',
      aiApiKey: '',
      aiProvider: 'gemini',
      aiBaseUrl: '',
      aiModel: '',
      language: 'en'
    };
  } catch (e) {
    console.error('Failed to parse settings:', e);
    return {
      footballApiKey: '',
      aiApiKey: '',
      aiProvider: 'gemini',
      aiBaseUrl: '',
      aiModel: '',
      language: 'en'
    };
  }
};

export const saveSettings = (settings) => {
  localStorage.setItem('score_predictor_settings', JSON.stringify(settings));
  window.dispatchEvent(new Event('settings-change'));
};

export const fetchMatches = async (status = 'SCHEDULED') => {
  const { footballApiKey } = getSettings();

  // Return error if no API key
  if (!footballApiKey) {
    console.warn('No API Key found');
    return { matches: [], error: "No API Key provided. Please configure it in Settings." };
  }

  try {
    const response = await fetch(`${FOOTBALL_API_URL}/matches?status=${status}`, {
      headers: { 'X-Auth-Token': footballApiKey }
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return { matches: [], error: "Invalid API Key. Please check your settings." };
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // If API returns no matches, return empty array
    if (!data.matches || data.matches.length === 0) {
      return { matches: [], error: null };
    }

    return { matches: data.matches, error: null };
  } catch (error) {
    console.error('Fetch matches failed:', error);
    return { matches: [], error: error.message };
  }
};

export const fetchMatchDetails = async (matchId) => {
  const { footballApiKey } = getSettings();
  if (!footballApiKey) return null;

  try {
    const response = await fetch(`${FOOTBALL_API_URL}/matches/${matchId}/head2head?limit=10`, {
      headers: { 'X-Auth-Token': footballApiKey }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      h2h: {
        numberOfMatches: data.resultSet.count,
        totalGoals: data.aggregates.totalGoals,
        homeTeam: data.aggregates.homeTeam,
        awayTeam: data.aggregates.awayTeam,
        draws: data.aggregates.numberOfDraws
      }
    };
  } catch (error) {
    console.error('Fetch match details failed:', error);
    return null;
  }
};

export const predictScore = async (match) => {
  const { aiApiKey, aiProvider, aiBaseUrl, aiModel, language } = getSettings();

  console.log(`Predicting with Provider: ${aiProvider}, Key Present: ${!!aiApiKey}, Language: ${language}`);

  // Return error if no key (except for local LLMs that might not need one)
  if (!aiApiKey && aiProvider !== 'openai-compatible') {
    console.warn('Missing AI API Key');
    return {
      error: true,
      reason: language === 'id' ? 'Kunci API AI hilang. Harap konfigurasi di Pengaturan.' : 'Missing AI API Key. Please configure it in Settings.'
    };
  }

  // Fetch context data
  const context = await fetchMatchDetails(match.id);

  try {
    if (aiProvider === 'gemini') {
      return await predictWithGemini(match, aiApiKey, context, language, aiModel);
    } else if (aiProvider === 'openai') {
      return await predictWithOpenAI(match, aiApiKey, context, language, aiModel);
    } else if (aiProvider === 'openrouter') {
      return await predictWithOpenRouter(match, aiApiKey, aiModel, context, language);
    } else if (aiProvider === 'openai-compatible') {
      return await predictWithOpenAICompatible(match, aiApiKey, aiBaseUrl, aiModel, context, language);
    }
    throw new Error('Unknown AI Provider selected.');
  } catch (error) {
    console.error('AI Prediction failed:', error);
    return {
      error: true,
      reason: `AI Request Failed: ${error.message}`
    };
  }
};

const mockPrediction = (match, customReason = null) => {
  // Simple mock prediction algorithm
  const homePower = Math.random() * 100;
  const awayPower = Math.random() * 100;

  let homeScore = Math.floor(homePower / 20);
  let awayScore = Math.floor(awayPower / 20);

  homeScore = Math.min(homeScore, 5);
  awayScore = Math.min(awayScore, 5);

  const confidence = Math.floor(60 + Math.random() * 35);

  return {
    homeScore,
    awayScore,
    confidence,
    reason: customReason || 'Mock prediction based on random factors (AI unavailable).'
  };
};

const generatePrompt = (match, context, language = 'en') => {
  let prompt = `Predict the score for the football match between ${match.homeTeam.name} (Home) and ${match.awayTeam.name} (Away).`;

  if (context && context.h2h) {
    prompt += `\n\nHead-to-Head Stats (Last ${context.h2h.numberOfMatches} matches):`;
    prompt += `\n- ${match.homeTeam.name} Wins: ${context.h2h.homeTeam.wins}`;
    prompt += `\n- ${match.awayTeam.name} Wins: ${context.h2h.awayTeam.wins}`;
    prompt += `\n- Draws: ${context.h2h.draws}`;
  }

  prompt += `\n\nAnalyze the team strength and H2H history to determine the most likely score.`;

  if (language === 'id') {
    prompt += `\nIMPORTANT: Provide the "reason" in Indonesian language (Bahasa Indonesia).`;
  } else {
    prompt += `\nIMPORTANT: Provide the "reason" in English.`;
  }

  prompt += `\nReturn ONLY a JSON object with this format: { "homeScore": number, "awayScore": number, "confidence": number, "reason": "short explanation citing specific stats" }`;

  return prompt;
};

const predictWithGemini = async (match, apiKey, context, language, model) => {
  const prompt = generatePrompt(match, context, language);
  const modelName = model || 'gemini-pro';

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  if (!data.candidates || !data.candidates[0]) throw new Error(`Gemini API Error: ${JSON.stringify(data)}`);

  const text = data.candidates[0].content.parts[0].text;
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
};

const predictWithOpenAI = async (match, apiKey, context, language, model) => {
  const prompt = generatePrompt(match, context, language);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: "You are a football score prediction expert. You always output JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
};

const predictWithOpenRouter = async (match, apiKey, model, context, language) => {
  const prompt = generatePrompt(match, context, language);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Football Predictor'
    },
    body: JSON.stringify({
      model: model || 'anthropic/claude-3-haiku',
      messages: [
        { role: "system", content: "You are a football score prediction expert. You always output JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
};

const predictWithOpenAICompatible = async (match, apiKey, baseUrl, model, context, language) => {
  const prompt = generatePrompt(match, context, language);
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'local-model',
      messages: [
        { role: "system", content: "You are a football score prediction expert. You always output JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI Compatible API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
};
