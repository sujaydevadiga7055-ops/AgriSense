import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, ServerOff, Terminal } from 'lucide-react';
import { api } from '../../services/api';
import { BackendHealthResponse } from '../../types/dashboard';

export const BackendStatusAlert: React.FC = () => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.checkHealth();
      setHealth(res);
    } catch {
      setHealth({
        status: 'offline',
        app_name: 'AgriSense AI',
        version: '1.0.0',
        database: 'disconnected',
        models: {
          crop_recommendation: { available: false, file: 'crop_model.joblib' },
          yield_prediction: { available: false, file: 'yield_model.joblib' },
          fertilizer_recommendation: { available: false, file: 'fertilizer_model.joblib' },
        },
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isChecking && !health) {
    return null;
  }

  // If everything is healthy, display a clean mini-pill or nothing
  const isAllHealthy =
    health?.status === 'healthy' &&
    health?.models?.crop_recommendation?.available &&
    health?.models?.yield_prediction?.available &&
    health?.models?.fertilizer_recommendation?.available;

  if (isAllHealthy) {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        FastAPI ML Engine Connected (3 Models Active)
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 shadow-xs text-amber-950 mb-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
            {health?.status === 'offline' ? (
              <ServerOff className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 text-sm">
              {health?.status === 'offline'
                ? 'FastAPI Backend Server Offline'
                : 'Backend Service Degraded or Model Pending'}
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {health?.status === 'offline'
                ? 'The web client cannot reach the AgriSense FastAPI server at http://localhost:8000.'
                : 'Some ML prediction model artifacts are currently pending or uninitialized.'}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline hover:text-amber-950 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                {showInstructions ? 'Hide Setup Command' : 'View Quick Setup Command'}
              </button>
              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="inline-flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 ml-3 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="mt-3 pt-3 border-t border-amber-200/80 text-xs font-mono bg-amber-950 text-amber-100 p-3 rounded-lg overflow-x-auto">
          <p className="text-amber-300 mb-1 font-sans font-medium">To start the FastAPI backend server:</p>
          <code>cd backend</code>
          <br />
          <code>.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000</code>
        </div>
      )}
    </div>
  );
};
