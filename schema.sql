-- =======================================================
-- AgriSense AI: PostgreSQL Database Schema
-- Compatible with PostgreSQL 13+ and Supabase PostgreSQL
-- =======================================================

-- Enable UUID extension if UUIDs are used (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index on email for fast lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Prediction History Table
CREATE TABLE IF NOT EXISTS prediction_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- 'crop', 'yield', 'fertilizer'
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    model_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for efficient user-isolated queries and filtering
CREATE INDEX IF NOT EXISTS idx_prediction_history_user_id ON prediction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_history_user_created ON prediction_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_history_type ON prediction_history(prediction_type);
CREATE INDEX IF NOT EXISTS idx_prediction_history_jsonb_input ON prediction_history USING GIN (input_data);
CREATE INDEX IF NOT EXISTS idx_prediction_history_jsonb_output ON prediction_history USING GIN (output_data);

-- =======================================================
-- Row Level Security (RLS) setup for Supabase (Optional)
-- =======================================================
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
