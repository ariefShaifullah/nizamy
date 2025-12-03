import { useState, useCallback } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { voiceService } from '../services/voice.service.ts';
import { useToast } from '../components/ui/Toast.tsx';
import { SURAH_DATA } from '../constants.ts';
import { audioService } from '../services/audio.service.ts';

// Aliases for specific verses
const AYAH_ALIASES: Record<string, { surah: number, ayah: number, name: string }> = {
    'kursi': { surah: 2, ayah: 255, name: 'Ayat Kursi' },
    'seribu dinar': { surah: 65, ayah: 2, name: 'Ayat Seribu Dinar' },
    'sapu jagat': { surah: 2, ayah: 201, name: 'Doa Sapu Jagat' }
};

// Helper to convert spoken Indonesian numbers to integers
const parseIndonesianNumber = (text: string): number | null => {
    const clean = text.toLowerCase().replace(/rp|rupiah|uang|harta|nilai|sebesar|nomor|ke/g, '').trim();
    
    // Multipliers
    const multipliers = {
        'juta': 1000000,
        'milyar': 1000000000,
        'miliar': 1000000000,
        'triliun': 1000000000000,
        'ribu': 1000
    };

    // Check for explicit matches like "100 juta"
    for (const [key, val] of Object.entries(multipliers)) {
        if (clean.includes(key)) {
            const parts = clean.split(key);
            const numPart = parts[0].trim().match(/[\d,.]+/); 
            if (numPart) {
                const numberStr = numPart[0].replace(',', '.');
                return parseFloat(numberStr) * val;
            }
            if (parts[0].includes('satu') || parts[0].includes('se')) return 1 * val;
            if (parts[0].includes('setengah')) return 0.5 * val;
        }
    }

    // Fallback: try raw number parsing "100000" or "255"
    const rawMatch = clean.replace(/\./g,'').match(/[\d]+/);
    if (rawMatch) return parseInt(rawMatch[0], 10);

    const basicWords: Record<string, number> = {
        'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
        'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10
    };
    for (const [word, val] of Object.entries(basicWords)) {
        if (clean === word) return val;
    }

    return null;
};

// Helper to parse heirs configuration from text
const parseHeirs = (text: string): string => {
    const lower = text.toLowerCase();
    
    const heirMappings = [
        { keys: ['suami'], id: 'husband' },
        { keys: ['istri', 'bini'], id: 'wife' },
        { keys: ['anak laki', 'putra', 'cowok'], id: 'son' }, 
        { keys: ['anak perempuan', 'putri', 'cewek'], id: 'daughter' },
        { keys: ['ayah', 'bapak'], id: 'father' },
        { keys: ['ibu', 'mamah', 'mama', 'bunda'], id: 'mother' },
        { keys: ['saudara laki', 'abang', 'kakak laki', 'adik laki'], id: 'fullBrother' },
        { keys: ['saudara perempuan', 'kakak perempuan', 'adik perempuan'], id: 'fullSister' },
        { keys: ['kakek'], id: 'grandfather' },
        { keys: ['nenek'], id: 'paternalGrandmother' },
        { keys: ['cucu laki'], id: 'grandson' },
        { keys: ['cucu perempuan'], id: 'granddaughter' }
    ];

    const wordNumbers: Record<string, number> = {
        'satu': 1, 'seorang': 1, 'dua': 2, 'tiga': 3, 'empat': 4 
    };

    const result: string[] = [];
    let processedText = lower; 
    
    heirMappings.forEach(map => {
        const matchedKey = map.keys.find(k => processedText.includes(k));
        if (matchedKey) {
            let count = 1; 
            const regexDigitPost = new RegExp(`${matchedKey}\\s*(\\d+)`);
            const regexDigitPre = new RegExp(`(\\d+)\\s*${matchedKey}`);
            const mPost = processedText.match(regexDigitPost);
            const mPre = processedText.match(regexDigitPre);

            if (mPost) count = parseInt(mPost[1]);
            else if (mPre) count = parseInt(mPre[1]);
            else {
                for (const [word, val] of Object.entries(wordNumbers)) {
                    if (processedText.includes(`${word} ${matchedKey}`) || processedText.includes(`${matchedKey} ${word}`)) {
                        count = val;
                        break;
                    }
                }
            }
            result.push(`${map.id}:${count}`);
        }
    });
    return result.join(',');
};

