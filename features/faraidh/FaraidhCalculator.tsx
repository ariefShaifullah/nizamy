
import React, { useState, useReducer, useCallback, useTransition, useEffect } from 'react';
import { HeirsForm } from './components/HeirsForm.tsx';
import { ResultsDisplay } from './components/ResultsDisplay.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { FAQ } from '../../components/ui/FAQ.tsx';
import { calculateFaraidh } from './logic/faraidh.service.ts';
import type { CalculationResult, HistoryEntry, Heir } from '../../types.ts';
import { initialHeirsState, FARAIDH_FAQ } from './constants.ts';
import { heirsReducer } from './logic/heirsReducer.ts';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useConfirm } from '../../components/ui/ConfirmContext.tsx';
import { useRouter } from '../../hooks/useRouter.ts'; // Import router
import { FaPen, FaChartPie, FaHistory } from 'react-icons/fa';

type FaraidhTab = 'input' | 'result' | 'history';

const FaraidhCalculator: React.FC = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { searchParams } = useRouter(); // Use params

  const [heirs, dispatch] = useReducer(heirsReducer, initialHeirsState);
  const [estate, setEstate] = useState<string>('100000000');
  const [deceasedGender, setDeceasedGender] = useState<'male' | 'female'>('male'); // Lifted State
  
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [history, setHistory] = useIndexedDB<HistoryEntry[]>('faraidhHistory', []);
  const [activeTab, setActiveTab] = useState<FaraidhTab>('input');

  // --- HANDLE VOICE COMMAND ---
  useEffect(() => {
      const estateParam = searchParams.get('estate');
      const heirsParam = searchParams.get('heirs');
      
      let hasUpdates = false;

      if (estateParam) {
          const val = parseInt(estateParam, 10);
          if (!isNaN(val) && val > 0) {
              setEstate(String(val));
              hasUpdates = true;
          }
      }

      if (heirsParam) {
          // Format: "son:2,wife:1"
          // Reset existing before applying new
          if (!hasUpdates) dispatch({ type: 'RESET' }); // Only reset if we didn't just reset for estate above? Actually safer to always reset if voice command triggers.
          else dispatch({ type: 'RESET' }); // Ensure clean slate

          const pairs = heirsParam.split(',');
          let heirsLoadedCount = 0;

          pairs.forEach(pair => {
              const [key, valStr] = pair.split(':');
              const val = parseInt(valStr, 10);
              if (key && !isNaN(val)) {
                  dispatch({ type: 'SET_COUNT', payload: { heir: key as Heir, count: val } });
                  heirsLoadedCount++;
                  
                  // Auto-set deceased gender context if possible
                  if (key === 'husband') setDeceasedGender('female');
                  if (key === 'wife') setDeceasedGender('male');
              }
          });
          
          if (heirsLoadedCount > 0) hasUpdates = true;
      } else if (estateParam) {
          // If only estate provided, still reset heirs to avoid confusion with previous manual input
          dispatch({ type: 'RESET' });
      }

      if (hasUpdates) {
          showToast(`Data dimuat dari perintah suara.`, 'info');
      }
  }, [searchParams, showToast]);

  const handleCalculate = useCallback(() => {
    const estateValue = parseFloat(estate);
    if (isNaN(estateValue) || estateValue <= 0) {
      showToast("Mohon masukkan nilai harta yang valid.", 'error');
      return;
    }

    startTransition(() => {
        try {
            const calculationResult = calculateFaraidh(heirs, estateValue);
            setResult(calculationResult);
            
            const newHistoryEntry: HistoryEntry = {
                id: new Date().toISOString(),
                timestamp: new Date().toLocaleString('id-ID'),
                estate: estateValue,
                heirs,
                result: calculationResult,
            };
            
            setHistory(prevHistory => [newHistoryEntry, ...prevHistory].slice(0, 10));
            
            showToast("Perhitungan selesai!", 'success');

            if (window.innerWidth < 1024) {
                setActiveTab('result');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

        } catch (error) {
            console.error("Calculation failed:", error);
            showToast("Terjadi kesalahan dalam perhitungan.", 'error');
        }
    });
  }, [estate, heirs, setHistory, showToast]);
  
  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setEstate(String(entry.estate));
    dispatch({ type: 'LOAD_STATE', payload: entry.heirs });
    setResult(entry.result);
    
    if (entry.heirs.husband > 0) setDeceasedGender('female');
    else if (entry.heirs.wife > 0) setDeceasedGender('male');
    
    if (window.innerWidth < 1024) {
        setActiveTab('result');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showToast("Data riwayat dimuat", 'info');
  }, [showToast]);
  
  const clearHistory = useCallback(async () => {
    const isConfirmed = await confirm({
        title: 'Hapus Riwayat',
        message: 'Apakah Anda yakin ingin menghapus semua riwayat perhitungan?',
        confirmText: 'Ya, Hapus',
        variant: 'danger'
    });

    if (isConfirmed) {
        setHistory([]);
        showToast("Riwayat dihapus", 'info');
    }
  }, [setHistory, confirm, showToast]);

  const switchTab = (tab: FaraidhTab) => {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-screen-2xl mx-auto pb-0 lg:pb-16 animate-fade-in px-0 md:px-6">
        {/* Desktop Header */}
        <div className="hidden lg:block text-center mb-10 lg:mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
             <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100">
                Kalkulator Waris Islam
             </h1>
          </div>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 px-4 font-medium">
            Hitung pembagian harta waris (Faraidh) secara akurat, transparan, dan sesuai dalil Syar'i.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mt-4 lg:mt-0 relative">
          <div className={`flex-1 w-full min-w-0 ${activeTab === 'input' ? 'block' : 'hidden lg:block'}`}>
              <HeirsForm 
                heirs={heirs} 
                dispatch={dispatch} 
                estate={estate} 
                setEstate={setEstate} 
                deceasedGender={deceasedGender}
                setDeceasedGender={setDeceasedGender}
                onCalculate={handleCalculate}
                loading={isPending}
              />
              
              <div className="hidden lg:block mt-10">
                <HistoryPanel history={history} onLoad={loadFromHistory} onClear={clearHistory} />
              </div>
          </div>
          
          <div className={`w-full lg:w-[480px] xl:w-[580px] shrink-0 ${activeTab === 'result' ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-28 transition-all duration-300 pb-24 lg:pb-0 space-y-6">
               <ResultsDisplay result={result} deceasedGender={deceasedGender} />
            </div>
          </div>

          <div className={`w-full lg:hidden ${activeTab === 'history' ? 'block' : 'hidden'} pb-24`}>
            <HistoryPanel history={history} onLoad={loadFromHistory} onClear={clearHistory} />
            {history.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 mx-4">
                    Belum ada riwayat perhitungan.
                </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block mt-20 border-t border-slate-200 dark:border-slate-700 pt-12">
            <FAQ 
                title="Pertanyaan Umum (FAQ) Waris"
                subtitle="Temukan jawaban atas pertanyaan umum seputar hukum Faraidh dan cara pembagiannya."
                data={FARAIDH_FAQ}
            />
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 px-4 z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
             <button 
                onClick={() => switchTab('input')}
                className={`flex flex-col items-center p-2 rounded-2xl transition-all flex-1 ${
                    activeTab === 'input' 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
             >
                <span className="icon-wrapper w-6 h-6 mb-1"><FaPen /></span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Input</span>
             </button>
             
             <button 
                onClick={() => switchTab('result')}
                className={`flex flex-col items-center p-2 rounded-2xl transition-all flex-1 mx-2 ${
                    activeTab === 'result' 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
             >
                <div className="relative">
                    <span className="icon-wrapper w-6 h-6 mb-1"><FaChartPie /></span>
                    {result && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Hasil</span>
             </button>

             <button 
                onClick={() => switchTab('history')}
                className={`flex flex-col items-center p-2 rounded-2xl transition-all flex-1 ${
                    activeTab === 'history' 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
             >
                <span className="icon-wrapper w-6 h-6 mb-1"><FaHistory /></span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Riwayat</span>
             </button>
        </div>
    </div>
  );
}

export default FaraidhCalculator;
