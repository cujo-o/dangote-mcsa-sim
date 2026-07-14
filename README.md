```markdown
# 🏭 DCP Motor Sentinel

**An Advanced Predictive Maintenance & MCSA Telemetry Dashboard** *Built for the Dangote Cement Plc (DCP) University Engineering Challenge*

![DCP Motor Sentinel](https://img.shields.io/badge/Status-Active_Simulation-emerald)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Litegrad](https://img.shields.io/badge/ML_Engine-Litegrad-blueviolet)

---

## 📋 Overview

The **DCP Motor Sentinel** is a live, SCADA-style web application designed to simulate and visualize **Motor Current Signature Analysis (MCSA)** for heavy industrial drives in cement manufacturing (e.g., Vertical Roller Mills, Rotary Kilns). 

Instead of relying on fragile physical sensors mounted to vibrating, dust-covered machinery, this system tracks microscopic anomalies in the electrical current drawn from the Motor Control Center (MCC). This project acts as the digital twin/simulation proof-of-concept for **Challenge 2: Predictive Maintenance and Reliability Early-Warning System**.

## ✨ Core Features

* **📡 Live Streaming Telemetry:** A rolling time-domain oscilloscope visualizing stator current, fully animated and responsive to load changes.
* **📊 Real-Time MCSA Spectrum Analyzer:** A fast Fourier transform (FFT) visualizer (0-100Hz) built using an optimized Goertzel algorithm. It accurately tracks decibel (dB) spikes at specific fault frequencies (e.g., 48Hz/52Hz for Broken Rotor Bars).
* **🧠 AI Predictive Forecasting:** Utilizes a custom neural network layer (`litegrad`) to calculate a dynamic **Asset Health Index (AHI)** and project a 60-day Remaining Useful Life (RUL) trendline.
* **🎛️ Interactive Scenario Testing:** Judges and engineers can scrub through a 60-day degradation timeline and adjust the motor load (50%-100%) to see how mechanical faults reveal themselves under heavy strain.
* **💬 Natural Language Diagnostics:** The system automatically translates complex frequency math into plain English insights (e.g., *"Noticeable magnetic asymmetry... Rotor bars are yielding"*).

## 🛠️ Tech Stack

### Frontend Architecture
* **Framework:** [Next.js](https://nextjs.org/) (React)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a responsive, high-contrast industrial UI.
* **Data Visualization:** [Recharts](https://recharts.org/) for highly performant, streaming SVG charts.
* **Icons:** Lucide React.

### Physics & ML Engine (`/lib/engine.js`)
* **Signal Processing:** Custom implementation of the Goertzel algorithm for $O(N)$ single-frequency magnitude extraction, avoiding heavy FFT library dependencies.
* **Machine Learning:** Powered by `litegrad` (a lightweight autograd/tensor library) to compute non-linear degradation weights and the final Asset Health Index (AHI).

---

## 🚀 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_GITHUB_USERNAME/dangote-mcsa-sim.git](https://github.com/YOUR_GITHUB_USERNAME/dangote-mcsa-sim.git)
   cd dangote-mcsa-sim

```

2. **Install dependencies:**
```bash
npm install

```


3. **Run the development server:**
```bash
npm run dev

```


4. **View the dashboard:**
Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```text
├── app/
│   ├── layout.tsx        # Next.js root layout
│   ├── page.tsx          # Main SCADA Dashboard UI (React Component)
│   └── globals.css       # Tailwind directives
├── lib/
│   └── engine.js         # Core Physics, Signal Processing, and Litegrad ML Engine
├── public/               # Static assets
├── package.json          # Project dependencies
├── tailwind.config.js    # Tailwind theme configuration
└── README.md             # This document

```

---

## 📐 Engineering Assumptions & Physics

This simulation accurately models real-world induction motor physics based on the following rules:

1. **Grid Supply:** A stable 50Hz fundamental carrier frequency.
2. **Exponential Degradation:** Mechanical faults (Broken Rotor Bars, Eccentricity, Bearing Spalling) do not degrade linearly. The simulation uses a steepened exponential curve (`time^2.5`) to mimic how structural failure accelerates near the end of a component's lifecycle.
3. **Load Dependency:** Fault signatures are notoriously difficult to detect when a motor is running unloaded. Increasing the **Motor Load %** slider in the UI amplifies the signal-to-noise ratio of the sidebands, accurately reflecting real-world stator current behavior.

---

## 🤝 Team / Submitting Entity

**[Your Team Name / ULES ARB Submission]**

* *Lead Systems Architect / Engineer:* Ibrahim Abubakar Opeyemi
* *Target:* Dangote Cement Plc (DCP) Engineering Challenge 2026

*Built for robust, zero-downtime industrial reliability.*

```

```
