
import { useState, useCallback, useRef } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { voiceService } from '../services/voice.service.ts';
import { SURAH_DATA } from '../constants.ts';
import { audioService } from '../services/audio.service.ts';

// --- UTILS: FUZZY MATCHING & PARSING (Tidak berubah) ---
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
};

const normalizeText = (text: string): string => {
    return text.toLowerCase()
        .replace(/['`’]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/uu/g, 'u')
        .replace(/sh|sy|th|ts/g, 's').replace(/dz|zh|z/g, 'z')
        .replace(/dh/g, 'd').replace(/kh/g, 'h').replace(/q/g, 'k').replace(/f/g, 'p')
        .trim();
};

const SPECIAL_ALIASES: Record<string, number> = {
    'kursi': 2, 'seribu dinar': 65, 'sapu jagat': 2,
    'duha': 93, 'dhuha': 93, 'adduha': 93, 'wadduha': 93,
    'yasin': 36, 'yasiin': 36, 'alkahfi': 18, 'kahfi': 18,
    'amma': 78, 'annaba': 78, 'naba': 78, 'qulhu': 112, 'ikhlas': 112,
    'fatihah': 1, 'alfatihah': 1, 'ummul kitab': 1, 'mudasir': 74,
    'mulk': 67, 'almulk': 67, 'tabarak': 67, 'waqiah': 56, 'alwaqiah': 56,
    'rahman': 55, 'arrahman': 55, 'syura': 42, 'asysyura': 42, 'syuara': 26
};

const SURAH_SEARCH_INDEX = SURAH_DATA.map(surah => {
    const rawName = normalizeText(surah.name);
    return { surah, tokens: [rawName, rawName.replace(/^(al|as|at|an|ad|ar|az|ash|aw|ay)/, ''), normalizeText(surah.arti)] };
});

const parseIndonesianNumber = (text: string): number | null => {
    let clean = text.toLowerCase().replace(/rp|rupiah|uang|harta|nilai|sebesar|nomor|ke|juz/g, '').trim();
    const multipliers: Record<string, number> = { 'triliun': 1000000000000, 'milyar': 1000000000, 'miliar': 1000000000, 'juta': 1000000, 'ribu': 1000, 'ratus': 100 };
    
    for (const [key, val] of Object.entries(multipliers)) {
        if (clean.includes(key)) {
            const parts = clean.split(key);
            const prefix = parts[0].trim();
            const digitMatch = prefix.match(/[\d\.,]+/);
            if (digitMatch) {
                const num = parseFloat(digitMatch[0].replace(',', '.'));
                if (!isNaN(num)) return num * val;
            }
            let base = 1;
            if (prefix.includes('setengah')) return 0.5 * val;
            const wordToNum: Record<string, number> = { 'satu': 1, 'se': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5, 'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9, 'sepuluh': 10 };
            for (const [word, wordVal] of Object.entries(wordToNum)) {
                if (prefix.includes(word)) {
                    base = wordVal;
                    if (prefix.includes('ratus') && key !== 'ratus') base = base * 100;
                    break;
                }
            }
            return base * val;
        }
    }
    const rawMatch = clean.replace(/\./g, '').match(/\d+/);
    if (rawMatch) return parseInt(rawMatch[0], 10);
    return null;
};

const parseHeirs = (text: string): string => {
    const lower = text.toLowerCase();
    const heirMappings = [
        { keys: ['suami'], id: 'husband' }, { keys: ['istri', 'bini'], id: 'wife' },
        { keys: ['anak laki', 'putra', 'cowok'], id: 'son' }, { keys: ['anak perempuan', 'putri', 'cewek'], id: 'daughter' },
        { keys: ['ayah', 'bapak'], id: 'father' }, { keys: ['ibu', 'mamah', 'mama', 'bunda'], id: 'mother' },
        { keys: ['saudara laki', 'abang', 'kakak laki'], id: 'fullBrother' }, { keys: ['saudara perempuan', 'kakak perempuan'], id: 'fullSister' },
        { keys: ['kakek'], id: 'grandfather' }, { keys: ['nenek'], id: 'paternalGrandmother' },
        { keys: ['cucu laki'], id: 'grandson' }, { keys: ['cucu perempuan'], id: 'granddaughter' }
    ];
    const result: string[] = [];
    heirMappings.forEach(map => {
        const matchedKey = map.keys.find(k => lower.includes(k));
        if (matchedKey) {
            let count = 1;
            if (lower.includes(`dua ${matchedKey}`)) count = 2;
            else if (lower.includes(`tiga ${matchedKey}`)) count = 3;
            else if (lower.includes(`empat ${matchedKey}`)) count = 4;
            result.push(`${map.id}:${count}`);
        }
    });
    return result.join(',');
};

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error' | 'standby';

export const useNizamyVoice = () => {
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Use ref to track processed text preventing dupes
  const processedTextRef = useRef<string>('');

  const findSurahByFuzzy = (input: string) => {
      const normalizedInput = normalizeText(input);
      for (const [alias, number] of Object.entries(SPECIAL_ALIASES)) {
          if (normalizedInput.includes(normalizeText(alias))) return SURAH_DATA.find(s => s.number === number)!;
      }
      let bestMatch = null;
      let minDistance = Infinity;
      for (const item of SURAH_SEARCH_INDEX) {
          for (const token of item.tokens) {
              if (normalizedInput.includes(token) || token.includes(normalizedInput)) {
                  if (token.length > 3 || normalizedInput === token) {
                      const dist = Math.abs(normalizedInput.length - token.length);
                      if (dist < minDistance) { minDistance = dist; bestMatch = item.surah; }
                      continue;
                  }
              }
              if (normalizedInput.length > 3) {
                  const dist = levenshteinDistance(normalizedInput, token);
                  if (dist <= Math.max(1, Math.floor(token.length * 0.35)) && dist < minDistance) {
                      minDistance = dist;
                      bestMatch = item.surah;
                  }
              }
          }
      }
      return bestMatch;
  };

  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    if (!lowerText || lowerText.length < 2) return null;

    let targetUrl = '';
    let responseText = '';

    // --- LOGIC PRIORITIES ---
    
    // 1. GLOBAL SEARCH INTENT (Explicit "Cari ...")
    if (lowerText.startsWith('cari') || lowerText.startsWith('temukan')) {
        const query = lowerText.replace(/^(cari|temukan)\s+/, '').trim();
        // Ignore if query is just empty or too short
        if (query.length > 2) {
            targetUrl = `/mushaf?q=${encodeURIComponent(query)}`;
            responseText = `Mencari "${query}" di Al-Quran`;
            return { url: targetUrl, text: responseText };
        }
    }

    // 2. Zakat
    if (lowerText.includes('zakat') || lowerText.includes('jakat')) {
        const numVal = parseIndonesianNumber(lowerText);
        let type = 'maal';
        if (lowerText.match(/fitrah|beras|jiwa/)) type = 'fitrah';
        else if (lowerText.match(/emas|logam|perak/)) type = 'gold';
        else if (lowerText.match(/dagang|niaga|bisnis/)) type = 'business';
        else if (lowerText.match(/tani|panen|sawah/)) type = 'agri';
        else if (lowerText.match(/ternak|sapi|kambing/)) type = 'livestock';

        if (numVal && lowerText.includes('hitung')) {
            targetUrl = `/zakat?action=calculate&type=${type}&amount=${numVal}`;
            responseText = `Menghitung Zakat ${type === 'gold' ? 'Emas' : type === 'fitrah' ? 'Fitrah' : 'Maal'}...`;
        } else {
            targetUrl = `/zakat?tab=${type}`;
            responseText = `Membuka Zakat ${type === 'gold' ? 'Emas' : type === 'fitrah' ? 'Fitrah' : 'Maal'}`;
        }
    }
    // 3. Waris
    else if (lowerText.includes('waris') || lowerText.includes('faraidh')) {
        const numVal = parseIndonesianNumber(lowerText);
        if (lowerText.includes('hitung') || numVal || lowerText.includes('anak')) {
             const params = new URLSearchParams();
             if (numVal) params.append('estate', String(numVal));
             const heirs = parseHeirs(lowerText);
             if (heirs) params.append('heirs', heirs);
             targetUrl = `/faraidh?${params.toString()}`;
             responseText = numVal ? `Menghitung Waris...` : `Menyiapkan form waris`;
        } else {
             targetUrl = '/faraidh';
             responseText = "Membuka Waris";
        }
    }
    // 4. Hafalan
    else if (lowerText.match(/hafalan|murajaah|hafal|srs/)) { 
        targetUrl = '/hafalan'; 
        responseText = "Membuka Hafalan"; 
    }
    // 5. Amal Yaumi
    else if (lowerText.match(/amal|yaumi|ibadah|harian|daily/)) { 
        targetUrl = '/amal'; 
        responseText = "Membuka Amal Yaumi"; 
    }
    // 6. HEDE / Financial
    else if (lowerText.match(/halal|audit|ekonomi|klinik|hede/)) { 
        targetUrl = '/hede'; 
        responseText = "Membuka Klinik Finansial"; 
    }
    // 7. Sholat & Kiblat
    else if (lowerText.match(/kiblat|arah|kompas|qibla/)) {
         targetUrl = '/sholat?tab=qibla';
         responseText = "Membuka Kompas Kiblat";
    }
    else if (lowerText.match(/sholat|solat|jadwal|waktu/)) {
         targetUrl = '/sholat?tab=calendar';
         responseText = "Membuka Jadwal Sholat";
    }
    // 8. Beranda
    else if (lowerText.match(/beranda|home|depan|menu utama/)) { 
        targetUrl = '/'; 
        responseText = "Ke Beranda"; 
    }
    // 9. Mushaf (Open Specific Surah/Ayah)
    else {
        // Try parsing surah command like "Buka Surat Yasin" or just "Yasin"
        // We strip common words to isolate the query
        let rawQuery = lowerText.replace(/\b(buka|baca|surat|surah|ayat|qs|ke|yang|namanya)\b/g, '').trim();
        
        let ayahNumber: number | null = null;
        
        // Check for ayah number pattern first
        const numberMatch = rawQuery.match(/\d+/);
        if (numberMatch) {
            // Check if user said "Ayat 5"
            if (lowerText.includes('ayat')) {
                 const parts = lowerText.split('ayat');
                 // Check right side of 'ayat'
                 if (parts[1]) ayahNumber = parseIndonesianNumber(parts[1]);
                 // Remove the number from query for surah search
                 rawQuery = rawQuery.replace(numberMatch[0], '').trim();
            } else {
                 // Or just appended number "Al Baqarah 5"
                 // This is risky, could be Surah 5. But usually people say name then number.
                 // We'll treat trailing number as ayah if we find a surah match
                 ayahNumber = parseInt(numberMatch[0]);
                 rawQuery = rawQuery.replace(numberMatch[0], '').trim();
            }
        }

        const surah = findSurahByFuzzy(rawQuery);
        if (surah) {
            // Handle special cases aliases mapping to specific ayah (e.g. Ayat Kursi)
            if (!ayahNumber) {
                const aliasKey = normalizeText(rawQuery);
                if (aliasKey.includes('kursi')) ayahNumber = 255;
                else if (aliasKey.includes('seribu dinar')) ayahNumber = 2;
            }
            targetUrl = `/mushaf?surah=${surah.number}${ayahNumber ? `&ayah=${ayahNumber}` : ''}`;
            responseText = `Membuka ${surah.name} ${ayahNumber ? `Ayat ${ayahNumber}` : ''}`;
        }
    }

    if (targetUrl && responseText) {
        return { url: targetUrl, text: responseText };
    }
    return null;
  };

  const startListening = useCallback(() => {
    setFeedback(null);
    setTranscript('');
    processedTextRef.current = '';
    setStatus('listening');
    audioService.playClick();

    voiceService.start(
        (text, isFinal) => {
            setTranscript(text);
            
            if (isFinal) {
                // Prevent duplicate processing of the same command
                if (text === processedTextRef.current) return;
                processedTextRef.current = text;

                setStatus('processing');
                
                // Simulate processing delay for better UX feel
                setTimeout(() => {
                    const result = processCommand(text);
                    if (result) {
                        setStatus('success');
                        setFeedback(result.text);
                        audioService.playSuccess();
                        
                        // DELAY NAVIGATION: Biarkan user membaca feedback "Sukses" sejenak
                        setTimeout(() => {
                            // Stop service completely before navigation
                            stopListening();
                            navigate(result.url);
                        }, 1500);
                    } else {
                        setStatus('error');
                        setFeedback("Maaf, perintah tidak dikenali.");
                        audioService.playFail();
                        
                        // Return to standby so user can try again
                        setTimeout(() => {
                            setStatus('standby');
                            setFeedback(null);
                        }, 2000);
                    }
                }, 500);
            }
        },
        (error) => {
            // Jika not allowed, langsung idle agar tidak freeze UI
            if (error === 'not-allowed' || error === 'service-not-allowed') {
                setStatus('idle');
            } else {
                // Error lain (no speech, network) masuk standby
                // Check if we are currently 'listening' before changing state to avoid race conditions
                if (status === 'listening') setStatus('standby');
            }
        },
        () => {
            // On End (Microphone off)
            // Wait slightly to ensure no pending result is being processed
            setTimeout(() => {
                setStatus(prev => {
                    // Jika sesi mati saat listening (biasanya silence timeout browser), masuk standby
                    // Tapi jika sudah 'processing' atau 'success', jangan ubah.
                    if (prev === 'listening' && !processedTextRef.current) return 'standby';
                    return prev;
                });
            }, 300);
        }
    );
  }, [navigate, status]);

  const stopListening = useCallback(() => {
    voiceService.stop(); 
    setStatus('idle');
    setTranscript('');
    setFeedback(null);
    processedTextRef.current = '';
  }, []);

  return {
    isListening: status !== 'idle',
    status,
    transcript,
    feedback,
    startListening,
    stopListening,
    isSupported: voiceService.checkSupport()
  };
};
