# SakuArab — Kamus Arab Digital SMK MUHAPEN

SakuArab adalah frontend kamus Arab untuk siswa **SMK Muhammadiyah Pencongan**. Cover aplikasi mencantumkan sekolah dan pengembang **Sultan Bagus Permadi**. Aplikasi dibuat dengan HTML, CSS, dan JavaScript vanilla tanpa backend atau proses build.

## Menjalankan aplikasi

Karena kosakata dimuat menggunakan `fetch('./words.json')`, jalankan lewat server statis lokal—jangan membuka `index.html` langsung menggunakan `file://`.

### Opsi 1 — Python

```bash
python -m http.server 8000
```

Buka `http://localhost:8000`.

### Opsi 2 — Node.js

```bash
npx serve .
```

Buka alamat lokal yang muncul di terminal. Untuk menghentikan server, tekan `Ctrl+C`.

## Fitur

- Pencarian langsung pada kata Arab, arti Indonesia, transliterasi, kategori, dan contoh; pencarian Arab tetap bisa cocok saat harakat tidak ditulis.
- Filter Semua, RPL, TBKR, Akuntansi, TSM, serta daftar kata tersimpan.
- Detail kosakata, contoh kalimat, dan favorit yang disimpan lokal.
- Personalisasi ukuran kata Arab (22–48 px), lima pilihan font, kepadatan kartu, empat warna aksen, dan tema otomatis/terang/gelap.
- Preferensi tampilan dan favorit disimpan menggunakan `localStorage` di browser/perangkat yang sama.
- Layout responsif, focus state, modal yang dapat ditutup dengan Escape, dan dukungan `prefers-reduced-motion`.

## Struktur berkas

```text
kamus-arab-smk/
├── index.html
├── styles.css
├── app.js
├── words.json
└── README.md
```

## Struktur data dan asumsi

- `words.json` asli tetap dipertahankan. Format per jurusan pada sumber adalah daftar array enam kolom: `[arab, transliterasi, arti, kategori, contoh_arab, contoh_indonesia]`. Kode juga memiliki fallback defensif untuk objek dengan properti bernama.
- Daftar utama dibatasi pada empat jurusan yang diminta: `RPL`, `TBKR`, `Akuntansi`, dan `TSM`. Kunci lain seperti `Umum`, `Mirip`, dan `_meta` tetap berada dalam berkas, tetapi tidak ditampilkan sebagai jurusan tambahan.
- Cover dan pratinjau font menggunakan entri yang benar-benar dibaca dari `words.json`; aplikasi tidak menambah kosakata ke koleksi.
- ID favorit berasal dari nama jurusan dan posisi entri. Tambahkan kata di akhir daftar jurusan agar ID kata lama tetap stabil.
- Google Fonts digunakan untuk DM Sans dan pilihan font Arab jika internet tersedia. Jika font web tidak dapat dimuat, browser menggunakan font fallback yang ditentukan.
- Semua data kamus dibaca dari file JSON lokal. `localStorage` hanya digunakan untuk preferensi tampilan dan ID favorit.
