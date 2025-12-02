
  import React, { useState, useEffect } from 'react';
  import { FaMicrophone, FaTimes } from 'react-icons/fa';

  interface VoiceAssistantOverlayProps {
      isListening: boolean;
      transcript: string;
      feedback: string | null;
      onStop: () => void;
  }

  const SUGGESTIONS = [
      "Buka Surat Yasin",
      "Buka Ayat Kursi",
      "Hitung Waris 1 Milyar ahli waris 1 istri dan 2 anak",
      "Hitung Zakat Emas",
      "Buka Menu Hafalan",
      "Buka Surat Al Kahfi Ayat 10"
  ];

  /**
   * Pure UI Component for Voice Interface
   * Upgraded with "Fluid Orb" animation and Smart Rotating Hints for a premium feel.
   */
  export const VoiceAssistant: React.FC<VoiceAssistantOverlayProps> = ({ 
      isListening, 
      transcript, 
      feedback, 
      onStop 
  }) => {
      const [suggestionIndex, setSuggestionIndex] = useState(0);

      useEffect(() => {
          if (isListening) {
              const interval = setInterval(() => {
                  setSuggestionIndex(prev => (prev + 1) % SUGGESTIONS.length);
              }, 3000);
              return () => clearInterval(interval);
          }
      }, [isListening]);

      if (!isListening) return null;

      return (
          <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xl animate-fade-in text-center" onClick={onStop}>
              <div className="w-full max-w-md px-6 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Fluid Orb Animation */}
                  <div className="relative w-32 h-32 mb-10 group cursor-pointer" onClick={onStop}>
                      {/* Core */}
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                      
                      {/* Rings */}
                      <div className="absolute -inset-2.5 border-2 border-indigo-400/30 rounded-full animate-[spin_4s_linear_infinite]"></div>
                      <div className="absolute -inset-5 border border-indigo-300/10 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
                      
                      {/* Active Waveform Simulation (CSS Scale) */}
                      <div className="absolute inset-0 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-[bounce_2s_infinite]">
                          <div className=" icon-wrapper drop-shadow-md"><FaMicrophone size={40}  /></div>
                      </div>
                  </div>

                  <h3 className="text-white text-3xl font-bold mb-4 tracking-tight">
                      {feedback ? feedback : (transcript ? "Mendengar..." : "Katakan Sesuatu...")}
                  </h3>
                  
                  <div className="min-h-20 flex items-center justify-center w-full">
                      <p className="text-indigo-200 text-xl font-medium leading-relaxed max-w-sm mx-auto wrap-break-word">
                          {transcript 
                              ? `"${transcript}"` 
                              : <span className="opacity-50 animate-pulse text-lg">...</span>
                          }
                      </p>
                  </div>

                  {/* Smart Suggestions */}
                  {!transcript && !feedback && (
                      <div className="mt-8 animate-fade-in-up">
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Coba Katakan</p>
                          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-slate-300 text-sm font-medium transition-all duration-500">
                              "{SUGGESTIONS[suggestionIndex]}"
                          </div>
                      </div>
                  )}

                  <button 
                      onClick={onStop}
                      className="mt-12 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full p-4 transition-all border border-white/5 hover:border-white/20 active:scale-95"
                      aria-label="Tutup Voice Assistant"
                  >
                      <FaTimes size={20} />
                  </button>
              </div>
          </div>
      );
  };
