"use client";

import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, AlertCircle, ShieldCheck, Zap, Info, Clock, Gauge, Pause, Play, Radio } from 'lucide-react';
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

  if (!simData) return <div className="bg-gray-50 h-screen text-gray-600 flex items-center justify-center font-sans">Initializing Telemetry...</div>;

  const isHealthy = simData.ahiScore > 70;
  const isCritical = simData.ahiScore <= 40;

  const stages = [
    { id: 1, label: "Healthy", activeBg: "bg-emerald-600", text: "text-white" },
    { id: 2, label: "Early Wear", activeBg: "bg-blue-600", text: "text-white" },
    { id: 3, label: "Warning", activeBg: "bg-amber-500", text: "text-white" },
    { id: 4, label: "Critical", activeBg: "bg-orange-600", text: "text-white" },
    { id: 5, label: "Failure Risk", activeBg: "bg-red-600", text: "text-white" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-3 md:p-6 lg:p-8 font-sans antialiased overflow-x-hidden">
      
      {/* 1. Header & Dynamic Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 mb-4 md:mb-6 shadow-sm">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 xl:gap-8">
          
          <div className="w-full xl:w-auto">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
                <Zap className="text-blue-700 shrink-0" size={28} /> DCP Control Room
              </h1>
              {/* LIVE BADGE */}
              <div className={`flex items-center gap-2 px-2 py-1 md:px-3 rounded-md text-[10px] md:text-xs font-semibold border whitespace-nowrap ${isStreaming ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-100 text-gray-500'}`}>
                <Radio size={14} className={isStreaming ? "animate-pulse" : ""} />
                {isStreaming ? 'LIVE TELEMETRY' : 'STREAM PAUSED'}
              </div>
            </div>
            <p className="text-gray-500 font-medium text-sm md:text-base">Obajana Line 3 • Raw Mill Main Drive • Node: CT-892</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-1/2">
            
            <button 
              onClick={() => setIsStreaming(!isStreaming)}
              className="p-3 md:p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 focus:outline-none flex justify-center items-center shrink-0 shadow-sm"
              title={isStreaming ? "Pause Data Stream" : "Resume Data Stream"}
            >
              {isStreaming ? <Pause size={22} className="text-gray-700" /> : <Play size={22} className="text-emerald-600" />}
            </button>

            <div className="flex-1 w-full bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-lg">
              <label className="flex justify-between text-xs md:text-sm font-semibold text-gray-600 mb-2 md:mb-3">
                <span className="flex items-center gap-1 md:gap-2"><Clock size={16}/> Timeline</span>
                <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] md:text-xs border border-blue-200">Day {day}</span>
              </label>
              <input 
                type="range" min="0" max="60" value={day} 
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex-1 w-full bg-gray-50 border border-gray-200 p-3 md:p-4 rounded-lg">
              <label className="flex justify-between text-xs md:text-sm font-semibold text-gray-600 mb-2 md:mb-3">
                <span className="flex items-center gap-1 md:gap-2"><Gauge size={16}/> Load</span>
                <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px] md:text-xs border border-indigo-200">{load}%</span>
              </label>
              <input 
                type="range" min="50" max="100" value={load} 
                onChange={(e) => setLoad(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Block Graph Tracker & Diagnostic Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-4 md:p-6 rounded-xl shadow-sm">
          <h3 className="text-xs md:text-sm font-semibold text-gray-500 mb-3 md:mb-4 uppercase tracking-wide">Degradation Progression</h3>
          <div className="flex gap-1 md:gap-2 h-10 md:h-12">
            {stages.map((s) => (
              <div 
                key={s.id} 
                className={`flex-1 flex items-center justify-center rounded-md border transition-all duration-300 ${
                  simData.stage === s.id 
                    ? `${s.activeBg} border-transparent ${s.text} font-semibold shadow-md` 
                    : simData.stage > s.id 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-60'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <span className="text-[10px] md:text-sm text-center px-0.5 md:px-1 leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 p-4 md:p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-red-500' : 'bg-blue-600'}`}></div>
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Info size={16} className={isCritical ? 'text-red-500' : 'text-blue-600'}/> AI System Insight
          </h3>
          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{simData.insight}</p>
        </div>
      </div>

      {/* 3. Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wide">Asset Health Index</p>
            <h2 className={`text-4xl md:text-5xl font-bold mt-1 md:mt-2 ${isCritical ? 'text-red-600' : (isHealthy ? 'text-emerald-600' : 'text-amber-500')}`}>
              {simData.ahiScore}
            </h2>
          </div>
          {isHealthy ? <ShieldCheck size={40} className="text-emerald-100 md:w-12 md:h-12" /> : <AlertCircle size={40} className="text-red-100 md:w-12 md:h-12" />}
        </div>

        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl shadow-sm">
          <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wide">Primary Defect Signature</p>
          <h2 className={`text-lg md:text-xl font-semibold mt-2 md:mt-4 ${isHealthy ? 'text-gray-900' : 'text-red-600'}`}>
            {simData.activeFault}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-wide">Operational Status</p>
            <div className="mt-2 md:mt-4 flex items-center gap-2 md:gap-3">
              <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${isHealthy ? 'bg-emerald-500' : (isCritical ? 'bg-red-500' : 'bg-amber-500')}`}></div>
              <span className={`text-xl md:text-2xl font-bold tracking-tight ${isHealthy ? 'text-emerald-600' : (isCritical ? 'text-red-600' : 'text-amber-600')}`}>
                {simData.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Streaming Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Spectrum Analyzer */}
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl col-span-1 lg:col-span-2 shadow-sm">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-[11px] md:text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1 md:gap-2">
              <Activity className="text-indigo-600 shrink-0" size={18}/> Live MCSA Spectrum Analyzer
            </h3>
          </div>
          <div className="h-[200px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData.spectrumData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="frequency" stroke="#9ca3af" fontSize={10} tickFormatter={(f) => `${f}Hz`} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} domain={[-80, 15]} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" dataKey="magnitude_dB" stroke="#4f46e5" strokeWidth={2} 
                  fill="#e0e7ff" fillOpacity={0.6}
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Degradation Forecast */}
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl shadow-sm">
          <h3 className="text-[11px] md:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 md:mb-6 flex items-center gap-2">
             60-Day RUL Forecast
          </h3>
          <div className="h-[180px] md:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simData.trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickFormatter={(d) => `D${d}`} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Critical Threshold', fill: '#ef4444', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="predicted" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rolling Stator Waveform */}
        <div className="bg-white border border-gray-200 p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h3 className="text-[11px] md:text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1 md:gap-2">
              <Activity className="text-blue-600 shrink-0" size={18}/> Rolling Stator Waveform
            </h3>
          </div>
          <div className="h-[180px] md:h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData.waveformData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} domain={[-15, 15]} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Area 
                  type="monotone" dataKey="current" stroke="#0ea5e9" 
                  fill="#e0f2fe" fillOpacity={0.8} strokeWidth={2} 
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