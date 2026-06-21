import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  // 1. Reactive State Matrix Tracking
  const [initialDeposit, setInitialDeposit] = useState(5000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [years, setYears] = useState(15);

  const [outputs, setOutputs] = useState({
    totalValue: '0,00 €',
    totalPrincipal: '0,00 €',
    totalInterest: '0,00 €',
  });
  
  const [isCalculating, setIsCalculating] = useState(false);

  // 2. Full-Stack API Integration Engine
  useEffect(() => {
    if (years <= 0) return;

    setIsCalculating(true);

    // Build the JSON payload to send to the Node server
    const payload = {
      initialDeposit: parseFloat(initialDeposit) || 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      annualReturn: parseFloat(annualReturn) || 0,
      years: parseInt(years) || 0
    };

    // Dispatch asynchronous POST request to the Express API backend
    fetch('http://localhost:5050/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network response compilation failure');
        return res.json();
      })
      .then((data) => {
        // European Locale String Formatter (de-DE) applied to the returned API data
        const currencyFormatter = new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        });

        // Hydrate the UI layout state with the clean server responses
        setOutputs({
          totalValue: currencyFormatter.format(data.totalValue),
          totalPrincipal: currencyFormatter.format(data.totalPrincipal),
          totalInterest: currencyFormatter.format(data.totalInterest),
        });
        setIsCalculating(false);
      })
      .catch((error) => {
        console.error('API Pipeline Interruption:', error);
        setIsCalculating(false);
      });
  }, [initialDeposit, monthlyContribution, annualReturn, years]); 
  
  const savePortfolio = () => {
    // Strip symbols out of the outputs to send clean numbers back to the backend
    const cleanNumeric = (formattedString) => {
      return parseFloat(formattedString.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
    };

    const savePayload = {
      initialDeposit: parseFloat(initialDeposit) || 0,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      annualReturn: parseFloat(annualReturn) || 0,
      years: parseInt(years) || 0,
      totalValue: cleanNumeric(outputs.totalValue),
      totalPrincipal: cleanNumeric(outputs.totalPrincipal),
      totalInterest: cleanNumeric(outputs.totalInterest)
    };

    fetch('http://localhost:5050/api/save-calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savePayload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Database insertion pipeline rejection');
        return res.json();
      })
      .then((data) => {
        alert('Portfolio state successfully committed to PostgreSQL database!');
        console.log('Database Log Packet:', data.record);
      })
      .catch((error) => {
        console.error('Database Sync Error:', error);
        alert('Database write failure. Check server console logs.');
      });
  };// Fires dynamically on any input mutation

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-100 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      
      {/* Premium Header Layout */}
      <header className="border-b border-neutral-900 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-6 bg-red-600 rounded-sm"></span>
            <span className="text-xl font-bold tracking-wider text-white">
              VANGUARD <span className="text-red-600">INVESTING</span>
            </span>
          </div>
          
          {/* Framework Badges in Header */}
          <div className="flex items-center space-x-4 opacity-60 hover:opacity-100 transition-opacity">
            <img src={viteLogo} className="h-5 w-5 animate-pulse" alt="Vite logo" />
            <span className="text-neutral-700">|</span>
            <img src={reactLogo} className="h-5 w-5 spin-slow" alt="React logo" />
          </div>
        </div>
      </header>

      {/* Main Full-Stack App Layout */}
      <main className="max-w-5xl mx-auto px-6 py-16 w-full grid lg:grid-cols-5 gap-12 items-start flex-grow">
        
        {/* Controls Inputs Panel */}
        <div className="lg:col-span-2 flex flex-col gap-y-6 bg-[#141414] p-6 border border-neutral-900 rounded-xl shadow-xl">
          <div className="flex flex-col gap-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">Compound Projections</h2>
              {isCalculating && (
                <span className="text-[10px] bg-red-900/40 text-red-500 border border-red-900/60 px-2 py-0.5 rounded animate-pulse">
                  API Sync
                </span>
              )}
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Simulate quantitative capability matrices via secure backend pipeline architecture.
            </p>
          </div>
          
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Initial Bankroll (€)</label>
              <input 
                type="number" 
                value={initialDeposit} 
                onChange={(e) => setInitialDeposit(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-600 transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Monthly Contribution (€)</label>
              <input 
                type="number" 
                value={monthlyContribution} 
                onChange={(e) => setMonthlyContribution(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-600 transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Expected Annual Growth (%)</label>
              <input 
                type="number" 
                step="0.1" 
                value={annualReturn} 
                onChange={(e) => setAnnualReturn(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-600 transition-colors" 
              />
            </div>
            <div className="flex flex-col gap-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Time Horizon (Years)</label>
              <input 
                type="number" 
                value={years} 
                onChange={(e) => setYears(e.target.value)} 
                className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-red-600 transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Display Terminal Panel */}
        <div className="lg:col-span-3 bg-[#141414] border border-neutral-900 rounded-xl p-8 flex flex-col justify-between min-h-[380px] shadow-2xl relative overflow-hidden group">
          <div className="flex flex-col gap-y-2 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Projected Portfolio Capitalization</span>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight break-words py-1 transition-all duration-150">
              {outputs.totalValue}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 border-t border-neutral-900 pt-8 mt-8 relative z-10">
            <div className="flex flex-col gap-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Cumulated Principal Deposits</span>
              <span className="text-xl font-bold font-mono text-neutral-300">{outputs.totalPrincipal}</span>
            </div>
            <div className="flex flex-col gap-y-1">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Compound Return Yield</span>
              <span className="text-xl font-bold font-mono text-red-600">{outputs.totalInterest}</span>
            </div>
            <div className="mt-8 relative z-10">
            <button
              type="button"
              onClick={savePortfolio}
              className="w-full bg-neutral-100 hover:bg-white text-black font-bold uppercase tracking-wider text-xs py-3.5 px-4 rounded-md transition-all duration-200 shadow-md transform active:scale-[0.99] hover:shadow-red-600/10 hover:border hover:border-neutral-200"
            >
              Secure Portfolio Projection to Database
            </button>
          </div>
          </div>
          
          {/* Decorative grid lines backplate */}
          <div className="absolute inset-0 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>
        </div>
      </main>

      {/* Regulatory Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-500 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-y-4 text-xs font-light leading-relaxed tracking-wide">
          <p><strong>LEGAL NOTICE:</strong> Calculations generated are for educational tracking illustration purposes only. Node engine computed algorithms do not represent formalized structural investment strategy counsel.</p>
          <p className="text-[11px] text-neutral-600 pt-4 border-t border-neutral-900/50">&copy; 2026 Vanguard Investing. PERN Architecture Pipeline Systems.</p>
        </div>
      </footer>
    </div>
  )
}

export default App