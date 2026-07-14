// lib/engine.js
const litegrad = require('litegrad');

const Tensor = typeof litegrad.Tensor === 'function' 
    ? litegrad.Tensor 
    : (litegrad.default?.Tensor || litegrad.default || litegrad);

const FS = 50; 
const SAMPLING_FREQ = 1000; 
const DURATION = 1; 
const N = SAMPLING_FREQ * DURATION; 

function getMagnitudeAtFrequency(signal, targetFreq) {
    const k = Math.floor(0.5 + (N * targetFreq) / SAMPLING_FREQ);
    const omega = (2 * Math.PI * k) / N;
    const cosine = Math.cos(omega);
    const sine = Math.sin(omega);
    const coeff = 2 * cosine;
    
    let q0 = 0, q1 = 0, q2 = 0;
    for (let i = 0; i < signal.length; i++) {
        q0 = coeff * q1 - q2 + signal[i];
        q2 = q1;
        q1 = q0;
    }
    const real = q1 - q2 * cosine;
    const imag = q2 * sine;
    return Math.sqrt(real * real + imag * imag) / (N / 2);
}

export function runLiveSimulation(day, loadPercent, phaseOffset = 0) {
    // FIX: Steepened the exponential curve so degradation accelerates much faster at the end
    const wear = Math.pow(day / 60, 2.5); 
    const loadFactor = loadPercent / 100;

    const carrierAmp = 10.0 * loadFactor;
    const brbAmp = (0.005 + wear * 1.5) * loadFactor;       
    const bearingAmp = (0.002 + Math.pow(wear, 1.5) * 1.0) * loadFactor; 
    const eccAmp = (0.001 + wear * 0.6) * loadFactor;       
    
    const signal = [];
    const waveformData = [];

    // 1. GENERATE CONTINUOUS STREAMING SIGNAL
    for(let t = 0; t < N; t++) {
        const time = (t / SAMPLING_FREQ) + phaseOffset; 
        
        let val = carrierAmp * Math.sin(2 * Math.PI * FS * time); 
        
        val += brbAmp * Math.sin(2 * Math.PI * 48 * time); 
        val += brbAmp * Math.sin(2 * Math.PI * 52 * time); 
        val += bearingAmp * Math.sin(2 * Math.PI * 35 * time); 
        val += eccAmp * Math.sin(2 * Math.PI * 25 * time);
        
        val += (Math.random() - 0.5) * (0.15 + wear * 2.5);

        signal.push(val);
        
        if (t < 120) {
            waveformData.push({ 
                timeLabel: `+${t}ms`, 
                current: val 
            });
        }
    }

    // 2. LIVE FFT SPECTRUM
    const spectrumData = [];
    for(let f = 0; f <= 100; f += 1) {
        let mag = getMagnitudeAtFrequency(signal, f);
        let db = 20 * Math.log10(Math.max(mag, 0.0001) / 10);
        spectrumData.push({ frequency: f, magnitude_dB: Math.max(db, -80) });
    }

    // 3. AHI CALCULATION
    let ahi = 100;
    try {
        // FIX: Massively increased the penalty weights so the AHI actually drops to near 0 at Day 60
        const score = 100 - ((brbAmp/loadFactor) * 30 + (bearingAmp/loadFactor) * 45 + (eccAmp/loadFactor) * 20);
        ahi = Math.max(0, Math.min(100, score));
    } catch(err) {
        ahi = Math.max(0, 100 - (wear * 100));
    }

    // 4. DYNAMIC INSIGHTS
    let stage = 1;
    let insight = "The motor is operating optimally. The 50Hz carrier wave is dominant with a clean noise floor. No mechanical anomalies detected in the live stream.";
    let activeFault = "None";

    if (ahi < 85 && ahi >= 70) {
        stage = 2;
        insight = "Early wear detected. Notice the slight live fluctuation in the noise floor. Safe to continue operation, but schedule a visual inspection.";
        activeFault = "Micro-Cracking / Early Wear";
    } else if (ahi < 70 && ahi >= 50) {
        stage = 3;
        insight = "Noticeable magnetic asymmetry. The 48Hz and 52Hz sidebands are separating from the carrier wave in real-time. Rotor bars are yielding.";
        activeFault = "Rotor Bar Yielding";
    } else if (ahi < 50 && ahi >= 25) {
        stage = 4;
        insight = "CRITICAL: Sideband attenuation breached safe thresholds. High probability of bearing race spalling. Plan downtime immediately.";
        activeFault = "Bearing Spall & Asymmetry";
    } else if (ahi < 25) {
        stage = 5; // FIX: This will now trigger perfectly as the AHI crashes below 25
        insight = "FAILURE IMMINENT. The motor is operating in a highly destructive state. Thermal and vibrational overload is peaking.";
        activeFault = "Catastrophic Structural Failure";
    }

    // 5. TREND FORECASTING
    const trendData = [];
    for (let d = 0; d <= 60; d += 2) {
        // Sync the forecast curve with the new 2.5 exponent
        const futureWear = Math.pow(d / 60, 2.5);
        const futureAhi = Math.max(0, 100 - (futureWear * 100));
        trendData.push({
            day: d,
            actual: d <= day ? futureAhi : null,
            predicted: d >= day ? futureAhi : null
        });
    }

    return {
        waveformData, spectrumData, trendData,
        ahiScore: ahi.toFixed(1),
        stage, insight, activeFault,
        status: ahi > 70 ? 'HEALTHY' : (ahi > 40 ? 'WARNING' : 'CRITICAL')
    };
}