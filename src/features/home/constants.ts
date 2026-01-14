// Hadith Database organized by time of day
export const HADITH_DB = {
    late_night: [
        { text: "Rabb kita turun ke langit dunia pada sepertiga malam yang akhir dan berfirman: 'Siapa yang berdoa kepada-Ku, maka Aku akan mengabulkannya.'", narrator: "HR. Bukhari & Muslim" },
        { text: "Sebaik-baik shalat setelah shalat fardhu adalah shalat malam (Tahajjud).", narrator: "HR. Muslim" },
        { text: "Dua rakaat fajar (qobliyah subuh) lebih baik daripada dunia dan seisinya.", narrator: "HR. Muslim" }
    ],
    morning: [
        { text: "Berpagi-pagilah dalam mencari rezeki, karena sesungguhnya berpagi-pagi itu adalah keberkahan.", narrator: "HR. Ath-Thabrani" },
        { text: "Ya Allah, berkahilah umatku di waktu paginya.", narrator: "HR. Abu Daud" },
        { text: "Wahai anak Adam, janganlah engkau tinggalkan empat raka'at di awal siang (Dhuha). Maka Aku akan mencukupimu di akhir siang.", narrator: "HR. Tirmidzi" }
    ],
    day: [
        { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", narrator: "HR. Ahmad" },
        { text: "Tangan di atas (memberi) lebih baik daripada tangan di bawah (meminta).", narrator: "HR. Bukhari" },
        { text: "Sesungguhnya Allah suka apabila seseorang dari kamu melakukan pekerjaan, ia menekuninya (Itqan).", narrator: "HR. Al-Baihaqi" }
    ],
    afternoon: [
        { text: "Barangsiapa yang tidak menyayangi, maka tidak akan disayangi.", narrator: "HR. Al-Bukhari" },
        { text: "Senyummu di hadapan saudaramu adalah sedekah bagimu.", narrator: "HR. Tirmidzi" },
        { text: "Bertaqwalah kepada Allah di mana saja engkau berada.", narrator: "HR. Tirmidzi" }
    ],
    night: [
        { text: "Barangsiapa membaca dua ayat terakhir dari surat Al-Baqarah pada malam hari, maka itu mencukupinya (melindunginya).", narrator: "HR. Bukhari & Muslim" },
        { text: "Dirikanlah shalat malam, karena itu adalah kebiasaan orang-orang saleh sebelum kamu dan penghapus dosa.", narrator: "HR. Tirmidzi" },
        { text: "Cukuplah Allah sebagai Penolong kami, dan Allah adalah sebaik-baik Pelindung.", narrator: "HR. Bukhari" }
    ]
};

export type HadithCategory = keyof typeof HADITH_DB;

export interface Hadith {
    text: string;
    narrator: string;
}

export const getDynamicHadith = (): Hadith => {
    const hour = new Date().getHours();
    let category: HadithCategory = 'night';

    if (hour >= 0 && hour < 4) category = 'late_night';
    else if (hour >= 4 && hour < 10) category = 'morning';
    else if (hour >= 10 && hour < 15) category = 'day';
    else if (hour >= 15 && hour < 18) category = 'afternoon';

    const list = HADITH_DB[category];
    const dateNum = new Date().getDate();
    return list[dateNum % list.length];
};

export const getGregorianDate = (): string => {
    return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