export const useNizamyVoice = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // --- INTENT 1: ZAKAT (Calculation & Navigation) ---
    if (lowerText.includes('zakat')) {
        const numberVal = parseIndonesianNumber(lowerText);
        
        // Determine Type with Explicit Keyword Matching
        let type = 'maal'; // Default fallback

        // Priority 1: Fitrah (Specific)
        if (lowerText.includes('fitrah') || lowerText.includes('beras') || lowerText.includes('jiwa')) {
            type = 'fitrah';
        }
        // Priority 2: Gold/Silver
        else if (lowerText.includes('emas') || lowerText.includes('logam') || lowerText.includes('perak') || lowerText.includes('perhiasan')) {
            type = 'gold';
        }
        // Priority 3: Business/Trade
        else if (lowerText.includes('dagang') || lowerText.includes('niaga') || lowerText.includes('bisnis') || lowerText.includes('toko') || lowerText.includes('warung') || lowerText.includes('jualan')) {
            type = 'business';
        }
        // Priority 4: Agriculture
        else if (lowerText.includes('tani') || lowerText.includes('panen') || lowerText.includes('pertanian') || lowerText.includes('sawah') || lowerText.includes('kebun') || lowerText.includes('ladang')) {
            type = 'agri';
        }
        // Priority 5: Livestock
        else if (lowerText.includes('ternak') || lowerText.includes('sapi') || lowerText.includes('kambing') || lowerText.includes('domba') || lowerText.includes('kerbau')) {
            type = 'livestock';
        }
        // Priority 6: Maal (Explicit & Synonyms)
        else if (lowerText.includes('mal') || lowerText.includes('maal') || lowerText.includes('harta') || lowerText.includes('uang') || lowerText.includes('tabungan') || lowerText.includes('simpanan') || lowerText.includes('deposito')) {
            type = 'maal';
        }

        if (numberVal && lowerText.includes('hitung')) {
            // Calculation Intent
            navigate(`/zakat?action=calculate&type=${type}&amount=${numberVal}`);
            return `Menghitung Zakat ${type === 'gold' ? 'Emas' : type === 'fitrah' ? 'Fitrah' : 'Maal'}...`;
        } else {
            // Navigation Intent
            navigate(`/zakat?tab=${type}`);
            return `Membuka Kalkulator Zakat ${type === 'gold' ? 'Emas' : type === 'fitrah' ? 'Fitrah' : 'Maal'}`;
        }
    }

    // --- INTENT 2: WARIS ---
    if (lowerText.includes('waris') || lowerText.includes('faraidh')) {
        const numberVal = parseIndonesianNumber(lowerText);
        let url = '/faraidh';
        
        if (lowerText.includes('hitung') && (numberVal || lowerText.includes('istri') || lowerText.includes('suami') || lowerText.includes('anak'))) {
             const params = new URLSearchParams();
             if (numberVal) params.append('estate', String(numberVal));
             
             const heirsString = parseHeirs(lowerText);
             if (heirsString) params.append('heirs', heirsString);
             
             navigate(`${url}?${params.toString()}`);
             return numberVal ? `Menghitung Waris harta ${numberVal.toLocaleString('id-ID')}` : `Menyiapkan form waris`;
        } else {
             navigate(url);
             return "Membuka Kalkulator Waris";
        }
    }

    // --- INTENT 3: MUSHAF NAVIGATION ---
    if (lowerText.includes('buka') || lowerText.includes('baca') || lowerText.includes('surat') || lowerText.includes('surah') || lowerText.includes('ayat')) {
        
        // A. Check for Special Aliases
        for (const [key, val] of Object.entries(AYAH_ALIASES)) {
            if (lowerText.includes(key)) {
                localStorage.setItem('mushaf_jump_surah', String(val.surah));
                localStorage.setItem('mushaf_jump_ayah', String(val.ayah));
                
                navigate('/mushaf');
                window.dispatchEvent(new Event('nizamy-voice-command'));
                return `Membuka ${val.name}`;
            }
        }

        // B. Standard Surah Extraction (Normalized)
        const cleanInput = lowerText
            .replace(/[^a-z0-9]/g, '')
            .replace(/aa/g, 'a')
            .replace(/ii/g, 'i')
            .replace(/uu/g, 'u')
            .replace(/ee/g, 'e')
            .replace(/oo/g, 'o');

        const matchedSurahs = SURAH_DATA.filter(s => {
            const rawName = s.name.toLowerCase();
            const cleanName = rawName
                .replace(/[^a-z0-9]/g, '')
                .replace(/aa/g, 'a')
                .replace(/ii/g, 'i')
                .replace(/uu/g, 'u');

            if (cleanInput.includes(cleanName)) return true;
            if (new RegExp(`\\b(surat|surah)\\s+${s.number}\\b`).test(lowerText)) return true;
            return false;
        });

        // Pick best match (longest name usually more specific)
        const foundSurah = matchedSurahs.sort((a, b) => b.name.length - a.name.length)[0];

        if (foundSurah) {
            let ayahNumber: number | null = null;
            const ayatSplit = lowerText.split('ayat');
            if (ayatSplit.length > 1) {
                const potentialNumberText = ayatSplit[1].trim(); 
                ayahNumber = parseIndonesianNumber(potentialNumberText);
            }

            localStorage.setItem('mushaf_jump_surah', String(foundSurah.number));
            if (ayahNumber) {
                localStorage.setItem('mushaf_jump_ayah', String(ayahNumber));
            }

            navigate('/mushaf');
            window.dispatchEvent(new Event('nizamy-voice-command'));
            return `Membuka ${foundSurah.name} ${ayahNumber ? `Ayat ${ayahNumber}` : ''}`;
        }
    }

    // --- INTENT 4: BASIC NAVIGATION ---
    if (lowerText.includes('hafalan') || lowerText.includes('murajaah')) {
        navigate('/hafalan');
        return "Membuka Hafalan Tracker";
    }
    if (lowerText.includes('halal') || lowerText.includes('audit') || lowerText.includes('ekonomi') || lowerText.includes('klinik') ||lowerText.includes('cek')) {
        navigate('/hede');
        return "Membuka Klinik Finansial";
    }

    if (lowerText.includes('halo') || lowerText.includes('assalamualaikum')) {
        return "Wa'alaikumussalam. Coba katakan 'Buka Surat Al Baqarah Ayat 255' atau 'Hitung Waris'.";
    }

    return null;
  };

  const startListening = useCallback(() => {
    setFeedback(null);
    setTranscript('');
    audioService.playClick();
    setIsListening(true);

    voiceService.start(
        (text, isFinal) => {
            setTranscript(text);
            if (isFinal) {
                setTimeout(() => {
                    const response = processCommand(text);
                    if (response) {
                        setFeedback(response);
                        audioService.playSuccess();
                        voiceService.speak(response);
                        showToast(response, 'success');
                        
                        setTimeout(() => {
                            stopListening();
                        }, 2000);
                    } else {
                        setFeedback("Maaf, saya belum paham.");
                        setTimeout(() => {
                            setFeedback(null);
                            setTranscript('');
                        }, 1500);
                    }
                }, 500);
            }
        },
        (error) => {
            if (error === 'not-allowed' || error === 'service-not-allowed') {
                setIsListening(false);
                showToast("Izin mikrofon ditolak.", 'error');
            }
        },
        () => { }
    );
  }, [navigate, showToast]);

  const stopListening = useCallback(() => {
    voiceService.stop();
    setIsListening(false);
    setTranscript('');
    setFeedback(null);
  }, []);

  return {
    isListening,
    transcript,
    feedback,
    startListening,
    stopListening,
    isSupported: voiceService.checkSupport()
  };
};