
import { generatePdfFromHtml, pdfStyles as styles } from '../../../services/pdf.service.ts';
import { formatDate } from '../../../utils.ts';

export type ContractType = 'qardh' | 'mudharabah' | 'taubat';

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
                <strong>Definisi:</strong> Akad pinjaman dana kepada pihak lain tanpa imbalan (bunga/tambahan), yang wajib dikembalikan pokoknya saja pada waktu yang disepakati.
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
                <li>Akad ini <strong>BEBAS BUNGA/RIBA</strong>. Muqtaridh hanya wajib mengembalikan pokok pinjaman.</li>
                <li>Segala kelebihan pembayaran yang diberikan Muqtaridh secara sukarela saat pelunasan (tanpa dipersyaratkan di awal) adalah HALAL (Hadiah/Hibah).</li>
                <li>Jika terjadi keterlambatan karena kesulitan (bukan kelalaian), Muqridh dianjurkan memberi tangguh waktu (QS. Al-Baqarah: 280).</li>
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
