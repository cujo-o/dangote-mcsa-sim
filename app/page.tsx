"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, Zap, Info, Clock, Gauge, Pause, Play, Radio } from 'lucide-react';
import { runLiveSimulation } from '../lib/engine';

export default function LiveEnterpriseDashboard() {
  const [day, setDay] = useState(0);
  const [load, setLoad] = useState(85);
  const [isStreaming, setIsStreaming] = useState(true);
  const [simData, setSimData] = useState<any>(null);
  
  const phaseRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    let lastRenderTime = performance.now();

    const renderLoop = (currentTime: number) => {
      if (currentTime - lastRenderTime > 32) { 
        // FIX: Wrap BOTH phase increment and state update inside the isStreaming check.
        // This completely freezes the FFT spectrum calculation, stopping the jitter.
        if (isStreaming) {
          phaseRef.current += 0.015; 
          const liveData = runLiveSimulation(day, load, phaseRef.current);
          setSimData(liveData);
        }
        lastRenderTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [day, load, isStreaming]); 

  if (!simData) return <div className="bg-slate-950 h-screen text-white flex items-center justify-center">Initializing Live DAQ Stream...</div>;

  const isHealthy = simData.ahiScore > 70;
  const isCritical = simData.ahiScore <= 40;

  const stages = [
    { id: 1, label: "Healthy", color: "bg-emerald-500" },
    { id: 2, label: "Early Wear", color: "bg-blue-500" },
    { id: 3, label: "Warning", color: "bg-amber-400" },
    { id: 4, label: "Critical", color: "bg-orange-500" },
    { id: 5, label: "Failure Risk", color: "bg-rose-600" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-3 md:p-6 lg:p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 1. Header & Dynamic Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 xl:gap-8">
          
          <div className="w-full xl:w-auto">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
                <Zap className="text-blue-500 shrink-0" /> DCP Control Room
              </h1>
              {/* LIVE BADGE */}
              <div className={`flex items-center gap-2 px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold border whitespace-nowrap ${isStreaming ? 'border-rose-500/50 bg-rose-500/10 text-rose-500' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                <Radio size={14} className={isStreaming ? "animate-pulse" : ""} />
                {isStreaming ? 'LIVE TELEMETRY' : 'STREAM PAUSED'}
              </div>
            </div>
            <p className="text-slate-400 font-medium text-sm md:text-base">Obajana Line 3 • Raw Mill Main Drive • Node ID: CT-892</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-1/2">
            
            <button 
              onClick={() => setIsStreaming(!isStreaming)}
              className="p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors text-white focus:outline-none flex justify-center items-center shrink-0"
              title={isStreaming ? "Pause Data Stream" : "Resume Data Stream"}
            >
              {isStreaming ? <Pause size={24} className="text-amber-400" /> : <Play size={24} className="text-emerald-400" />}
            </button>

            <div className="flex-1 w-full bg-slate-950 border border-slate-800 p-3 md:p-4 rounded-xl">
              <label className="flex justify-between text-xs md:text-sm font-bold text-slate-400 mb-2 md:mb-3">
                <span className="flex items-center gap-1 md:gap-2"><Clock size={16}/> Timeline</span>
                <span className="text-white bg-blue-500/20 px-2 py-1 rounded text-[10px] md:text-xs border border-blue-500/30">Day {day}</span>
              </label>
              <input 
                type="range" min="0" max="60" value={day} 
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="flex-1 w-full bg-slate-950 border border-slate-800 p-3 md:p-4 rounded-xl">
              <label className="flex justify-between text-xs md:text-sm font-bold text-slate-400 mb-2 md:mb-3">
                <span className="flex items-center gap-1 md:gap-2"><Gauge size={16}/> Load</span>
                <span className="text-white bg-purple-500/20 px-2 py-1 rounded text-[10px] md:text-xs border border-purple-500/30">{load}%</span>
              </label>
              <input 
                type="range" min="50" max="100" value={load} 
                onChange={(e) => setLoad(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Block Graph Tracker & Diagnostic Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-xs md:text-sm font-bold text-slate-400 mb-3 md:mb-4 uppercase tracking-wider">Degradation Progression</h3>
          <div className="flex gap-1 md:gap-2 h-12 md:h-16">
            {stages.map((s) => (
              <div 
                key={s.id} 
                className={`flex-1 flex items-center justify-center rounded-lg border transition-all duration-300 ${
                  simData.stage === s.id 
                    ? `${s.color} border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] text-white font-bold scale-[1.02] md:scale-105` 
                    : simData.stage > s.id 
                      ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                {/* FIX: Ultra condensed text for mobile so it fits perfectly */}
                <span className="text-[9px] sm:text-[10px] md:text-sm text-center px-0.5 md:px-1 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
          <h3 className="text-xs md:text-sm font-bold text-slate-400 mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Info size={16} className={isCritical ? 'text-rose-400' : 'text-blue-400'}/> AI System Insight
          </h3>
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed">{simData.insight}</p>
        </div>
      </div>

      {/* 3. Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Asset Health Index (AHI)</p>
            <h2 className={`text-4xl md:text-5xl font-black mt-1 md:mt-2 ${isCritical ? 'text-rose-500' : (isHealthy ? 'text-emerald-400' : 'text-amber-400')}`}>
              {simData.ahiScore}
            </h2>
          </div>
          {isHealthy ? <ShieldCheck size={40} className="text-emerald-500/20 md:w-12 md:h-12" /> : <AlertTriangle size={40} className="text-rose-500/20 md:w-12 md:h-12" />}
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Primary Defect Signature</p>
          <h2 className={`text-lg md:text-xl font-bold mt-2 md:mt-4 ${isHealthy ? 'text-slate-300' : 'text-rose-400'}`}>
            {simData.activeFault}
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Operational Status</p>
            <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-3">
              <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${isHealthy ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : (isCritical ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e] animate-pulse' : 'bg-amber-400 shadow-[0_0_15px_#fbbf24]')}`}></div>
              <span className={`text-xl md:text-2xl font-black tracking-wide ${isHealthy ? 'text-emerald-500' : (isCritical ? 'text-rose-500' : 'text-amber-400')}`}>
                {simData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Streaming Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Spectrum Analyzer */}
        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl col-span-1 lg:col-span-2 shadow-lg">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-[11px] md:text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1 md:gap-2">
              <Activity className="text-purple-400 shrink-0" size={18}/> Live MCSA Spectrum Analyzer
            </h3>
          </div>
          {/* FIX: Dynamic chart height for mobile vs desktop */}
          <div className="h-[200px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData.spectrumData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="frequency" stroke="#64748b" fontSize={10} tickFormatter={(f) => `${f}Hz`} />
                <YAxis stroke="#64748b" fontSize={10} domain={[-80, 15]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Area 
                  type="monotone" dataKey="magnitude_dB" stroke="#a855f7" strokeWidth={2} 
                  fillOpacity={1} fill="url(#colorDb)" 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Degradation Forecast */}
        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-lg">
          <h3 className="text-[11px] md:text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 md:mb-6">60-Day RUL Forecast</h3>
          <div className="h-[180px] md:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simData.trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickFormatter={(d) => `D${d}`} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="predicted" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rolling Stator Waveform */}
        <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-[11px] md:text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1 md:gap-2">
              <Activity className="text-blue-400 shrink-0" size={18}/> Rolling Stator Waveform
            </h3>
          </div>
          <div className="h-[180px] md:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData.waveformData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[-15, 15]} />
                <Area 
                  type="monotone" dataKey="current" stroke="#10b981" 
                  fill="#10b981" fillOpacity={0.15} strokeWidth={2} 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}