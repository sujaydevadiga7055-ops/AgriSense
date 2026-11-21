import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  Sprout,
  TrendingUp,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  Cpu,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Database,
  Layers,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Badge variant="emerald" size="md">
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                AgriSense AI 2.0 • Precision Agriculture
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight leading-[1.12]">
                Empowering Agriculture with{' '}
                <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
                  Artificial Intelligence
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Make smarter farming decisions with intelligent crop recommendations, yield
                predictions, and fertilizer guidance.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link to={isAuthenticated ? '/app/dashboard' : '/register'} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    className="w-full sm:w-auto text-base px-8 py-3.5 shadow-md shadow-emerald-700/20"
                  >
                    {isAuthenticated ? 'Open Farmer Dashboard' : 'Get Started Free'}
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
                    Explore Features
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3 Multi-variable ML Models</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Soil & Climate Inference</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Isolated Farmer Prediction Records</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none bg-gradient-to-tr from-emerald-800 to-green-900 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden border border-emerald-700/50">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-emerald-700/60 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-600/40 rounded-lg">
                      <Cpu className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Live Decision Hub</h4>
                      <p className="text-[11px] text-emerald-200">Active ML Engine v1.0.0</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm" className="bg-emerald-900 text-emerald-200 border-emerald-600">
                    Online
                  </Badge>
                </div>

                {/* Simulated Visual Cards */}
                <div className="space-y-3.5">
                  <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-700/60 rounded-lg text-emerald-200">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-100">Crop Analysis</p>
                        <p className="text-[11px] text-emerald-300">N:80 | P:45 | K:40 | pH:6.5</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded">
                      Rice (Optimal)
                    </span>
                  </div>

                  <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-700/60 rounded-lg text-emerald-200">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-100">Yield Forecast</p>
                        <p className="text-[11px] text-emerald-300">Punjab • 15 Hectares</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded">
                      4.99 t/ha
                    </span>
                  </div>

                  <div className="bg-emerald-950/60 border border-emerald-700/40 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-700/60 rounded-lg text-emerald-200">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-100">Fertilizer Guidance</p>
                        <p className="text-[11px] text-emerald-300">Loamy Soil • Wheat</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-200 bg-emerald-800/80 px-2 py-0.5 rounded">
                      Urea (High N)
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-700/50 flex items-center justify-between text-xs text-emerald-200">
                  <span>FastAPI Inference Time</span>
                  <span className="font-mono text-emerald-100 font-bold">~18ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="emerald">Intelligent Modules</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
              Three Specialized Machine Learning Decision Modules
            </h2>
            <p className="text-slate-600 text-base">
              Every tool is engineered around real agronomic relationships, providing verified guidance
              and transparent explanations tailored to local farmland conditions.
            </p>
          </div>

          <div id="modules" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <Card hoverEffect={true} className="flex flex-col justify-between border-slate-200">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-2">
                  Intelligent Crop Recommendation
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Analyzes 7 soil and atmospheric dimensions—Nitrogen, Phosphorus, Potassium,
                  Temperature, Humidity, Soil pH, and Rainfall—to pinpoint the highest-yielding crop.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    22 Supported Cereal, Pulse, & Cash Crops
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Practical Agronomic Sowing & Soil Tips
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Model Confidence Scores & Explanation
                  </li>
                </ul>
              </div>
              <Link to="/app/crop-recommendation">
                <Button variant="outline" size="sm" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Explore Crop Module
                </Button>
              </Link>
            </Card>

            {/* Feature Card 2 */}
            <Card hoverEffect={true} className="flex flex-col justify-between border-slate-200">
              <div>
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-800 flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-2">
                  Crop Yield Prediction
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Forecasts expected agricultural harvest per hectare and total farm tonnage based on
                  region, season, cultivated area, rainfall trends, and agro-chemical usage.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Yield Rates in Metric Tons per Hectare
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Total Production Volume Computation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Seasonal Patterns across Major States
                  </li>
                </ul>
              </div>
              <Link to="/app/yield-prediction">
                <Button variant="outline" size="sm" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Explore Yield Module
                </Button>
              </Link>
            </Card>

            {/* Feature Card 3 */}
            <Card hoverEffect={true} className="flex flex-col justify-between border-slate-200">
              <div>
                <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center mb-5">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-emerald-950 mb-2">
                  Fertilizer Recommendation
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Evaluates soil type, crop requirements, and nutrient levels to prescribe the optimal
                  fertilizer category (Urea, DAP, 10-26-26, 28-28, etc.) with dosage safety precautions.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 mb-6 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Nutrient Deficit & Surplus Breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Basal vs. Top-Dressing Application Timing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Laboratory Soil Health Test Disclaimers
                  </li>
                </ul>
              </div>
              <Link to="/app/fertilizer-recommendation">
                <Button variant="outline" size="sm" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Explore Fertilizer Module
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="emerald">Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
              How AgriSense AI Works in 3 Simple Steps
            </h2>
            <p className="text-slate-600 text-base">
              Designed to be intuitive and accessible to ordinary farmers without requiring any technical background.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                Enter Agricultural Information
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Provide readily available soil parameters (such as NPK or moisture), crop type, region,
                or weather readings into the accessible form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                AI Analyses Submitted Information
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Trained machine learning models cross-reference verified multi-variable agricultural
                benchmarks within milliseconds via the FastAPI backend.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-lg mb-6 shadow-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-emerald-950 mb-2">
                Receive Prediction & Useful Guidance
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                View your recommendation, yield estimate, or fertilizer prescription alongside practical
                agronomic guidance and safe storage in your private history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="emerald">About AgriSense AI</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
                Supporting Data-Driven Agricultural Decision-Making
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Agriculture is increasingly challenged by climate variability, soil nutrient depletion,
                and unpredictable seasonal rainfall. Traditional guesswork often leads to suboptimal crop
                selection, chemical overuse, and lower profits for farm families.
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                AgriSense AI was architected to bridge modern artificial intelligence and day-to-day
                farming realities. By synthesizing historical agro-climatic patterns with machine
                learning classifiers and regressors, we provide transparent, actionable decision-support
                tools that ordinary farmers can easily understand and utilize.
              </p>
              <div className="pt-2">
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Create Your Farmer Account
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6">
              <h4 className="text-lg font-bold text-emerald-950">Technical & Scientific Integrity</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 text-sm">Real ML Inference</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      No hardcoded random outcomes. Models are pre-trained on agricultural datasets and executed through a secured FastAPI server.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 text-sm">User Data Isolation</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Farmer prediction history is strictly isolated in PostgreSQL by user credentials, ensuring complete privacy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 mt-0.5">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 text-sm">Transparent Estimates</h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Predictions are explicitly framed as decision-support statistical estimates, prompting farmers to verify critical choices with soil health tests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
