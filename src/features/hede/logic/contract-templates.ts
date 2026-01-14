import { generatePdfFromHtml, pdfStyles as styles } from '../../../services/pdf.service.ts';
import { formatDate } from '../../../utils.ts';

export type ContractType = 'qardh' | 'mudharabah' | 'taubat' | 'musyarakah' | 'wakalah' | 'ijarah' | 'loan_payoff' | 'tathhir_guide';

export const generateContractPdf = async (type: ContractType) => {
    const dateStr = formatDate(new Date().toISOString());
    let title = '';
    let content = '';
    let filename = '';

    if (type === 'qardh') {
        title = "Akad Qardh (Pinjaman Kebajikan)";
        filename = "Template_Akad_Qardh.pdf";
        content = `
            <div style="background:#f8fafc; padding:15px; border-left:4px solid #3b82f6; margin-bottom:20px;">
                <strong>Definisi:</strong> Akad pinjaman dana kepada pihak lain tanpa imbalan (bunga/tambahan), yang wajib dikembalikan pokoknya saja pada waktu yang disepakati. Tujuan akad ini adalah Ta'awun (Tolong menolong), bukan mencari keuntungan komersial.
            </div>

            <h3 style="${styles.sectionTitle}">PIHAK YANG BERAKAD</h3>
            <div style="margin-bottom:15px;">
                <p><strong>1. PEMBERI PINJAMAN (Muqridh):</strong></p>
                <p>Nama: .................................................................</p>
                <p>NIK/KTP: ..............................................................</p>
            </div>
            <div style="margin-bottom:15px;">
                <p><strong>2. PENERIMA PINJAMAN (Muqtaridh):</strong></p>
                <p>Nama: .................................................................</p>
                <p>NIK/KTP: ..............................................................</p>
            </div>

            <h3 style="${styles.sectionTitle}">ISI KESEPAKATAN</h3>
            <ol style="margin-left:20px; line-height:1.6;">
                <li>Muqridh memberikan pinjaman uang sebesar <strong>Rp ........................</strong> kepada Muqtaridh.</li>
                <li>Muqtaridh berjanji akan mengembalikan pinjaman tersebut selambat-lambatnya pada tanggal <strong>........................</strong>.</li>
                <li>Akad ini <strong>MURNI TANPA BUNGA</strong>. Jumlah pengembalian sama persis dengan jumlah pinjaman.</li>
                <li>Tidak diperjanjikan adanya tambahan, hadiah, atau manfaat lain atas pinjaman ini karena termasuk Riba.</li>
                <li>Jika terjadi keterlambatan karena kesulitan ekonomi yang nyata (bukan kelalaian), Muqridh dianjurkan memberi tangguh waktu (QS. Al-Baqarah: 280).</li>
            </ol>

            <div style="margin-top:50px; display:flex; justify-content:space-between;">
                <div style="text-align:center; width:40%;">
                    <p>Muqridh</p>
                    <br/><br/><br/>
                    <p>( ........................... )</p>
                </div>
                <div style="text-align:center; width:40%;">
                    <p>Muqtaridh</p>
                    <br/><br/><br/>
                    <p>( ........................... )</p>
                </div>
            </div>
            <div style="text-align:center; margin-top:30px;">
                <p>Saksi-Saksi:</p>
                <br/><br/>
                <p>( ........................... ) &nbsp;&nbsp;&nbsp;&nbsp; ( ........................... )</p>
            </div>
        `;
    } else if (type === 'mudharabah') {
        title = "Akad Mudharabah (Bagi Hasil)";
        filename = "Template_Akad_Mudharabah.pdf";
        content = `
            <div style="background:#f8fafc; padding:15px; border-left:4px solid #10b981; margin-bottom:20px;">
                <strong>Definisi:</strong> Kerjasama usaha antara pemilik modal (Shahibul Maal) dan pengelola (Mudharib) dengan pembagian keuntungan sesuai nisbah yang disepakati.
            </div>

            <h3 style="${styles.sectionTitle}">PIHAK YANG BERAKAD</h3>
            <div style="margin-bottom:15px;">
                <p><strong>1. PEMILIK MODAL (Shahibul Maal):</strong></p>
                <p>Nama: .................................................................</p>
            </div>
            <div style="margin-bottom:15px;">
                <p><strong>2. PENGELOLA (Mudharib):</strong></p>
                <p>Nama: .................................................................</p>
            </div>

            <h3 style="${styles.sectionTitle}">POKOK KERJASAMA</h3>
            <ul style="list-style:none; padding:0; line-height:1.6;">
                <li><strong>Jenis Usaha:</strong> .................................................................</li>
                <li><strong>Modal Disetor:</strong> Rp .................................................................</li>
                <li><strong>Jangka Waktu:</strong> .................................................................</li>
            </ul>

            <h3 style="${styles.sectionTitle}">NISBAH BAGI HASIL (KEUNTUNGAN)</h3>
            <p>Keuntungan bersih (Net Profit) akan dibagi dengan proporsi:</p>
            <ul style="margin-left:20px;">
                <li><strong>Pihak Pertama (Pemodal):</strong> ........... %</li>
                <li><strong>Pihak Kedua (Pengelola):</strong> ........... %</li>
            </ul>

            <h3 style="${styles.sectionTitle}">RISIKO KERUGIAN</h3>
            <p style="text-align:justify;">
                Sesuai syariah, kerugian finansial (modal berkurang) ditanggung sepenuhnya oleh <strong>Pemilik Modal</strong>, kecuali jika terbukti kerugian tersebut akibat kelalaian, kecurangan, atau pelanggaran akad oleh Pengelola. Pengelola menanggung kerugian waktu dan tenaga.
            </p>

            <div style="margin-top:50px; display:flex; justify-content:space-between;">
                <div style="text-align:center; width:40%;">
                    <p>Pemilik Modal</p>
                    <br/><br/><br/>
                    <p>( ........................... )</p>
                </div>
                <div style="text-align:center; width:40%;">
                    <p>Pengelola</p>
                    <br/><br/><br/>
                    <p>( ........................... )</p>
                </div>
            </div>
        `;
    } else if (type === 'taubat') {
        title = "Ikrar Bara'ah (Pernyataan Berlepas Diri)";
        filename = "Ikrar_Hijrah.pdf";
        content = `
            <div style="text-align:center; margin-bottom:30px;">
                <h2 style="font-family:serif; margin-bottom:10px;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</h2>
            </div>

            <p style="text-align:justify; line-height:1.8;">
                Dengan memohon Taufik dan Hidayah Allah SWT, saya yang bertanda tangan di bawah ini:
            </p>
            <p>Nama: .................................................................</p>
            
            <p style="text-align:justify; line-height:1.8; margin-top:20px;">
                Menyatakan dengan sesungguhnya bahwa saya <strong>BERTAUBAT</strong> dan <strong>BERLEPAS DIRI (BARA'AH)</strong> dari segala bentuk transaksi Riba, Gharar, Maysir, dan transaksi batil lainnya yang pernah saya lakukan.
            </p>

            <h3 style="${styles.sectionTitle}">KOMITMEN HIJRAH</h3>
            <ol style="margin-left:20px; line-height:1.8;">
                <li>Saya berjanji untuk tidak mengulangi transaksi yang dilarang Syariat Islam.</li>
                <li>Saya akan berusaha sekuat tenaga untuk menyelesaikan sisa tanggungan/utang ribawi yang masih berjalan (jika ada) sesegera mungkin.</li>
                <li>Saya akan membersihkan harta saya (Tathhirul Mal) dari pendapatan yang tidak halal.</li>
                <li>Saya memohon ampunan Allah atas ketidaktahuan atau kelalaian saya di masa lalu.</li>
            </ol>

            <div style="background:#fff7ed; padding:15px; border:1px solid #fdba74; margin-top:30px; border-radius:8px; text-align:center;">
                <em>"Orang yang bertaubat dari dosa seperti orang yang tidak berdosa."</em><br/>
                (HR. Ibnu Majah)
            </div>

            <div style="margin-top:50px; text-align:right;">
                <p>${dateStr}</p>
                <br/><br/><br/>
                <p>( ........................... )</p>
                <p style="font-size:10px;">Hamba Allah</p>
            </div>
        `;
    } else if (type === 'musyarakah') {
        title = "Akad Musyarakah (Kerja Sama Modal)";
        filename = "Template_Akad_Musyarakah.pdf";
        content = `
             <div style="background:#f0f9ff; padding:15px; border-left:4px solid #38bdf8; margin-bottom:20px;">
                <strong>Definisi:</strong> Kerjasama usaha di mana semua pihak menyetorkan modal (Syirkah 'Inan). Keuntungan dibagi sesuai kesepakatan, kerugian dibagi proporsional sesuai modal.
            </div>

            <h3 style="${styles.sectionTitle}">PARA PIHAK (SYURAKA)</h3>
            <p>1. Pihak A: ........................ (Modal: Rp ........................)</p>
            <p>2. Pihak B: ........................ (Modal: Rp ........................)</p>
            <p>3. Pihak C: ........................ (Modal: Rp ........................)</p>
            <p><em>(Tambah atau kurangi sesuai kebutuhan)</em></p>
            
            <h3 style="${styles.sectionTitle}">POKOK KERJASAMA</h3>
            <p><strong>Jenis Usaha:</strong> .................................................................</p>
            
            <h3 style="${styles.sectionTitle}">NISBAH BAGI HASIL (KEUNTUNGAN)</h3>
            <p>Pihak A: ....% | Pihak B: ....% | Pihak C: ....%</p>
            
            <h3 style="${styles.sectionTitle}">PEMBAGIAN KERUGIAN</h3>
            <p>Kerugian dibagi secara proporsional sesuai porsi modal masing-masing pihak.</p>
        `;
    } else if (type === 'wakalah') {
        title = "Akad Wakalah bil Ujrah (Agensi)";
        filename = "Template_Akad_Wakalah.pdf";
        content = `
            <div style="background:#ecfdf5; padding:15px; border-left:4px solid #34d399; margin-bottom:20px;">
                <strong>Definisi:</strong> Pelimpahan wewenang dari satu pihak (Muwakkil) kepada pihak lain (Wakil/Agen) untuk melakukan tugas tertentu dengan imbalan upah (Ujrah). Solusi untuk Dropshipper.
            </div>

            <h3 style="${styles.sectionTitle}">PARA PIHAK</h3>
            <p><strong>1. PEMBERI KUASA (Muwakkil/Supplier):</strong> ........................</p>
            <p><strong>2. PENERIMA KUASA (Wakil/Dropshipper):</strong> ........................</p>

            <h3 style="${styles.sectionTitle}">OBJEK PERWAKILAN</h3>
            <p>Muwakkil memberikan kuasa kepada Wakil untuk memasarkan dan menjual produk ........................ milik Muwakkil.</p>
            
            <h3 style="${styles.sectionTitle}">UPAH (UJRAH)</h3>
            <p>Atas jasanya, Wakil berhak mendapatkan upah sebesar <strong>Rp ........................</strong> atau <strong>...........%</strong> dari setiap produk yang berhasil dijual.</p>
        `;
    } else if (type === 'ijarah') {
        title = "Akad Ijarah (Jasa & Sewa)";
        filename = "Template_Akad_Ijarah.pdf";
        content = `
            <div style="background:#f1f5f9; padding:15px; border-left:4px solid #64748b; margin-bottom:20px;">
                <strong>Definisi:</strong> Akad sewa-menyewa atau kontrak kerja atas suatu jasa/manfaat yang jelas dengan upah yang jelas.
            </div>

            <h3 style="${styles.sectionTitle}">PARA PIHAK</h3>
            <p><strong>1. PEMBERI KERJA/SEWA (Musta'jir):</strong> ........................</p>
            <p><strong>2. PEKERJA/PENYEDIA JASA (Ajir):</strong> ........................</p>

            <h3 style="${styles.sectionTitle}">OBJEK AKAD</h3>
            <p><strong>Jasa/Manfaat yang Diberikan:</strong> .................................................................</p>
            <p><strong>Durasi:</strong> .................................................................</p>
            
            <h3 style="${styles.sectionTitle}">UPAH (UJRAH)</h3>
            <p>Musta'jir wajib membayar upah sebesar <strong>Rp ........................</strong> kepada Ajir.</p>
        `;
    } else if (type === 'loan_payoff') {
        title = "Surat Niat Pelunasan Dipercepat";
        filename = "Surat_Niat_Pelunasan_Riba.pdf";
        content = `
            <p>Kepada Yth,<br/>Pimpinan [Nama Bank/Leasing]<br/>di Tempat</p>
            <br/>
            <p><strong>Perihal: Permohonan Pelunasan Dipercepat dan Penghapusan Denda/Bunga Berjalan</strong></p>
            <br/>
            <p>Dengan hormat,<br/>Saya yang bertanda tangan di bawah ini:</p>
            <p>Nama: .................................................................</p>
            <p>No. Kontrak: ........................................................</p>
            <br/>
            <p>Dengan ini mengajukan permohonan untuk melakukan pelunasan dipercepat atas sisa pokok utang saya. Saya memohon kebijakan dari pihak [Bank/Leasing] untuk dapat menghapuskan sisa bunga berjalan dan/atau denda keterlambatan, sebagai bagian dari ikhtiar saya untuk terbebas dari transaksi ribawi.</p>
            <br/>
            <p>Hormat saya,</p>
            <br/><br/><br/>
            <p>(...........................)</p>
        `;
    } else if (type === 'tathhir_guide') {
        title = "Panduan Praktis Tathhirul Mal";
        filename = "Panduan_Tathhirul_Mal.pdf";
        content = `
            <div style="background:#fffbeb; padding:15px; border:1px solid #fcd34d; border-radius:8px; margin-bottom:20px;">
                <strong>PENTING:</strong> Dana non-halal (bunga, hasil judi, dll) <strong>BUKAN MILIK ANDA</strong>. Dana ini wajib dikeluarkan dari harta Anda, namun <strong>TIDAK BOLEH diniatkan sebagai sedekah</strong> dan tidak mendapat pahala sedekah. Niatkan sebagai bentuk taubat dan melepaskan hak orang lain.
            </div>

            <h3 style="${styles.sectionTitle}">PRIORITAS PENYALURAN DANA NON-HALAL</h3>
            <p>Menurut mayoritas ulama kontemporer, dana ini disalurkan untuk <strong>kemaslahatan/fasilitas umum</strong> yang bisa dimanfaatkan oleh siapa saja (muslim maupun non-muslim). Tujuannya adalah membuang 'kotoran' tersebut ke tempat yang paling umum.</p>
            
            <ol style="margin-left:20px; line-height:1.8;">
                <li><strong>Toilet Umum:</strong> Pembangunan atau perbaikan WC di pasar, terminal, atau masjid (area luar).</li>
                <li><strong>Perbaikan Infrastruktur:</strong> Menambal jalan berlubang, memperbaiki jembatan desa, atau membuat saluran air.</li>
                <li><strong>Fasilitas Kebersihan:</strong> Menyediakan tempat sampah umum.</li>
                <li><strong>Diberikan kepada Fakir Miskin:</strong> Ini adalah pilihan terakhir jika fasilitas umum tidak memungkinkan, dengan catatan tetap tidak boleh diniatkan sebagai sedekah, melainkan hanya sebagai bentuk pelepasan beban.</li>
            </ol>

             <h3 style="${styles.sectionTitle}">YANG DILARANG</h3>
             <ul style="margin-left:20px; line-height:1.8; color:#b91c1c;">
                <li>Membangun bagian inti masjid (ruang shalat, mihrab).</li>
                <li>Membeli Al-Quran, mukena, atau perlengkapan ibadah.</li>
                <li>Digunakan untuk makan, minum, atau kebutuhan pribadi.</li>
             </ul>
        `;
    }

    const html = `
        <div style="padding: 40px; font-family: sans-serif; color: #1e293b;">
            <div style="${styles.header}">
                <div>
                    <h1 style="${styles.title}; font-size:24px;">${title}</h1>
                    <p style="${styles.subtitle}">Dokumen Pendukung - Toolkit Hijrah NIZAMY</p>
                </div>
                <div style="text-align: right;">
                    <img src="/images/icon.svg" style="width:40px; opacity:0.5;" />
                </div>
            </div>
            
            ${content}

            <div style="${styles.footer}">
                Template ini disediakan oleh NIZAMY sebagai alat bantu. <br/>
                Untuk kekuatan hukum negara, silakan lengkapi dengan materai dan tanda tangan saksi sesuai perundang-undangan yang berlaku.
            </div>
        </div>
    `;

    await generatePdfFromHtml(html, filename);
};