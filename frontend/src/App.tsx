
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';

import type {
  CropPredictionResult,
  YieldPredictionResult,
  FertilizerPredictionResult,
} from './types/predict';
import type { HistoryItem } from './types/history';
import type { DashboardStats } from './types/dashboard';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const features = [
  { icon: '🌱', title: 'Crop Recommendation', description: 'Discover suitable crops based on soil nutrients and weather conditions.', path: 'crop' },
  { icon: '📈', title: 'Crop Yield Prediction', description: 'Estimate expected agricultural yield using relevant input parameters.', path: 'yield' },
  { icon: '🧪', title: 'Fertilizer Recommendation', description: 'Find a suitable fertilizer category for your agricultural conditions.', path: 'fertilizer' },
  { icon: '📋', title: 'Prediction History', description: 'Review your previous predictions and their results.', path: 'history' },
];

type CropForm = {
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  humidity: string;
  ph: string;
  rainfall: string;
};

const initialCropForm: CropForm = {
  nitrogen: '', phosphorus: '', potassium: '',
  temperature: '', humidity: '', ph: '', rainfall: '',
};

const cropFields: {
  name: keyof CropForm;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: string;
  placeholder: string;
}[] = [
  { name: 'nitrogen', label: 'Nitrogen', unit: 'N', min: 0, max: 140, step: '1', placeholder: 'e.g. 90' },
  { name: 'phosphorus', label: 'Phosphorus', unit: 'P', min: 5, max: 145, step: '1', placeholder: 'e.g. 42' },
  { name: 'potassium', label: 'Potassium', unit: 'K', min: 5, max: 205, step: '1', placeholder: 'e.g. 43' },
  { name: 'temperature', label: 'Temperature', unit: '°C', min: 5, max: 55, step: '0.1', placeholder: 'e.g. 25' },
  { name: 'humidity', label: 'Humidity', unit: '%', min: 10, max: 100, step: '0.1', placeholder: 'e.g. 80' },
  { name: 'ph', label: 'Soil pH', unit: 'pH', min: 3.5, max: 10, step: '0.1', placeholder: 'e.g. 6.5' },
  { name: 'rainfall', label: 'Rainfall', unit: 'mm', min: 10, max: 400, step: '0.1', placeholder: 'e.g. 200' },
];

type YieldForm = {
  state: string;
  crop: string;
  season: string;
  area: string;
  annual_rainfall: string;
  fertilizer_used: string;
  pesticide_used: string;
};

const initialYieldForm: YieldForm = {
  state: '', crop: '', season: '', area: '',
  annual_rainfall: '', fertilizer_used: '', pesticide_used: '',
};

type FertilizerForm = {
  temperature: string;
  humidity: string;
  moisture: string;
  soil_type: string;
  crop_type: string;
  nitrogen: string;
  potassium: string;
  phosphorous: string;
};

const initialFertilizerForm: FertilizerForm = {
  temperature: '', humidity: '', moisture: '',
  soil_type: '', crop_type: '', nitrogen: '',
  potassium: '', phosphorous: '',
};

