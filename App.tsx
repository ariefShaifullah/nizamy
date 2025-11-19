
import React, { useState, useEffect } from 'react';
import { FaraidhCalculator } from './components/FaraidhCalculator.tsx';
import { ZakatCalculator } from './components/ZakatCalculator.tsx';

type ViewState = 'home' | 'faraidh' | 'zakat';

export default function App() {
  const [view, setView] = useState<ViewState>('home');

  // Enforce Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const Home = () => (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          NIZAMY <span className="text-primary-600">Tools</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Kumpulan kalkulator Islami terpercaya untuk membantu Anda menunaikan kewajiban sesuai syariat Al-Qur'an dan Sunnah.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <button 
          onClick={() => setView('faraidh')}
          className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-32 h-32 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 3.666A5.002 5.002 0 0112 21a5.002 5.002 0 01-3-9.666M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-6 0h6m-6 4h6" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Kalkulator Waris</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Hitung pembagian harta warisan (Faraidh) secara mendetail dengan dalil Al-Qur'an. Mendukung kasus 'Aul dan Radd.
            </p>
            <span className="inline-flex items-center font-semibold text-blue-600">
              Mulai Hitung <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </button>

        <button 
          onClick={() => setView('zakat')}
          className="group relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-32 h-32 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05 1.18 1.91 2.53 1.91 1.38 0 2.36-.83 2.36-1.91 0-1.24-1.13-1.76-3.26-2.28-2.47-.6-4.09-1.68-4.09-3.85 0-1.9 1.38-3.18 3.27-3.52V3h2.67v1.92c1.61.27 2.87 1.28 3.05 3.1h-1.96c-.16-1.12-1.08-1.63-2.3-1.63-1.33 0-2.18.77-2.18 1.67 0 1.15 1.2 1.63 3.38 2.16 2.33.56 3.97 1.72 3.97 3.73.01 1.92-1.38 3.23-3.46 3.64z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">Kalkulator Zakat</h2>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Hitung kewajiban Zakat Fitrah, Maal, Emas/Perak, Perniagaan, hingga Pertanian dengan mudah dan akurat.
            </p>
            <span className="inline-flex items-center font-semibold text-emerald-600">
              Mulai Hitung <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </button>
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 text-sm text-yellow-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Privasi Terjaga: Data Anda hanya diproses di browser ini dan tidak dikirim ke server.</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans bg-slate-50 text-slate-800 ${view === 'zakat' ? 'selection:bg-emerald-200 selection:text-emerald-900' : 'selection:bg-blue-200 selection:text-blue-900'}`}>
      <header className="bg-white shadow-sm sticky top-0 z-20 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => setView('home')} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${view === 'zakat' ? 'text-emerald-600' : 'text-primary-600'}`}>
              <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648L11.25 22.18Z" />
            </svg>
            <div>
                <p className={`text-2xl font-bold tracking-tight ${view === 'zakat' ? 'text-emerald-700' : 'text-primary-700'}`}>NIZAMY</p>
                {view !== 'home' && (
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                        {view === 'faraidh' ? 'Faraidh Calculator' : 'Zakat Calculator'}
                    </p>
                )}
            </div>
          </button>
          
          {view !== 'home' && (
             <button onClick={() => setView('home')} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Menu Utama
             </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {view === 'home' && <Home />}
        {view === 'faraidh' && <FaraidhCalculator />}
        {view === 'zakat' && <ZakatCalculator />}
      </main>
      
      <footer className="text-center py-8 mt-12 border-t border-slate-200">
        <p className="text-slate-500">&copy; {new Date().getFullYear()} NIZAMY. All rights reserved.</p>
      </footer>
    </div>
  );
}
