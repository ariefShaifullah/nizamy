# Nizamy — Kalkulator Waris Islam

Sistem perhitungan pembagian harta waris berdasarkan syariat Islam (fiqh waris) sesuai Jumhur Ulama, dengan penyesuaian KHI untuk konteks Indonesia.

## Language

**Ahli Waris**:
Orang yang berhak menerima bagian harta warisan berdasarkan ketentuan Al-Qur'an dan As-Sunnah.
_Avoid_: Waris, pewaris (latter means the deceased)

**Furudh**:
Bagian tetap (fixed share) yang telah ditentukan dalam Al-Qur'an, seperti 1/2, 1/4, 1/8, 1/6, 1/3, 2/3.
_Avoid_: Bagian pokok, fixed portion

**Ashabah**:
Ahli waris yang mendapatkan sisa harta setelah bagian Furudh dibagikan. Perbandingan laki-laki:perempuan = 2:1.
_Avoid_: Residuary, sisa (use "sisa harta" for the estate remainder)

**Hajb**:
Penghalangan — kondisi di mana ahli waris yang lebih dekat menghalangi (menghapus) hak ahli waris yang lebih jauh.
_Avoid_: Blocking, deprivation

**'Aul**:
Kasus di mana total Furudh melebihi 1 kesatuan harta. Penyebut dinaikkan menjadi sama dengan total pembilang (proportional reduction).
_Avoid_: Oversubscription, pro-rata reduction

**Radd**:
Kasus di mana total Furudh kurang dari 1 dan tidak ada Ashabah. Sisa dikembalikan ke ahli waris Furudh selain pasangan.
_Avoid_: Return, surplus return

**Umariyyatain**:
Dua kasus khusus (Suami+Ayah+Ibu atau Istri+Ayah+Ibu) di mana Ibu mendapat 1/3 dari sisa setelah bagian pasangan, bukan 1/3 total.
_Avoid_: Gharrawain (use for the husband variant specifically)

**Akdariyyah**:
Kasus khusus (Suami+Ibu+Kakek+Saudari Kandung) di mana Kakek dan Saudari berbagi sisa dengan perbandingan 2:1 setelah 'Aul.
_Avoid_: Al-Akdariyyah variant naming

**Musytarakah**:
Kasus di mana saudara kandung laki-laki yang terhalang oleh saudara seibu berserikat dalam bagian 1/3 saudara seibu (putusan Umar).
_Avoid_: Partner case, sharing case

**Asl Al-Masalah**:
Penyebut terkecil (KPK) dari semua penyebut bagian Furudh — dasar perhitungan pembagian.
_Avoid_: Original problem, base denominator

**Siham**:
Jumlah "porsi" yang diterima setiap ahli waris setelah dikonversi ke Asl Al-Masalah.
_Avoid_: Portions, shares count

**Mahjub**:
Ahli waris yang terhalang (hajb) sehingga tidak menerima bagian apapun.
_Avoid_: Blocked, excluded

**Baitul Mal**:
Lembaga amanah yang menerima harta waris ketika tidak ada ahli waris yang berhak.
_Avoid_: Treasury, public fund

## Flagged ambiguities

- **"Bagian"** can mean either the Furudh fraction (1/2, 1/6) or the actual monetary value. In UI: use "porsi" for fraction, "nilai" for monetary amount.

## Example dialogue

> **Dev**: Saudari Seayah terhalang karena 2 Saudari Kandung sudah mengambil 2/3.
> **Fiqh Expert**: Benar, itu Hajb Nuqshan — dia terhalang sebagian. Tapi kalau ada Saudara Seayah, dia jadi Ashabah bil Ghairi. Apakah kalkulator menangani "The Lucky Brother"?
> **Dev**: Ya, di `faraidh-hajb.ts` baris 127 — Saudari Seayah TIDAK terhalang jika ada Saudara Seayah meskipun 2 Saudari Kandung ada.