function App() {
  const {
    user, token, isAuthenticated, isLoading: authChecking,
    login, register, logout,
  } = useAuth();

  // Authentication
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Crop
  const [cropForm, setCropForm] = useState<CropForm>(initialCropForm);
  const [cropResult, setCropResult] = useState<CropPredictionResult | null>(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropError, setCropError] = useState('');

  // Yield
  const [yieldForm, setYieldForm] = useState<YieldForm>(initialYieldForm);
  const [yieldResult, setYieldResult] = useState<YieldPredictionResult | null>(null);
  const [yieldLoading, setYieldLoading] = useState(false);
  const [yieldError, setYieldError] = useState('');

  // Fertilizer
  const [fertilizerForm, setFertilizerForm] = useState<FertilizerForm>(initialFertilizerForm);
  const [fertilizerResult, setFertilizerResult] = useState<FertilizerPredictionResult | null>(null);
  const [fertilizerLoading, setFertilizerLoading] = useState(false);
  const [fertilizerError, setFertilizerError] = useState('');

  // Dashboard and history
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyType, setHistoryType] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);

  const [activeSection, setActiveSection] = useState('dashboard');

  const getErrorMessage = (err: unknown) =>
    err instanceof Error ? err.message : 'Something went wrong. Please try again.';

  const readApiError = async (response: Response) => {
    const data = await response.json().catch(() => ({}));
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item: { msg?: string }) => item.msg || 'Invalid input').join(', ');
    }
    return 'The request could not be completed.';
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authMode === 'register' && authPassword !== authConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        await login({ email: authEmail, password: authPassword });
      } else {
        await register({
          full_name: authName,
          email: authEmail,
          password: authPassword,
          confirm_password: authConfirmPassword,
        });

        setAuthMode('login');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthName('');
        setAuthSuccess('Account created successfully! Please log in.');
      }
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setAuthLoading(false);
    }
  };

  // Load dashboard statistics after login.
  const loadDashboard = async () => {
    try {
      setStatsError('');
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      setStatsError(getErrorMessage(err));
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const params: {
        prediction_type?: string;
        q?: string;
        limit?: number;
        offset?: number;
      } = { limit: 50, offset: 0 };

      if (historyType) params.prediction_type = historyType;
      if (historySearch.trim()) params.q = historySearch.trim();

      const data = await api.getHistory(params);
      setHistory(data.items || []);
      setHistoryTotal(data.total || 0);
    } catch (err) {
      setHistoryError(getErrorMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadDashboard();
      void loadHistory();
    }
  }, [isAuthenticated]);

  const handleCropPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCropError('');
    setCropResult(null);

    if (!token) {
      setCropError('Your login session is missing. Please log in again.');
      return;
    }

    const requestData = {
      nitrogen: Number(cropForm.nitrogen),
      phosphorus: Number(cropForm.phosphorus),
      potassium: Number(cropForm.potassium),
      temperature: Number(cropForm.temperature),
      humidity: Number(cropForm.humidity),
      ph: Number(cropForm.ph),
      rainfall: Number(cropForm.rainfall),
    };

    setCropLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/predict/crop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error(await readApiError(response));

      const data = await response.json();
      setCropResult(data as CropPredictionResult);
      await Promise.all([loadDashboard(), loadHistory()]);
    } catch (err) {
      setCropError(getErrorMessage(err));
    } finally {
      setCropLoading(false);
    }
  };

  const handleYieldPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setYieldError('');
    setYieldResult(null);
    setYieldLoading(true);

    try {
      const data = await api.predictYield({
        state: yieldForm.state,
        crop: yieldForm.crop,
        season: yieldForm.season,
        area: Number(yieldForm.area),
        ...(yieldForm.annual_rainfall !== '' && { annual_rainfall: Number(yieldForm.annual_rainfall) }),
        ...(yieldForm.fertilizer_used !== '' && { fertilizer_used: Number(yieldForm.fertilizer_used) }),
        ...(yieldForm.pesticide_used !== '' && { pesticide_used: Number(yieldForm.pesticide_used) }),
      });

      setYieldResult(data);
      await Promise.all([loadDashboard(), loadHistory()]);
    } catch (err) {
      setYieldError(getErrorMessage(err));
    } finally {
      setYieldLoading(false);
    }
  };

  const handleFertilizerPrediction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFertilizerError('');
    setFertilizerResult(null);
    setFertilizerLoading(true);

    try {
      const data = await api.predictFertilizer({
        temperature: Number(fertilizerForm.temperature),
        humidity: Number(fertilizerForm.humidity),
        moisture: Number(fertilizerForm.moisture),
        soil_type: fertilizerForm.soil_type,
        crop_type: fertilizerForm.crop_type,
        nitrogen: Number(fertilizerForm.nitrogen),
        potassium: Number(fertilizerForm.potassium),
        phosphorous: Number(fertilizerForm.phosphorous),
      });

      setFertilizerResult(data);
      await Promise.all([loadDashboard(), loadHistory()]);
    } catch (err) {
      setFertilizerError(getErrorMessage(err));
    } finally {
      setFertilizerLoading(false);
    }
  };

  const openHistoryDetail = async (item: HistoryItem) => {
    try {
      const detail = await api.getHistoryDetail(item.id);
      setSelectedHistory(detail);
    } catch (err) {
      setHistoryError(getErrorMessage(err));
    }
  };

  const handleDeleteHistory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this prediction record?')) return;

    try {
      await api.deleteHistory(id);
      setSelectedHistory(null);
      await Promise.all([loadHistory(), loadDashboard()]);
    } catch (err) {
      setHistoryError(getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    setCropForm(initialCropForm);
    setCropResult(null);
    setYieldForm(initialYieldForm);
    setYieldResult(null);
    setFertilizerForm(initialFertilizerForm);
    setFertilizerResult(null);
    logout();
  };

  const goTo = (section: string) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatLabel = (value: string) =>
    value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const renderSummary = (summary: Record<string, unknown>) => (
    <div className="summary-grid">
      {Object.entries(summary || {}).map(([key, value]) => (
        <div className="summary-item" key={key}>
          <span>{formatLabel(key)}</span>
          <strong>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</strong>
        </div>
      ))}
    </div>
  );

  if (authChecking) {
    return <div className="auth-loading">Loading AgriSense AI...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">🌿</div>
          <h1>AgriSense <span>AI</span></h1>
          <p className="auth-subtitle">SMART FARMING PLATFORM</p>

          <div className="auth-tabs">
            <button type="button" className={authMode === 'login' ? 'selected' : ''}
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}>
              Login
            </button>
            <button type="button" className={authMode === 'register' ? 'selected' : ''}
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}>
              Sign Up
            </button>
          </div>

          <h2>{authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}</h2>
          <p className="auth-description">
            {authMode === 'login'
              ? 'Login to access your smart farming dashboard.'
              : 'Create an account to get started with AgriSense AI.'}
          </p>

          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <input type="text" placeholder="Full Name" value={authName}
                onChange={(e) => setAuthName(e.target.value)} required />
            )}
            <input type="email" placeholder="Email Address" value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)} required />
            {authMode === 'register' && (
              <input type="password" placeholder="Confirm Password"
                value={authConfirmPassword}
                onChange={(e) => setAuthConfirmPassword(e.target.value)} required />
            )}

            {authSuccess && <div className="auth-success">{authSuccess}</div>}
            {authError && <div className="auth-error" role="alert">{authError}</div>}

            <button className="auth-submit" type="submit" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login to Dashboard →' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setAuthError('');
              setAuthSuccess('');
            }}>
              {authMode === 'login' ? ' Sign Up' : ' Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="agri-app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌿</span>
          <div><h2>AgriSense <span>AI</span></h2><small>SMART FARMING PLATFORM</small></div>
        </div>

        <nav className="navigation">
          <p className="nav-heading">MAIN MENU</p>
          {[
            ['dashboard', '⌂ Dashboard'],
            ['crop', '🌱 Crop Recommendation'],
            ['yield', '📈 Yield Prediction'],
            ['fertilizer', '🧪 Fertilizer Recommendation'],
            ['history', '📋 Prediction History'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}
              className={`nav-link ${activeSection === id ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); goTo(id); }}>
              {label}
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span>🌾</span>
            <h3>Smart decisions, better farming.</h3>
            <p>Use agricultural insights to support your farming decisions.</p>
          </div>
          <p className="sidebar-footer">AgriSense AI © 2026</p>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div><p className="breadcrumb">Home / Dashboard</p><h2>Dashboard</h2></div>
          <div className="profile">
            <div className="avatar">{(user?.full_name || 'A').charAt(0).toUpperCase()}</div>
            <div><strong>Welcome</strong><small>{user?.full_name || 'AgriSense User'}</small></div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <section className="welcome-banner">
          <div className="welcome-text">
            <span className="eyebrow">INTELLIGENT AGRICULTURE</span>
            <h1>Grow Smarter with <span>AgriSense AI</span></h1>
            <p>Make informed agricultural decisions with machine learning powered crop, yield and fertilizer recommendations.</p>
            <a href="#features" className="primary-button">Explore Features →</a>
          </div>
          <div className="welcome-illustration" aria-hidden="true">🌱</div>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR AGRICULTURAL ASSISTANT</span>
              <h2>Explore Our Services</h2><p>Choose a module to get started.</p></div>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.path}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3><p>{feature.description}</p>
                <a href={`#${feature.path}`} className="feature-link"
                  onClick={(e) => { e.preventDefault(); goTo(feature.path); }}>
                  Explore module <span>→</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Dashboard statistics */}
        <section className="section" id="statistics">
          <div className="section-heading">
            <div><span className="eyebrow">YOUR ACTIVITY</span><h2>Dashboard Overview</h2>
              <p>Your prediction activity at a glance.</p></div>
            <button className="secondary-button" onClick={() => void loadDashboard()}>Refresh</button>
          </div>

          {statsError && <div className="error-message">{statsError}</div>}
          <div className="feature-grid">
            {[
              ['📊', 'Total Predictions', stats?.total_predictions ?? '—'],
              ['🌱', 'Crop Recommendations', stats?.crop_recommendations ?? '—'],
              ['📈', 'Yield Predictions', stats?.yield_predictions ?? '—'],
              ['🧪', 'Fertilizer Recommendations', stats?.fertilizer_recommendations ?? '—'],
            ].map(([icon, label, value]) => (
              <article className="feature-card" key={label}>
                <div className="feature-icon">{icon}</div>
                <h3>{value}</h3><p>{label}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Crop Recommendation */}
        <section className="crop-section" id="crop">
          <div className="section-heading">
            <span className="eyebrow">MACHINE LEARNING MODULE</span>
            <h2>🌱 Crop Recommendation</h2>
            <p>Enter your soil and environmental conditions to get a crop recommendation.</p>
          </div>

          <form className="crop-form" onSubmit={handleCropPrediction}>
            <div className="form-heading">
              <div><h3>Soil & Environmental Details</h3><p>Fill in all seven parameters below.</p></div>
              <span className="form-tag">7 PARAMETERS</span>
            </div>

            <div className="crop-input-grid">
              {cropFields.map((field) => (
                <div className="form-group" key={field.name}>
                  <label htmlFor={field.name}>{field.label}<span className="input-unit">{field.unit}</span></label>
                  <input id={field.name} type="number" required min={field.min} max={field.max}
                    step={field.step} placeholder={field.placeholder}
                    value={cropForm[field.name]}
                    onChange={(e) => setCropForm({ ...cropForm, [field.name]: e.target.value })} />
                  <small>Range: {field.min} – {field.max}</small>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-button"
                onClick={() => { setCropForm(initialCropForm); setCropResult(null); setCropError(''); }}>Reset</button>
              <button type="submit" className="submit-button" disabled={cropLoading}>
                {cropLoading ? 'Analyzing...' : 'Get Crop Recommendation →'}
              </button>
            </div>
          </form>

          {cropError && <div className="error-message"><strong>Prediction failed</strong><p>{cropError}</p></div>}
          {cropLoading && <div className="status-message"><div className="loading-spinner" /><p>Analyzing soil and environmental conditions...</p></div>}

          {cropResult && (
            <section className="result-card" aria-live="polite">
              <div className="result-header"><div><span className="eyebrow">PREDICTION COMPLETE</span><h3>Your Recommended Crop</h3></div><span className="result-icon">🌾</span></div>
              <div className="recommended-crop">
                <span>Recommended crop</span><h2>{cropResult.recommended_crop}</h2>
                {cropResult.confidence != null && <p>Model confidence: {cropResult.confidence}</p>}
              </div>
              <div className="result-detail"><h4>Explanation</h4><p>{cropResult.explanation}</p></div>
              <div className="result-detail"><h4>Input Summary</h4>{renderSummary(cropResult.input_summary)}</div>
              <div className="result-detail"><h4>🌿 Agronomic Tips</h4>
                <ul className="tips-list">{cropResult.agronomic_tips?.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
              </div>
              <div className="disclaimer"><strong>Disclaimer</strong><p>{cropResult.disclaimer}</p></div>
              <div className="result-footer">
                <span>Prediction ID: {cropResult.prediction_id ?? 'Not available'}</span>
                <span>{cropResult.created_at ? new Date(cropResult.created_at).toLocaleString() : ''}</span>
              </div>
              <button className="secondary-button" onClick={() => { setCropForm(initialCropForm); setCropResult(null); }}>Make Another Prediction</button>
            </section>
          )}
        </section>

        {/* Yield Prediction */}
        <section className="crop-section" id="yield">
          <div className="section-heading">
            <span className="eyebrow">MACHINE LEARNING MODULE</span>
            <h2>📈 Crop Yield Prediction</h2>
            <p>Enter agricultural details to estimate expected crop yield.</p>
          </div>

          <form className="crop-form" onSubmit={handleYieldPrediction}>
            <div className="form-heading"><div><h3>Crop & Field Details</h3><p>Enter the required information. Additional values are optional.</p></div></div>
            <div className="crop-input-grid">
              <div className="form-group"><label>State</label><input required value={yieldForm.state} placeholder="e.g. Karnataka" onChange={(e) => setYieldForm({ ...yieldForm, state: e.target.value })} /></div>
              <div className="form-group"><label>Crop</label><input required value={yieldForm.crop} placeholder="e.g. Rice" onChange={(e) => setYieldForm({ ...yieldForm, crop: e.target.value })} /></div>
              <div className="form-group"><label>Season</label>
                <select required value={yieldForm.season} onChange={(e) => setYieldForm({ ...yieldForm, season: e.target.value })}>
                  <option value="">Select season</option>
                  {['Kharif', 'Rabi', 'Summer', 'Whole Year', 'Autumn', 'Winter'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Area (hectares)</label><input type="number" min="0.01" step="0.01" required value={yieldForm.area} placeholder="e.g. 2.5" onChange={(e) => setYieldForm({ ...yieldForm, area: e.target.value })} /></div>
              <div className="form-group"><label>Annual Rainfall (mm) – Optional</label><input type="number" min="0" step="0.1" value={yieldForm.annual_rainfall} onChange={(e) => setYieldForm({ ...yieldForm, annual_rainfall: e.target.value })} /></div>
              <div className="form-group"><label>Fertilizer Used – Optional</label><input type="number" min="0" step="0.1" value={yieldForm.fertilizer_used} onChange={(e) => setYieldForm({ ...yieldForm, fertilizer_used: e.target.value })} /></div>
              <div className="form-group"><label>Pesticide Used – Optional</label><input type="number" min="0" step="0.1" value={yieldForm.pesticide_used} onChange={(e) => setYieldForm({ ...yieldForm, pesticide_used: e.target.value })} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => { setYieldForm(initialYieldForm); setYieldResult(null); setYieldError(''); }}>Reset</button>
              <button type="submit" className="submit-button" disabled={yieldLoading}>{yieldLoading ? 'Calculating...' : 'Predict Crop Yield →'}</button>
            </div>
          </form>

          {yieldError && <div className="error-message"><strong>Prediction failed</strong><p>{yieldError}</p></div>}
          {yieldResult && (
            <section className="result-card">
              <div className="result-header"><div><span className="eyebrow">PREDICTION COMPLETE</span><h3>Estimated Crop Yield</h3></div><span className="result-icon">📈</span></div>
              <div className="feature-grid">
                <article className="feature-card"><h3>{Number(yieldResult.predicted_yield).toFixed(2)} {yieldResult.unit}</h3><p>Predicted Yield</p></article>
                <article className="feature-card"><h3>{Number(yieldResult.total_production).toFixed(2)} {yieldResult.production_unit}</h3><p>Total Production</p></article>
              </div>
              <div className="result-detail"><h4>Crop Details</h4><p>{yieldResult.crop} · {yieldResult.state} · {yieldResult.season}</p><p>Area: {yieldResult.area}</p></div>
              <div className="result-detail"><h4>Explanation</h4><p>{yieldResult.explanation}</p></div>
              <div className="result-detail"><h4>Input Summary</h4>{renderSummary(yieldResult.input_summary)}</div>
              <div className="disclaimer"><strong>Disclaimer</strong><p>{yieldResult.disclaimer}</p></div>
              <div className="result-footer"><span>Prediction ID: {yieldResult.prediction_id ?? 'Not available'}</span><span>{new Date(yieldResult.created_at).toLocaleString()}</span></div>
            </section>
          )}
        </section>

        {/* Fertilizer Recommendation */}
        <section className="crop-section" id="fertilizer">
          <div className="section-heading">
            <span className="eyebrow">MACHINE LEARNING MODULE</span>
            <h2>🧪 Fertilizer Recommendation</h2>
            <p>Provide soil and crop information to receive a fertilizer recommendation.</p>
          </div>

          <form className="crop-form" onSubmit={handleFertilizerPrediction}>
            <div className="form-heading"><div><h3>Soil & Crop Details</h3><p>Enter all eight parameters.</p></div><span className="form-tag">8 PARAMETERS</span></div>
            <div className="crop-input-grid">
              <div className="form-group"><label>Temperature (°C)</label><input type="number" step="0.1" required value={fertilizerForm.temperature} onChange={(e) => setFertilizerForm({ ...fertilizerForm, temperature: e.target.value })} /></div>
              <div className="form-group"><label>Humidity (%)</label><input type="number" step="0.1" required value={fertilizerForm.humidity} onChange={(e) => setFertilizerForm({ ...fertilizerForm, humidity: e.target.value })} /></div>
              <div className="form-group"><label>Soil Moisture</label><input type="number" step="0.1" required value={fertilizerForm.moisture} onChange={(e) => setFertilizerForm({ ...fertilizerForm, moisture: e.target.value })} /></div>
              <div className="form-group"><label>Soil Type</label>
                <select required value={fertilizerForm.soil_type} onChange={(e) => setFertilizerForm({ ...fertilizerForm, soil_type: e.target.value })}>
                  <option value="">Select soil type</option>
                  {['Sandy', 'Loamy', 'Black', 'Red', 'Clayey'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Crop Type</label><input required placeholder="e.g. Maize" value={fertilizerForm.crop_type} onChange={(e) => setFertilizerForm({ ...fertilizerForm, crop_type: e.target.value })} /></div>
              <div className="form-group"><label>Nitrogen</label><input type="number" step="0.1" required value={fertilizerForm.nitrogen} onChange={(e) => setFertilizerForm({ ...fertilizerForm, nitrogen: e.target.value })} /></div>
              <div className="form-group"><label>Potassium</label><input type="number" step="0.1" required value={fertilizerForm.potassium} onChange={(e) => setFertilizerForm({ ...fertilizerForm, potassium: e.target.value })} /></div>
              <div className="form-group"><label>Phosphorous</label><input type="number" step="0.1" required value={fertilizerForm.phosphorous} onChange={(e) => setFertilizerForm({ ...fertilizerForm, phosphorous: e.target.value })} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={() => { setFertilizerForm(initialFertilizerForm); setFertilizerResult(null); setFertilizerError(''); }}>Reset</button>
              <button type="submit" className="submit-button" disabled={fertilizerLoading}>{fertilizerLoading ? 'Analyzing...' : 'Get Fertilizer Recommendation →'}</button>
            </div>
          </form>

          {fertilizerError && <div className="error-message"><strong>Recommendation failed</strong><p>{fertilizerError}</p></div>}
          {fertilizerResult && (
            <section className="result-card">
              <div className="result-header"><div><span className="eyebrow">RECOMMENDATION COMPLETE</span><h3>Recommended Fertilizer</h3></div><span className="result-icon">🧪</span></div>
              <div className="recommended-crop"><span>Recommended fertilizer</span><h2>{fertilizerResult.recommended_fertilizer}</h2></div>
              <div className="result-detail"><h4>Crop and Soil</h4><p>{fertilizerResult.crop_type} · {fertilizerResult.soil_type}</p></div>
              <div className="result-detail"><h4>Nutrient Analysis</h4>{renderSummary(fertilizerResult.nutrient_analysis)}</div>
              <div className="result-detail"><h4>Guidance</h4><p>{fertilizerResult.guidance}</p></div>
              <div className="result-detail"><h4>Precautions</h4><ul className="tips-list">{fertilizerResult.precautions?.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
              <div className="result-detail"><h4>Input Summary</h4>{renderSummary(fertilizerResult.input_summary)}</div>
              <div className="disclaimer"><strong>Disclaimer</strong><p>{fertilizerResult.disclaimer}</p></div>
              <div className="result-footer"><span>Prediction ID: {fertilizerResult.prediction_id ?? 'Not available'}</span><span>{new Date(fertilizerResult.created_at).toLocaleString()}</span></div>
            </section>
          )}
        </section>

        {/* Prediction History */}
        <section className="crop-section" id="history">
          <div className="section-heading">
            <span className="eyebrow">YOUR RECORDS</span>
            <h2>📋 Prediction History</h2>
            <p>Search, filter and review your previous predictions.</p>
          </div>

          <div className="crop-form">
            <div className="crop-input-grid">
              <div className="form-group"><label>Search History</label>
                <input value={historySearch} placeholder="Search your predictions..."
                  onChange={(e) => setHistorySearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void loadHistory(); } }} />
              </div>
              <div className="form-group"><label>Prediction Type</label>
                <select value={historyType} onChange={(e) => setHistoryType(e.target.value)}>
                  <option value="">All predictions</option>
                  <option value="crop">Crop</option>
                  <option value="yield">Yield</option>
                  <option value="fertilizer">Fertilizer</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="secondary-button" onClick={() => { setHistorySearch(''); setHistoryType(''); }}>
                Clear Filters
              </button>
              <button className="submit-button" onClick={() => void loadHistory()}>Search / Refresh</button>
            </div>
          </div>

          <p className="section-heading">Total records: {historyTotal}</p>
          {historyError && <div className="error-message">{historyError}</div>}
          {historyLoading && <div className="status-message">Loading prediction history...</div>}

          {!historyLoading && history.length === 0 && (
            <div className="result-card"><p>No prediction records found.</p></div>
          )}

          {history.map((item) => (
            <article className="feature-card" key={item.id} style={{ marginBottom: 14 }}>
              <div className="result-header">
                <div><span className="eyebrow">{formatLabel(item.prediction_type)}</span>
                  <h3>Prediction #{item.id}</h3>
                  <p>{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <button className="secondary-button" onClick={() => void openHistoryDetail(item)}>View Details</button>
              </div>
            </article>
          ))}

          {selectedHistory && (
            <section className="result-card">
              <div className="result-header">
                <div><span className="eyebrow">HISTORY DETAIL</span><h3>Prediction #{selectedHistory.id}</h3></div>
                <button className="secondary-button" onClick={() => setSelectedHistory(null)}>Close</button>
              </div>
              <p><strong>Type:</strong> {formatLabel(selectedHistory.prediction_type)}</p>
              <p><strong>Date:</strong> {new Date(selectedHistory.created_at).toLocaleString()}</p>
              <p><strong>Model version:</strong> {selectedHistory.model_version}</p>
              <div className="result-detail"><h4>Input Data</h4>{renderSummary(selectedHistory.input_data)}</div>
              <div className="result-detail"><h4>Output Data</h4>{renderSummary(selectedHistory.output_data)}</div>
              <button className="secondary-button" onClick={() => void handleDeleteHistory(selectedHistory.id)}>Delete This Record</button>
            </section>
          )}
        </section>

        <section className="info-section">
          <div><span className="eyebrow">WHY AGRISENSE AI?</span><h2>Technology supporting agriculture</h2>
            <p>Our platform brings machine learning and agricultural decision support together in one place.</p></div>
          <div className="info-points">
            <div>✓ Data-driven recommendations</div>
            <div>✓ Machine learning predictions</div>
            <div>✓ Centralized prediction history</div>
          </div>
        </section>

        <footer className="footer">
          AgriSense AI — Intelligent Agricultural Prediction and Decision Support System
        </footer>
      </main>
    </div>
  );
}

export default App;
