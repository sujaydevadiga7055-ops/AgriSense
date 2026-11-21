"""
AgriSense AI - Model Training and Artifact Generation
Trains real machine learning models for:
1. Crop Recommendation (Multi-class Classification)
2. Crop Yield Prediction (Regression)
3. Fertilizer Recommendation (Multi-class Classification)
Saves artifacts (.joblib) and rich metadata in backend/ml/artifacts/
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import joblib

ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# ---------------------------------------------------------
# 1. CROP RECOMMENDATION MODEL
# ---------------------------------------------------------
print("Training Crop Recommendation Model...")

# Agronomic reference distributions (N, P, K, temp, humidity, ph, rainfall) for 22 crops
crop_profiles = {
    'rice':        {'N': (60, 100),  'P': (35, 60),  'K': (35, 45),  'temp': (20, 27), 'hum': (80, 85), 'ph': (5.0, 6.8), 'rain': (180, 290)},
    'maize':       {'N': (60, 100),  'P': (35, 60),  'K': (15, 25),  'temp': (18, 27), 'hum': (55, 75), 'ph': (5.5, 7.0), 'rain': (60, 110)},
    'chickpea':    {'N': (20, 60),   'P': (55, 80),  'K': (75, 85),  'temp': (17, 21), 'hum': (14, 20), 'ph': (6.0, 8.5), 'rain': (65, 95)},
    'kidneybeans': {'N': (15, 40),   'P': (55, 80),  'K': (15, 25),  'temp': (15, 24), 'hum': (18, 25), 'ph': (5.5, 6.0), 'rain': (60, 150)},
    'pigeonpeas':  {'N': (15, 40),   'P': (55, 80),  'K': (15, 25),  'temp': (27, 38), 'hum': (30, 65), 'ph': (5.0, 7.5), 'rain': (90, 195)},
    'mothbeans':   {'N': (15, 40),   'P': (35, 60),  'K': (15, 25),  'temp': (24, 32), 'hum': (40, 65), 'ph': (3.5, 9.9), 'rain': (30, 75)},
    'mungbean':    {'N': (15, 40),   'P': (35, 60),  'K': (15, 25),  'temp': (27, 29), 'hum': (80, 90), 'ph': (6.2, 7.2), 'rain': (35, 60)},
    'blackgram':   {'N': (30, 60),   'P': (55, 80),  'K': (15, 25),  'temp': (25, 35), 'hum': (60, 70), 'ph': (6.5, 7.5), 'rain': (60, 75)},
    'lentil':      {'N': (15, 40),   'P': (55, 80),  'K': (15, 25),  'temp': (18, 30), 'hum': (60, 70), 'ph': (6.5, 7.5), 'rain': (35, 55)},
    'pomegranate': {'N': (15, 40),   'P': (10, 30),  'K': (35, 45),  'temp': (18, 25), 'hum': (85, 95), 'ph': (5.5, 7.2), 'rain': (100, 115)},
    'banana':      {'N': (80, 120),  'P': (70, 95),  'K': (45, 55),  'temp': (25, 30), 'hum': (75, 85), 'ph': (5.5, 6.5), 'rain': (90, 120)},
    'mango':       {'N': (15, 40),   'P': (15, 35),  'K': (25, 35),  'temp': (27, 36), 'hum': (45, 55), 'ph': (4.5, 7.0), 'rain': (85, 105)},
    'grapes':      {'N': (15, 40),   'P': (120, 145),'K': (195, 205),'temp': (8, 42),   'hum': (80, 85), 'ph': (5.5, 6.5), 'rain': (65, 75)},
    'watermelon':  {'N': (80, 120),  'P': (5, 30),   'K': (45, 55),  'temp': (24, 27), 'hum': (80, 90), 'ph': (6.0, 7.0), 'rain': (40, 60)},
    'muskmelon':   {'N': (80, 120),  'P': (5, 30),   'K': (45, 55),  'temp': (27, 30), 'hum': (90, 95), 'ph': (6.0, 6.8), 'rain': (20, 30)},
    'apple':       {'N': (15, 40),   'P': (120, 145),'K': (195, 205),'temp': (21, 24), 'hum': (90, 95), 'ph': (5.5, 6.5), 'rain': (100, 125)},
    'orange':      {'N': (15, 40),   'P': (5, 30),   'K': (5, 15),   'temp': (10, 35), 'hum': (90, 95), 'ph': (6.0, 7.5), 'rain': (100, 120)},
    'papaya':      {'N': (30, 70),   'P': (45, 70),  'K': (45, 55),  'temp': (30, 44), 'hum': (90, 95), 'ph': (6.5, 7.0), 'rain': (140, 250)},
    'coconut':     {'N': (15, 40),   'P': (5, 30),   'K': (25, 35),  'temp': (25, 29), 'hum': (90, 99), 'ph': (5.5, 6.5), 'rain': (130, 225)},
    'cotton':      {'N': (100, 140), 'P': (35, 60),  'K': (15, 25),  'temp': (22, 26), 'hum': (75, 85), 'ph': (6.0, 8.0), 'rain': (60, 100)},
    'jute':        {'N': (60, 100),  'P': (35, 60),  'K': (35, 45),  'temp': (23, 26), 'hum': (70, 90), 'ph': (6.0, 7.5), 'rain': (150, 200)},
    'coffee':      {'N': (80, 120),  'P': (15, 40),  'K': (25, 35),  'temp': (23, 28), 'hum': (50, 70), 'ph': (6.0, 7.5), 'rain': (115, 200)}
}

np.random.seed(42)
rows = []
for crop, bounds in crop_profiles.items():
    for _ in range(120):  # 120 samples per crop = 2,640 samples
        n = np.random.uniform(bounds['N'][0], bounds['N'][1])
        p = np.random.uniform(bounds['P'][0], bounds['P'][1])
        k = np.random.uniform(bounds['K'][0], bounds['K'][1])
        t = np.random.uniform(bounds['temp'][0], bounds['temp'][1])
        h = np.random.uniform(bounds['hum'][0], bounds['hum'][1])
        ph = np.random.uniform(bounds['ph'][0], bounds['ph'][1])
        rain = np.random.uniform(bounds['rain'][0], bounds['rain'][1])
        rows.append({
            'N': round(n, 2),
            'P': round(p, 2),
            'K': round(k, 2),
            'temperature': round(t, 2),
            'humidity': round(h, 2),
            'ph': round(ph, 2),
            'rainfall': round(rain, 2),
            'label': crop
        })

crop_df = pd.DataFrame(rows)
X_crop = crop_df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y_crop = crop_df['label']

crop_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('rf', RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42))
])
crop_pipeline.fit(X_crop, y_crop)

crop_model_path = os.path.join(ARTIFACTS_DIR, "crop_model.joblib")
joblib.dump(crop_pipeline, crop_model_path)
print(f"Saved crop model to {crop_model_path}")


# ---------------------------------------------------------
# 2. CROP YIELD PREDICTION MODEL
# ---------------------------------------------------------
print("Training Crop Yield Prediction Model...")

states = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 
          'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Gujarat', 'West Bengal', 'Bihar', 'Rajasthan']
crops = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Pulses', 'Groundnut', 'Soybean', 'Barley', 'Millets']
seasons = ['Kharif', 'Rabi', 'Whole Year', 'Summer', 'Autumn', 'Winter']

# Base yield expectations in metric tons per hectare
base_yield = {
    'Rice': 3.8,
    'Wheat': 3.6,
    'Maize': 3.4,
    'Cotton': 1.8,
    'Sugarcane': 70.0,
    'Pulses': 0.9,
    'Groundnut': 1.6,
    'Soybean': 1.5,
    'Barley': 2.7,
    'Millets': 1.2
}

yield_rows = []
for _ in range(3000):
    st = np.random.choice(states)
    cr = np.random.choice(crops)
    se = np.random.choice(seasons)
    area = np.random.uniform(1.0, 500.0)
    rain = np.random.uniform(400.0, 2200.0)
    fert = np.random.uniform(40.0, 320.0)
    pest = np.random.uniform(0.2, 4.5)
    
    # State fertility factor
    st_factor = 1.2 if st in ['Punjab', 'Haryana'] else (1.1 if st in ['Uttar Pradesh', 'Tamil Nadu', 'Andhra Pradesh'] else 0.95)
    # Rainfall effect
    rain_effect = 1.0 + (min(rain, 1500) - 800) / 3000.0
    # Fertilizer effect with diminishing returns
    fert_effect = 1.0 + np.log1p(fert / 50.0) * 0.15
    # Noise
    noise = np.random.normal(0, 0.05)
    
    y_rate = base_yield[cr] * st_factor * rain_effect * fert_effect * (1.0 + noise)
    y_rate = max(0.2, round(y_rate, 2))
    
    yield_rows.append({
        'state': st,
        'crop': cr,
        'season': se,
        'area': round(area, 2),
        'annual_rainfall': round(rain, 2),
        'fertilizer_used': round(fert, 2),
        'pesticide_used': round(pest, 2),
        'yield': y_rate
    })

yield_df = pd.DataFrame(yield_rows)
X_yield = yield_df[['state', 'crop', 'season', 'area', 'annual_rainfall', 'fertilizer_used', 'pesticide_used']]
y_yield = yield_df['yield']

cat_features = ['state', 'crop', 'season']
num_features = ['area', 'annual_rainfall', 'fertilizer_used', 'pesticide_used']

yield_preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), num_features),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_features)
    ]
)

yield_pipeline = Pipeline([
    ('preprocessor', yield_preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42))
])
yield_pipeline.fit(X_yield, y_yield)

yield_model_path = os.path.join(ARTIFACTS_DIR, "yield_model.joblib")
joblib.dump(yield_pipeline, yield_model_path)
print(f"Saved yield model to {yield_model_path}")


# ---------------------------------------------------------
# 3. FERTILIZER RECOMMENDATION MODEL
# ---------------------------------------------------------
print("Training Fertilizer Recommendation Model...")

soil_types = ['Black', 'Clayey', 'Loamy', 'Red', 'Sandy']
crop_types = ['Barley', 'Cotton', 'Ground Nuts', 'Maize', 'Millets', 'Oil seeds', 'Paddy', 'Pulses', 'Sugarcane', 'Tobacco', 'Wheat']
fertilizers = ['Urea', 'DAP', '14-35-14', '28-28', '17-17-17', '20-20', '10-26-26']

# Fertilizer rules based on nutrient deficiencies:
# Urea: High Nitrogen deficit (N low, P/K adequate)
# DAP: High Phosphorus deficit (P low, N moderate)
# 10-26-26: High Potassium deficit (K low, P moderate)
# 14-35-14: Balanced with P priority
# 28-28: High Nitrogen and Phosphorus
# 17-17-17: Balanced N-P-K requirement
# 20-20: Moderate balanced deficit

fert_rows = []
for _ in range(2500):
    st = np.random.choice(soil_types)
    cr = np.random.choice(crop_types)
    temp = np.random.uniform(15.0, 42.0)
    hum = np.random.uniform(30.0, 90.0)
    moist = np.random.uniform(20.0, 75.0)
    
    n = np.random.uniform(5.0, 50.0)
    k = np.random.uniform(0.0, 35.0)
    p = np.random.uniform(5.0, 45.0)
    
    # Assign target fertilizer based on nutrient balance
    if n < 15 and p > 20 and k > 15:
        target_fert = 'Urea'
    elif p < 15 and n > 20:
        target_fert = 'DAP'
    elif k < 10 and p > 20:
        target_fert = '10-26-26'
    elif p < 18 and n < 18 and k > 15:
        target_fert = '28-28'
    elif p < 15 and k < 15:
        target_fert = '14-35-14'
    elif abs(n - p) < 5 and abs(p - k) < 5:
        target_fert = '17-17-17'
    else:
        target_fert = '20-20'
        
    fert_rows.append({
        'Temperature': round(temp, 2),
        'Humidity': round(hum, 2),
        'Moisture': round(moist, 2),
        'Soil_Type': st,
        'Crop_Type': cr,
        'Nitrogen': round(n, 2),
        'Potassium': round(k, 2),
        'Phosphorous': round(p, 2),
        'Fertilizer': target_fert
    })

fert_df = pd.DataFrame(fert_rows)
X_fert = fert_df[['Temperature', 'Humidity', 'Moisture', 'Soil_Type', 'Crop_Type', 'Nitrogen', 'Potassium', 'Phosphorous']]
y_fert = fert_df['Fertilizer']

fert_cat = ['Soil_Type', 'Crop_Type']
fert_num = ['Temperature', 'Humidity', 'Moisture', 'Nitrogen', 'Potassium', 'Phosphorous']

fert_preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), fert_num),
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), fert_cat)
    ]
)

fert_pipeline = Pipeline([
    ('preprocessor', fert_preprocessor),
    ('rf', RandomForestClassifier(n_estimators=100, max_depth=16, random_state=42))
])
fert_pipeline.fit(X_fert, y_fert)

fert_model_path = os.path.join(ARTIFACTS_DIR, "fertilizer_model.joblib")
joblib.dump(fert_pipeline, fert_model_path)
print(f"Saved fertilizer model to {fert_model_path}")


# ---------------------------------------------------------
# 4. SAVE MODEL METADATA & AGRONOMIC GUIDANCE DICTIONARY
# ---------------------------------------------------------
metadata = {
    "crop_model": {
        "version": "1.0.0",
        "algorithm": "RandomForestClassifier",
        "features": ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'],
        "classes": sorted(list(crop_profiles.keys())),
        "input_ranges": {
            "N": {"min": 0, "max": 140, "unit": "mg/kg", "label": "Nitrogen ratio"},
            "P": {"min": 5, "max": 145, "unit": "mg/kg", "label": "Phosphorus ratio"},
            "K": {"min": 5, "max": 205, "unit": "mg/kg", "label": "Potassium ratio"},
            "temperature": {"min": 8.0, "max": 45.0, "unit": "°C", "label": "Temperature"},
            "humidity": {"min": 14.0, "max": 100.0, "unit": "%", "label": "Humidity"},
            "ph": {"min": 3.5, "max": 9.9, "unit": "pH scale (0-14)", "label": "Soil pH"},
            "rainfall": {"min": 20.0, "max": 300.0, "unit": "mm", "label": "Rainfall"}
        }
    },
    "yield_model": {
        "version": "1.0.0",
        "algorithm": "RandomForestRegressor with OneHotEncoding",
        "supported_states": states,
        "supported_crops": crops,
        "supported_seasons": seasons,
        "numeric_features": num_features,
        "unit": "Metric Tons / Hectare (t/ha)"
    },
    "fertilizer_model": {
        "version": "1.0.0",
        "algorithm": "RandomForestClassifier with OneHotEncoding",
        "supported_soils": soil_types,
        "supported_crops": crop_types,
        "fertilizer_categories": fertilizers,
        "dataset_note": "Dataset contains controlled agronomic samples. Always verify recommendations with a physical soil test."
    }
}

metadata_path = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
with open(metadata_path, 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2)

print(f"Saved metadata to {metadata_path}")
print("All ML models trained and saved successfully!")
