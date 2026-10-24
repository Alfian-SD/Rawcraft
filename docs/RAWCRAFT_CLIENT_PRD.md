# PRD — Rawcraft Client (Built-in Mod Client)

> **Versi:** 1.0 · **Target game:** Minecraft 26.2 (Fabric) · **Bahasa UI:** Inggris (default) + Indonesia
> **Pelaksana:** Antigravity (AI coding agent) · **Tujuan akhir:** semua fitur *benar-benar berfungsi*, UI rapi, siap dipakai pemain tanpa bug.

---

## 0. Cara membaca dokumen ini

- **P0** = wajib selesai agar rilis layak. **P1** = sebaiknya ada. **P2** = bonus bila waktu ada.
- Nama class/method Minecraft/Fabric di dokumen ini hanya **petunjuk konsep**. Minecraft 26.x memakai versi baru dan API-nya sering berubah. Agent **wajib memverifikasi** ke source Minecraft 26.2 yang tersedia di project (mis. `./gradlew genSources`) dan dokumentasi Fabric API terbaru, bukan menebak dari ingatan.
- Setiap fitur punya **Acceptance Criteria (AC)**. Fitur dianggap selesai hanya jika semua AC lolos **di dalam game yang benar-benar dijalankan** (`./gradlew runClient` atau task yang setara), bukan hanya "kode compile".

---

## 1. Ringkasan masalah (hasil audit 5 screenshot)

Mod client saat ini punya 5 tab: **Home, Performance, HUD Studio, Modules, Settings**, dibuka dengan **Right Shift**, tampil di atas layar game yang diblur. Semua halaman hanya berupa tombol vanilla bertumpuk.

| # | Temuan | Dampak | Solusi di PRD ini |
|---|--------|--------|-------------------|
| 1 | Semua toggle HUD tertulis `[ON]` (FPS, Ping, XYZ, Keystrokes, CPS, Potion, Armor, Crosshair) tapi **tidak ada satu pun HUD yang tampil** di layar | Status UI tidak mencerminkan kenyataan; fitur tidak jalan | Arsitektur modul + HUD renderer nyata (§3), status modul jujur: Active / Disabled / Error (§3.3) |
| 2 | Halaman Home hanya 4 tombol navigasi yang **menduplikasi tab** di atasnya | Tidak ada informasi berguna di halaman utama | Home jadi dashboard: stat live, quick toggle, profil aktif (§5.1) |
| 3 | **Custom Crosshair** dan **Armor Durability** muncul di dua tempat (HUD Studio dan Modules) | Dua sumber kebenaran, rawan tidak sinkron | Satu modul = satu state. HUD = tampilan; Modules = fitur gameplay (§6) |
| 4 | "HUD Studio" hanya punya 1 tombol fungsional: `CYCLE FPS ANCHOR` | Tidak bisa atur posisi/ukuran/warna; bukan "studio" | HUD Editor drag-and-drop dengan live preview (§5.4) |
| 5 | Tab aktif ditandai ASCII `> Home <`; label tombol campur huruf besar semua dan sentence case | Terlihat murah dan tidak konsisten | Design system baru: sidebar, pill aktif, tipografi konsisten (§4) |
| 6 | Hanya ada tombol (cycle/toggle). Tidak ada slider, color picker, dropdown, keybind picker | Pengaturan sangat terbatas | Library komponen UI lengkap (§4.4) |
| 7 | `FACTORY RESET DEFAULTS` dan `RESTORE VANILLA OPTIONS SNAPSHOT` tanpa konfirmasi | Pemain bisa kehilangan setting sekali klik | Dialog konfirmasi (§4.4, §8) |
| 8 | Profil Performance (6 / 10 / 16 chunks) tidak menandai profil yang sedang aktif, dan hanya mengubah chunk | Tidak jelas apa yang berubah | Profil mengubah beberapa opsi, menandai profil aktif / "Custom" (§6.9) |
| 9 | Toast vanilla "Move with W, A, S and D / Jump with Space" menumpuk di pojok kanan atas | Mengganggu layar (bukan bagian mod, tapi tampil di semua screenshot) | Opsional: nonaktifkan tutorial vanilla saat first-run (§8) |
| 10 | Tidak ada preview, tooltip, atau deskripsi per fitur | Pemain tidak tahu fitur melakukan apa | Setiap modul punya deskripsi, tooltip, dan preview (§4, §6) |

---

## 2. Tujuan, prinsip, dan non-goals

### Tujuan
1. Mod client terasa **premium dan konsisten** dengan tema launcher Rawcraft (dark purple).
2. **Setiap tombol/toggle/slider benar-benar bekerja** dan efeknya langsung terlihat di game.
3. Aman dipakai: tidak crash, tidak merusak `options.txt`, tidak ada fitur yang diam-diam gagal.
4. Ringan: overhead mod ≤ 1 ms per frame di mesin menengah dengan semua HUD aktif.

### Prinsip desain
- **Jujur:** UI menampilkan status asli modul, bukan cuma flag `true/false`.
- **Satu sumber kebenaran:** state hanya di `ConfigManager`; UI dan modul hanya membaca/menulisnya.
- **Perubahan langsung:** toggle/slider berlaku seketika (tanpa tombol "Apply"), disimpan otomatis dengan debounce.
- **Bisa dibatalkan:** aksi destruktif selalu ada konfirmasi; ada snapshot setting vanilla.
- **Tidak mengganggu:** HUD tidak tampil di atas layar penuh (inventory, pause) kecuali editor.

### Non-goals (jangan dikerjakan)
- Fitur yang memberi keuntungan tidak adil secara eksplisit (kill aura, reach, x-ray, dsb).
- Mengubah launcher Rawcraft di luar integrasi bundling mod ini.
- Dukungan Forge/NeoForge untuk mod ini (hanya Fabric).

---

## 3. Arsitektur teknis (inti agar fitur berfungsi)

> Dugaan kuat penyebab "semua fitur tidak jalan": state toggle ada di UI, tetapi **tidak ada kode yang membaca state itu untuk menggambar/menjalankan fitur** (HUD render callback tidak terdaftar, mixin tidak aktif, atau modul tidak pernah di-`init`). Fase 0 (§10) wajib membuktikan atau membantah dugaan ini.

### 3.1 Struktur package (usulan, sesuaikan dengan repo)

```
com.rawcraft.client
├─ RawcraftClient.java            // entrypoint (ClientModInitializer)
├─ config/                        // ConfigManager, ConfigData (POJO), migrasi versi
├─ module/                        // Module (abstract), ModuleManager, ModuleStatus, registry
│   ├─ hud/                       // FpsModule, PingModule, CoordsModule, KeystrokesModule,
│   │                             // CpsModule, PotionModule, ArmorModule, CrosshairModule
│   └─ gameplay/                  // FullbrightModule, ToggleSprintModule, WeatherModule
├─ performance/                   // ProfileManager, VanillaSnapshot
├─ hud/                           // HudElement, HudRenderer, Anchor, HudLayout
├─ input/                         // KeybindManager, ClickTracker (CPS)
├─ ui/
│   ├─ theme/                     // Theme (tokens), Fonts, Sprites
│   ├─ widget/                    // Button, Toggle, Slider, Dropdown, KeybindButton,
│   │                             // ColorPicker, TextField, Card, ScrollView, Tooltip, Dialog, Toast
│   ├─ screen/                    // RawcraftScreen (shell), HomePage, PerformancePage,
│   │                             // HudPage, HudEditorScreen, ModulesPage, SettingsPage
│   └─ anim/                      // Animator / easing
├─ mixin/                         // semua mixin (daftar di §3.6)
├─ command/                       // /rawcraft diag, /rawcraft reset
└─ util/                          // Log, Color, MathUtil, Roman numerals, dsb
```

### 3.2 Konfigurasi

- File: `config/rawcraft/client.json` (format JSON, `configVersion` untuk migrasi).
- **Atomic write:** tulis ke `client.json.tmp` lalu rename. Simpan dengan debounce 500 ms setelah perubahan terakhir, dan paksa simpan saat game ditutup.
- Jika file korup/tidak valid: pindahkan ke `client.json.broken-<timestamp>`, pakai default, tampilkan toast "Config rusak, memakai default".
- Semua field punya default; field baru pada versi lebih baru tidak boleh membuat crash (merge dengan default).
- API: `Config.get()` (immutable snapshot untuk render thread), `Config.update(Consumer<ConfigData>)` (men-trigger event `ConfigChanged` + jadwalkan save).

### 3.3 Sistem modul

```java
abstract class Module {
  String id;               // "fps", "fullbright", ...
  Category category;       // HUD | GAMEPLAY | PERFORMANCE
  boolean isEnabled();     // dari config
  void onEnable();         // pasang hook/state
  void onDisable();        // WAJIB mengembalikan semua state ke semula
  void onTick(Minecraft mc);   // client tick
  ModuleStatus getStatus();    // ACTIVE | DISABLED | ERROR | UNAVAILABLE
  String getStatusDetail();    // alasan, mis. "Ping tidak tersedia di singleplayer"
}
```

- `ModuleManager` memanggil `onEnable/onDisable` setiap config berubah, dan membungkus **setiap** panggilan modul dengan try/catch. Exception → status `ERROR`, modul dimatikan otomatis, log stacktrace, toast sekali. **Satu modul error tidak boleh meng-crash game atau modul lain.**
- UI menampilkan badge status di setiap kartu modul: hijau *Active*, abu *Off*, merah *Error* (hover = detail), kuning *Unavailable* (mis. ping di singleplayer).

### 3.4 HUD renderer

- Satu titik render untuk semua HUD (daftarkan lewat mekanisme HUD resmi Fabric API versi 26.x; verifikasi API-nya, jangan memakai callback deprecated bila ada pengganti).
- `HudElement`: `id`, `anchor`, `offsetX`, `offsetY`, `scale`, `opacity`, `backgroundEnabled`, `textColor`, `shadow`, `visible`; method `getSize()` dan `render(graphics, deltaTracker)`.
- **Posisi relatif anchor** (9 titik: TOP_LEFT, TOP_CENTER, TOP_RIGHT, MIDDLE_LEFT, CENTER, MIDDLE_RIGHT, BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT) + offset, sehingga tetap benar saat resolusi/GUI scale berubah. Posisi **tidak** disimpan sebagai piksel absolut.
- HUD disembunyikan saat: F1 (hud hidden), debug screen F3 terbuka (opsi, default on), screen penuh terbuka (inventory, pause, dll). Tetap tampil saat chat terbuka. Selalu tampil di HUD Editor.
- Cache string/ukuran; **tidak boleh alokasi objek besar tiap frame** (hindari `String.format` mahal per frame; update teks tiap tick atau saat nilai berubah).

### 3.5 Input & keybind

- Shortcut buka menu (default **Right Shift**) didaftarkan sebagai KeyMapping resmi (muncul di Options → Controls kategori "Rawcraft") dan juga bisa diubah dari halaman Settings. Cek konflik dengan key lain; jika konflik, tampilkan peringatan dan tetap izinkan.
- Keybind tambahan: Toggle Sprint, Auto Run, Fullbright toggle, Buka HUD Editor (default: tidak terpasang / unbound).
- Layar tidak boleh "menelan" input saat bukan miliknya (mis. jangan mem-pause game di singleplayer kecuali opsi `pauseOnOpen` aktif; default: **tidak pause**).

### 3.6 Mixin yang kemungkinan dibutuhkan

| Mixin | Untuk |
|-------|-------|
| Mouse press handler | `ClickTracker` (CPS) mencatat klik kiri/kanan |
| Crosshair render (Gui) | Membatalkan crosshair vanilla saat Custom Crosshair aktif |
| Effects HUD render | Menyembunyikan efek potion vanilla saat Potion HUD aktif (opsi) |
| Lightmap / gamma | Fullbright (lihat §6.10 untuk strategi + fallback) |
| Weather render | Menonaktifkan render hujan/salju visual (§6.11) |
| Sprint/player input | Toggle Sprint & Auto Run (§6.12) |

Semua mixin: pakai `@Inject` dengan `require = 0` hanya jika memang opsional; mixin wajib yang gagal ter-apply harus dilaporkan di `/rawcraft diag`.

### 3.7 Diagnostik (wajib, agar debugging tidak buta lagi)

- Logger dengan prefix `[Rawcraft]`. Log saat tiap modul init, enable, disable, dan error.
- Command client `/rawcraft diag`: cetak versi mod/MC/loader, status tiap modul, daftar mixin yang ter-apply/gagal, path config, dan error terakhir.
- Command `/rawcraft reset`: sama dengan Factory Reset tapi lewat chat (tanpa dialog, ada pesan konfirmasi `/rawcraft reset confirm`).

---

## 4. Design System UI

### 4.1 Arah visual

**"Dark purple, modern flat, dengan sentuhan pixel Minecraft."** Konsisten dengan launcher Rawcraft: panel gelap translucent, aksen ungu, sudut membulat kecil, border 1px tipis, tanpa tombol abu-abu vanilla. Latar game tetap terlihat dengan blur ringan di belakang panel (jangan menutup seluruh layar dengan warna solid).

### 4.2 Design tokens

| Token | Nilai | Pemakaian |
|-------|-------|-----------|
| `bg.scrim` | `#07040F` @ 55% | Overlay di belakang panel |
| `bg.panel` | `#120C22` @ 92% | Panel utama |
| `bg.surface` | `#1B1334` | Kartu / area konten |
| `bg.surface-hover` | `#241A44` | Hover kartu |
| `border.subtle` | `#33285C` | Border 1px |
| `accent` | `#8B5CF6` | Toggle aktif, pill tab aktif, slider fill |
| `accent.hover` | `#A78BFA` | Hover aksen |
| `accent.pressed` | `#7C3AED` | Pressed |
| `text.primary` | `#F3F0FF` | Teks utama |
| `text.secondary` | `#A79EC7` | Deskripsi, label sekunder |
| `text.disabled` | `#625A82` | Nonaktif |
| `success` | `#34D399` | Badge Active |
| `warning` | `#FBBF24` | Badge Unavailable, peringatan |
| `danger` | `#F87171` | Error, tombol destruktif |

Warna aksen bisa diganti pemain (preset: Purple default, Blue `#3B82F6`, Pink `#EC4899`, Green `#22C55E`, Orange `#F97316`, Cyan `#06B6D4`) lewat Settings. Semua warna aksen diturunkan dari satu nilai.

### 4.3 Tipografi & spacing

- Font default: font vanilla Minecraft (tajam di semua GUI scale), **sentence case** — hentikan teks ALL CAPS di tombol. Judul halaman & heading kartu: bold. Deskripsi: `text.secondary`.
- Opsional (P2): font TTF bundel berlisensi bebas (mis. Inter, OFL) lewat font provider resource pack; hanya jika terbaca jelas di GUI scale 2–3 pada 1080p.
- Spacing grid 4 unit GUI: padding panel 12, padding kartu 8, jarak antar-kartu 6, tinggi baris kontrol 20, tinggi tombol 20.
- Sudut membulat 2 unit via sprite **nine-slice** (GUI sprite dengan metadata nine_slice), bukan `fill` kotak.

### 4.4 Library komponen (semua wajib ada, dipakai ulang di semua halaman)

| Komponen | Perilaku |
|----------|----------|
| **Button** | Varian primary/secondary/danger/ghost; hover/pressed/disabled; ikon opsional |
| **Toggle switch** | Geser 100 ms; label kiri, switch kanan; klik di mana saja pada baris |
| **Slider** | Label + nilai; step; drag, scroll wheel, panah kiri/kanan; Shift = langkah halus; double-click = reset ke default |
| **Dropdown / Cycle** | Daftar pilihan (maks 8 tampil, sisanya scroll) |
| **Keybind button** | Klik → "Press a key…" → tangkap key; Esc = batal; Backspace/Delete = unbind; tampilkan peringatan konflik |
| **Color picker** | Kotak HSV + slider hue + input hex + 8 preset + alpha opsional |
| **Text field** | Untuk prefix teks HUD, hex warna |
| **Card** | Kontainer dengan judul, deskripsi, badge status, aksi di kanan |
| **ScrollView** | Scroll wheel + scrollbar tipis; konten dipotong (scissor) benar |
| **Tooltip** | Muncul 400 ms setelah hover; deskripsi fitur |
| **Dialog konfirmasi** | Modal dengan scrim; tombol "Cancel" (fokus default) dan "Confirm" (danger) |
| **Toast** | Pesan singkat 3 detik di pojok bawah-kanan: "Saved", "Config rusak…", dsb |

**Aksesibilitas input:** navigasi keyboard penuh (Tab/Shift+Tab, panah, Enter/Space, Esc menutup dialog lalu menu), indikator fokus jelas (outline `accent`).

### 4.5 Motion

- Transisi halaman: fade + geser 6 unit, 120 ms ease-out.
- Hover fade 80 ms, toggle 100 ms, buka/tutup menu 150 ms.
- Opsi **Reduce motion** di Settings mematikan semua animasi (durasi 0).

### 4.6 Responsif

- Dukung GUI scale 1–4 dan jendela mulai 854×480. Lebar panel = `min(520, screenW − 24)`; tinggi = `min(340, screenH − 24)`.
- Layar kecil: sidebar berubah menjadi hanya ikon (lebar 28); konten tetap scroll.
- Tidak ada teks terpotong/overlap pada kombinasi ukuran di atas (cek manual).

---

## 5. Spesifikasi halaman

### 5.0 Shell (kerangka umum)

```
┌───────────────────────────────────────────────────────────────┐
│ ◆ Rawcraft Client                   MC 26.2 · v1.0     [ ✕ ]  │ ← header (drag tidak perlu)
├────────────┬──────────────────────────────────────────────────┤
│ ⌂ Home     │                                                  │
│ ⚡Performance│        KONTEN HALAMAN (ScrollView)              │
│ ▦ HUD      │                                                  │
│ ✦ Modules  │                                                  │
│ ⚙ Settings │                                                  │
│            │                                                  │
│ ──────     │                                                  │
│ [ Edit HUD]│                                                  │
├────────────┴──────────────────────────────────────────────────┤
│ Esc: tutup   ·   ShiftRight: buka/tutup menu   ·   Saved ✓    │ ← footer: hint + status simpan
└───────────────────────────────────────────────────────────────┘
```

- Sidebar kiri (lebar 110): item aktif = pill berwarna `accent` (bukan `> Home <`). Ikon dari sprite pixel buatan sendiri atau item Minecraft (mis. compass, redstone, painting).
- Tombol "Return to game / Close" lama diganti tombol ✕ di header + Esc.
- Tombol **Edit HUD** di sidebar membuka HUD Editor (§5.4).
- Footer menampilkan "Saved ✓" sesaat setelah autosave berhasil.

### 5.1 Home (dashboard) — P0

```
┌ Welcome ───────────────────────────────────────────────────┐
│ Rawcraft Client  ·  Minecraft 26.2 · Fabric                │
│ Profil performa: ● Balanced     Modul aktif: 7 / 11        │
├ Live stats ──────────────────────────────────────────────┤
│ [ FPS 144 ]  [ Ping — ]  [ RAM 1.8/4.0 GB ]  [ Chunks 10 ] │
├ Quick toggles ───────────────────────────────────────────┤
│ Fullbright [●─]   Toggle Sprint [●─]   Weather [─●]        │
│ FPS HUD    [●─]   Keystrokes    [●─]   CPS     [●─]        │
├ Shortcuts ───────────────────────────────────────────────┤
│ [ Edit HUD layout ]  [ Performance profile ▾ ]  [ Settings ]│
└────────────────────────────────────────────────────────────┘
```

**AC:**
- Angka live diperbarui ≥ 2×/detik tanpa lag.
- Quick toggle benar-benar mengubah modul (verifikasi in-game langsung setelah menutup menu).
- Jumlah "Modul aktif" akurat berdasarkan `ModuleStatus.ACTIVE`.
- Ping menampilkan "—" dengan tooltip "Tidak tersedia di singleplayer".

### 5.2 Performance — P0

- Tiga kartu profil besar (**Low**, **Balanced**, **Quality**), kartu aktif diberi border `accent` + badge "Active". Jika setting pemain tidak cocok profil mana pun → tampilkan badge "Custom".
- Setiap kartu menampilkan ringkasan nilai (mis. "Render distance 10 · Fancy · Clouds fast").
- Di bawah: bagian **Advanced** (slider individual: render distance, simulation distance, entity distance, biome blend; dropdown: graphics, clouds, particles) — mengubahnya otomatis menjadi "Custom".
- Toggle **Weather precipitation** (§6.11).
- Bagian **Safety**: tombol "Restore vanilla options" (dengan konfirmasi, menampilkan waktu snapshot dibuat).

**AC:** lihat §6.9.

### 5.3 HUD (daftar modul HUD) — P0

Daftar kartu, satu per modul HUD: ikon, nama, deskripsi satu baris, toggle, badge status, tombol ⚙ (membuka panel pengaturan modul di sisi/bawah kartu), dan tombol "Locate" (membuka HUD Editor dengan modul itu terpilih).

- Panel pengaturan memuat opsi sesuai §6 (warna, skala, background, dsb).
- Bagian atas halaman: tombol besar **Open HUD Editor**, tombol **Reset layout**, dan toggle global "Hide HUD when F3 is open".

### 5.4 HUD Editor — P0 (inti "HUD Studio")

Layar penuh tanpa panel besar; game terlihat di belakang, semua HUD aktif tampil dengan **data live** (atau data contoh jika nilai tidak tersedia).

```
┌──────────────────────────────────────────────────────────────┐
│ [FPS: 144]  [Ping: 32ms]                       [Potion list] │
│ [XYZ: 120 64 -33]                                            │
│                                                              │
│                          ┼  ← crosshair (tidak bisa digeser) │
│                                                              │
│ [Keystrokes]                                    [Armor ▮▮▮▮] │
├──────────────────────────────────────────────────────────────┤
│ Dipilih: FPS  Anchor [TL ▾] X [6] Y [6] Scale [1.0] Opacity… │ ← inspector bawah
│ [Snap grid ✓]  [Guides ✓]  [Reset element]  [Done]           │
└──────────────────────────────────────────────────────────────┘
```

Fungsi:
- Klik elemen = pilih (outline `accent`); drag = pindah; **panah** = geser 1 unit (Shift = 5).
- Snap: ke grid 4 unit, ke tepi layar (margin 4), ke tengah layar, dan ke elemen lain; garis panduan tampil saat snap.
- Anchor otomatis terpilih = titik anchor terdekat saat drop; bisa diubah manual di inspector.
- Scroll wheel pada elemen terpilih = ubah skala (0.5–2.0, langkah 0.1).
- Klik kanan elemen = menu kecil: Hide, Reset position, Open settings.
- Elemen tidak boleh keluar layar (clamp) dan tidak boleh tersembunyi di balik inspector.
- `Esc` / **Done** menyimpan dan kembali ke menu; **Ctrl+Z** membatalkan perubahan posisi terakhir (undo minimal 20 langkah).

**AC:** posisi/skala tersimpan, tetap benar setelah restart game dan setelah ganti GUI scale/resolusi; drag halus tanpa lompatan; semua 8 elemen HUD bisa dipindah (crosshair hanya bisa diubah gayanya, bukan posisi).

### 5.5 Modules (fitur gameplay) — P0

Kartu modul gameplay saja: **Fullbright**, **Toggle Sprint / Auto Run**, plus (opsional) pintasan ke Weather & HUD agar tidak duplikat — cukup tautan "Configured in HUD →" untuk Crosshair/Armor.

Setiap kartu: nama, deskripsi, toggle, badge status, keybind, pengaturan khusus (slider/dropdown), dan peringatan bila fitur sering dilarang di server ("Some servers do not allow this").

### 5.6 Settings — P0

| Grup | Isi |
|------|-----|
| **General** | Shortcut key (keybind picker), Pause game when menu open (default off), Language (English / Bahasa Indonesia), Disable vanilla tutorial hints (default on) |
| **Appearance** | Accent color preset, UI scale (Auto / −1 / +1), Reduce motion, Show module status badges |
| **CPS** | CPS sampling window (slider 0.5–5.0 s, step 0.5, default 1.0), Count clicks only when no screen open (default on) |
| **Multiplayer safety** | "Disable unfair modules on servers" (Fullbright, default off, ada peringatan) |
| **Data** | Open config folder, Export config (salin JSON ke clipboard), Import config (tempel dari clipboard, validasi), **Factory reset** (danger, dialog konfirmasi dengan menahan tombol 2 detik atau mengetik `RESET`) |
| **About** | Versi mod, versi MC & loader, link GitHub Rawcraft (copy ke clipboard), tombol "Copy diagnostics" (isi sama dengan `/rawcraft diag`) |

---

## 6. Spesifikasi fitur per modul

Semua modul HUD memiliki opsi umum (selanjutnya disebut **Opsi HUD umum**): `enabled`, `scale` (0.5–2.0), `opacity` (20–100%), `textColor`, `shadow` (on/off), `background` (off / solid / blur, warna + alpha), `anchor`+`offset`, `prefix` (teks kustom, opsional). Tidak perlu diulang di tiap bagian.

### 6.1 FPS Counter — P0
- Menampilkan FPS dari API FPS Minecraft, format default `FPS: 144`.
- Opsi: warna berdasarkan ambang (≥60 hijau, 30–59 kuning, <30 merah; bisa dimatikan), tampilkan min/avg 5 detik terakhir (P1).
- Update teks maksimal 4×/detik agar tidak berkedip.
- **AC:** angka sama (±2) dengan F3; pindah dengan HUD Editor; hilang saat toggle off tanpa restart.

### 6.2 Ping / Latency — P0
- Ambil latency pemain lokal dari player list entry; format `Ping: 32 ms`.
- **Singleplayer:** status `UNAVAILABLE` (nilai 0 tidak menyesatkan) dan HUD menampilkan `Ping: —` atau disembunyikan (opsi "Hide in singleplayer", default on).
- Warna ambang (≤80 hijau, ≤150 kuning, >150 merah).
- **AC:** di server multiplayer nilai berubah sesuai tab list; di singleplayer tidak menampilkan angka palsu.

### 6.3 XYZ Coordinates — P0
- Menampilkan `XYZ: 120.5 / 64.0 / -33.2` dan arah hadap (`N/E/S/W` + sumbu, mis. `Facing: East (+X)`).
- Opsi: jumlah desimal (0–3), tampil biome (P1), koordinat chunk (P1), konversi Nether↔Overworld (kalikan/bagi 8) saat berada di dimensi Nether/Overworld (P1), format 1 baris atau 3 baris.
- **AC:** sama dengan F3; konversi Nether benar (X/Z ×8 atau ÷8).

### 6.4 Keystrokes — P0
- Tampilan tombol: **W A S D**, **Space**, **LMB**, **RMB**, opsional **Shift**/**Sprint**.
- Tombol yang ditekan: background berubah ke `accent` dengan fade 80 ms; baca dari KeyMapping aktual (ikut rebind pemain), bukan huruf tetap — label menyesuaikan key yang dipakai.
- Layout: Compact (WASD + mouse) / Full (+ Space bar lebar + Shift).
- Opsi: warna idle/pressed, ukuran tombol, jarak antar tombol, tampilkan CPS di tombol mouse (menyatu dengan §6.5).
- **AC:** setiap tombol menyala tepat saat ditekan; tidak ada ghosting visual saat tekan banyak tombol; ikut berubah bila pemain rebind jalan ke tombol lain.

### 6.5 CPS Counter — P0
- `ClickTracker`: simpan timestamp (nanoTime) klik kiri & kanan dalam `ArrayDeque`; buang yang lebih tua dari `samplingWindow`; `CPS = jumlah klik / samplingWindow(detik)`.
- Tampilan: `CPS: 7 | 3`, atau terpisah `L 7  R 3`, atau total (opsi).
- Klik saat screen terbuka diabaikan (default, lihat Settings).
- Opsi: window 0.5–5.0 s (diatur di Settings), tampil CPS maksimum sesi (P1).
- **AC:** klik cepat 10× dalam 1 detik menampilkan ≈10; berhenti klik → turun ke 0 setelah window; berubah saat window diubah.

### 6.6 Active Potion Effects — P0
- Daftar efek aktif pemain: ikon efek, nama + level romawi (`Speed II`), sisa waktu `mm:ss`; efek tak terbatas `∞`.
- Urut: durasi tersisa terpendek di atas (opsi: nama).
- Efek berkedip saat sisa < 10 detik (opsi).
- Opsi: sembunyikan efek potion vanilla (default on, via mixin), tampilkan efek ambient/beacon (default on), layout vertikal/horizontal, warna per efek baik/buruk.
- **AC:** minum potion/beri efek via `/effect give` → muncul tepat; hilang saat habis; vanilla tersembunyi bila opsi aktif; tidak overlap dengan vanilla bila nonaktif.

### 6.7 Armor Durability — P0
- Menampilkan 4 slot armor (+ main hand & off-hand opsional): ikon item + durabilitas.
- Mode teks: sisa angka (`312/363`), persen (`86%`), atau bar. Warna gradien hijau→kuning→merah mengikuti persen.
- Item tanpa durabilitas disembunyikan; slot kosong disembunyikan (opsi "Show empty slots").
- Peringatan (opsional): efek kedip merah + (opsional) bunyi saat durabilitas < 10% (default off bunyi).
- Layout vertikal/horizontal, ikon kiri/kanan.
- **AC:** pakai armor bernilai kerusakan → angka akurat; berubah saat armor menerima damage; hilang saat dilepas.

### 6.8 Custom Crosshair — P0
- Gaya: **Cross, Plus-gap, Dot, Circle, T-shape**; opsi: ukuran (1–20), ketebalan (1–6), gap (0–10), warna (color picker + alpha), outline (on/off + warna), dot tengah (on/off).
- **Dynamic**: gap melebar saat bergerak/sprint/menyerang (opsi, default off).
- Menggantikan crosshair vanilla (batalkan render vanilla lewat mixin/HUD API); hanya tampil saat vanilla akan tampil (bukan di F5 belakang, spectator tanpa target, screen terbuka).
- Pratinjau besar real-time di panel pengaturan (kotak gelap 64×64 unit).
- Pertahankan indikator serangan vanilla bila diaktifkan di opsi video (jangan hilang).
- **AC:** tiap gaya tampil simetris tepat di tengah layar di semua GUI scale (tidak off-by-one piksel); setelan berubah live; mematikan modul mengembalikan crosshair vanilla.

### 6.9 Performance Profiles — P0
Profil menerapkan opsi vanilla melalui API options resmi, lalu me-reload renderer bila perlu dan menyimpan `options.txt`:

| Opsi | Low | Balanced | Quality |
|------|-----|----------|---------|
| Render distance | **6** | **10** | **16** |
| Simulation distance | 6 | 8 | 12 |
| Graphics | Fast | Fancy | Fancy |
| Clouds | Off | Fast | Fancy |
| Particles | Minimal | Decreased | All |
| Biome blend | 1 | 3 | 5 |
| Entity distance scaling | 50% | 75% | 100% |

(Nilai bisa disesuaikan agent bila ada alasan teknis; nilai chunk 6/10/16 harus dipertahankan karena sudah ada di UI lama.)

**Vanilla snapshot:** saat pertama kali mod memodifikasi opsi, salin nilai opsi terkait ke `config/rawcraft/vanilla-options-snapshot.json` (hanya sekali; tidak ditimpa). "Restore vanilla options" mengembalikan nilai itu (dengan konfirmasi).

**AC:**
- Klik profil → render distance berubah **seketika** (verifikasi di F3 dan visual); tidak perlu restart.
- Profil aktif ditandai benar; ubah satu slider manual → badge pindah ke "Custom".
- Restore mengembalikan nilai awal; tidak merusak opsi lain.
- Tidak ada crash saat berganti profil beruntun cepat (debounce reload 250 ms).

### 6.10 Fullbright / Gamma Boost — P0
- Efek: dunia terang penuh (gua tidak gelap) tanpa efek night vision visual berlebih.
- **Strategi (urutan pilihan; agent memilih yang benar-benar bekerja di 26.2 dan mendokumentasikannya):**
  1. Override nilai gamma pada pipeline lightmap lewat mixin (tidak menyentuh `options.txt`).
  2. Fallback: set nilai opsi gamma programatis di atas 1.0 (melewati validasi slider) dan **kembalikan ke nilai asli saat dimatikan / game ditutup** (nilai asli disimpan di snapshot).
- Opsi: kekuatan (slider 1.0–15.0, default 10.0), keybind toggle, tampil indikator singkat "Fullbright: ON" saat di-toggle.
- Status `UNAVAILABLE` + alasan bila strategi gagal di versi ini.
- Peringatan UI: "Some servers do not allow this" + opsi "Disable unfair modules on servers".
- **AC:** gua gelap menjadi terang saat ON dan kembali normal saat OFF; `options.txt` tidak berubah permanen (atau kembali persis seperti semula); tetap bekerja setelah ganti dimensi & respawn; tetap berfungsi setelah restart game bila `enabled=true`.

### 6.11 Weather Precipitation Toggle — P0
- OFF = hujan/salju **tidak digambar** (visual saja; cuaca server/dunia tetap berjalan, mekanik tidak berubah). Opsi tambahan: "Mute rain sound" (P1).
- Via mixin pada render cuaca; tombol di Performance dan Home.
- **AC:** saat hujan (`/weather rain`), OFF → tidak ada garis hujan/partikel; ON → kembali normal tanpa relog.

### 6.12 Toggle Sprint / Auto Run — P0
- **Toggle Sprint:** tekan tombol sprint sekali → sprint terus selama bergerak maju, tekan lagi untuk berhenti. Mematuhi aturan vanilla (tidak sprint bila lapar ≤ 6, saat memakai item, saat menabrak, di air/dsb).
- **Auto Run:** keybind terpisah; memegang "maju" otomatis sampai ditekan lagi / pemain menekan "mundur" / membuka screen.
- Indikator status di HUD kecil (opsional): `[Sprinting (Toggled)]`, `[Auto Run]` — modul HUD kecil yang bisa dipindah di HUD Editor.
- **AC:** perilaku konsisten dengan sprint vanilla; tidak "nyangkut" saat membuka inventory, mati, atau teleport; mati-kan modul → input kembali normal tanpa relog.

---

## 7. Skema config (referensi)

```json
{
  "configVersion": 1,
  "ui": { "accent": "#8B5CF6", "language": "en", "reduceMotion": false, "pauseOnOpen": false, "openKey": "key.keyboard.right.shift" },
  "cps": { "samplingWindowSec": 1.0, "ignoreWhenScreenOpen": true },
  "hud": {
    "hideOnF3": true,
    "elements": {
      "fps":        { "enabled": true, "anchor": "TOP_LEFT", "x": 6, "y": 6,  "scale": 1.0, "opacity": 1.0, "color": "#FFFFFF", "shadow": true, "background": { "mode": "off", "color": "#00000066" } },
      "ping":       { "enabled": true, "anchor": "TOP_LEFT", "x": 6, "y": 18, "hideInSingleplayer": true },
      "coords":     { "enabled": true, "anchor": "TOP_LEFT", "x": 6, "y": 30, "decimals": 1, "showFacing": true, "netherConversion": false },
      "keystrokes": { "enabled": true, "anchor": "BOTTOM_LEFT", "x": 8, "y": -8, "layout": "compact", "idleColor": "#FFFFFF33", "pressedColor": "#8B5CF6CC" },
      "cps":        { "enabled": true, "anchor": "BOTTOM_LEFT", "x": 8, "y": -62, "mode": "split" },
      "potions":    { "enabled": true, "anchor": "TOP_RIGHT", "x": -6, "y": 6, "hideVanilla": true, "blinkBelowSec": 10 },
      "armor":      { "enabled": true, "anchor": "MIDDLE_RIGHT", "x": -6, "y": 0, "mode": "bar", "showEmpty": false },
      "crosshair":  { "enabled": true, "style": "plus_gap", "size": 6, "thickness": 1, "gap": 3, "color": "#FFFFFF", "outline": true, "dynamic": false }
    }
  },
  "modules": {
    "fullbright":   { "enabled": false, "strength": 10.0, "keybind": null, "disableOnServers": false },
    "toggleSprint": { "enabled": true, "sprintKeybind": null, "autoRunKeybind": null, "showStatusHud": true },
    "weather":      { "precipitation": true, "muteRainSound": false }
  },
  "performance": { "activeProfile": "balanced" }
}
```

`vanilla-options-snapshot.json` disimpan terpisah (§6.9).

---

## 8. Edge case & penanganan error

| Situasi | Perilaku yang diharapkan |
|---------|--------------------------|
| Config rusak / field hilang | Backup file rusak, pakai default, toast informasi |
| Modul melempar exception | Modul dimatikan, status ERROR, log + toast sekali, game lanjut |
| Mixin gagal ter-apply | Modul terkait `UNAVAILABLE` dengan alasan; muncul di `/rawcraft diag` |
| Ganti dimensi / respawn / disconnect | State modul (sprint toggle, auto run, ClickTracker) di-reset bersih |
| Resize jendela / ubah GUI scale saat menu terbuka | Layout dihitung ulang, tidak ada elemen terpotong |
| Dua modul memperebutkan posisi sama | Diizinkan; HUD Editor memberi peringatan overlap (outline kuning) |
| Server melarang modul (anti-cheat) | Opsi "Disable unfair modules on servers" mematikan Fullbright otomatis saat join server (kecuali pemain menonaktifkan opsi) |
| Tutorial vanilla ("Move with W, A, S and D") menutupi pojok kanan atas | Opsi "Disable vanilla tutorial hints" (default on) menonaktifkan tutorial melalui opsi tutorial vanilla |
| Perubahan cepat berturut-turut (slider diseret) | Debounce save 500 ms, debounce reload renderer 250 ms |
| Pemain menutup game saat save tertunda | Flush paksa di shutdown hook |

---

## 9. Definition of Done (QA Checklist)

Centang **semua** sebelum dinyatakan selesai. Agent wajib melampirkan hasil di `docs/QA_REPORT.md` (tabel: item, hasil, catatan, screenshot bila perlu).

**Fungsional**
- [ ] Semua 8 modul HUD tampil di game dan bisa dimatikan/dinyalakan tanpa restart.
- [ ] Semua modul gameplay (Fullbright, Toggle Sprint/Auto Run, Weather) bekerja sesuai AC.
- [ ] Setiap profil Performance mengubah nilai nyata dan terdeteksi benar sebagai Active/Custom.
- [ ] HUD Editor: drag, snap, scroll scale, undo, simpan, dan posisi bertahan setelah restart.
- [ ] Keybind (menu, sprint, auto run, fullbright) bisa diubah dan tersimpan.
- [ ] Factory reset & restore vanilla bekerja dan selalu memakai konfirmasi.
- [ ] Tidak ada tombol/kontrol yang tidak melakukan apa-apa (nol "placeholder").

**UI**
- [ ] Tidak ada tombol vanilla abu-abu di UI mod; semua memakai design system.
- [ ] Tidak ada teks terpotong/overlap di GUI scale 1, 2, 3, 4 dan resolusi 854×480, 1280×720, 1920×1080, 2560×1440.
- [ ] Navigasi keyboard lengkap (Tab, panah, Enter, Esc).
- [ ] Animasi mulus; Reduce motion mematikannya.

**Stabilitas & performa**
- [ ] Nol crash selama 30 menit bermain dengan semua modul aktif (singleplayer + 1 server).
- [ ] Tidak ada exception di `latest.log` yang berasal dari `[Rawcraft]` selama sesi uji.
- [ ] Overhead render ≤ 1 ms/frame dengan semua HUD aktif (ukur dengan profiler sederhana / `System.nanoTime`).
- [ ] Tidak ada memory leak jelas (heap stabil setelah 10× buka-tutup menu).
- [ ] Kompatibel dengan Sodium dan Iris (uji minimal: game start + HUD tampil + crosshair + fullbright).

**Kualitas kode**
- [ ] Build bersih tanpa warning penting; tidak ada `TODO`/stub/kode mati tersisa.
- [ ] README mod: cara build, cara menjalankan, daftar fitur, daftar keybind, troubleshooting.
- [ ] Unit test untuk logika murni: ClickTracker, ConfigManager (load/migrate/corrupt), pembagian anchor→posisi, format durasi/roman numeral, deteksi profil.

---

## 10. Rencana kerja untuk Antigravity (urutan wajib)

> Kerjakan **per fase**. Jangan lanjut ke fase berikutnya sebelum gate fase sekarang lolos. Tiap fase diakhiri ringkasan singkat + bukti (log/screenshot).

**Fase 0 — Audit & Diagnosa (jangan menulis fitur baru dulu)**
1. Petakan struktur repo mod client; tulis `docs/AUDIT.md`: daftar class, entrypoint, mixin config, dan alur data dari toggle UI → state → efek.
2. Jalankan game (`runClient`), buka menu, cek `latest.log`. Untuk **setiap** fitur lama (FPS, Ping, XYZ, Keystrokes, CPS, Potion, Armor, Crosshair, Fullbright, Toggle Sprint, Weather, profil chunk), tentukan **penyebab pasti** ia tidak berfungsi (tidak ada render callback / mixin tidak ter-apply / state tidak dibaca / API 26.2 berubah / dll).
3. Putuskan: refactor bertahap vs tulis ulang inti. Jika arsitektur lama tidak sesuai §3, **tulis ulang inti sesuai §3** dan buang kode mati.
- **Gate:** `AUDIT.md` ada dan tiap fitur punya akar masalah tertulis.

**Fase 1 — Fondasi**
ConfigManager, Module system + status, ModuleManager (try/catch), logger, `/rawcraft diag`, KeybindManager.
- **Gate:** `/rawcraft diag` jalan; config dibuat otomatis; modul dummy bisa on/off dengan benar; test config lulus.

**Fase 2 — HUD Renderer + 8 modul HUD**
HudElement, anchor system, renderer, lalu FPS → Ping → XYZ → CPS (ClickTracker) → Keystrokes → Potion → Armor → Crosshair satu per satu, masing-masing diuji di game sebelum lanjut.
- **Gate:** semua AC §6.1–6.8 lolos; HUD tampil di game dengan posisi default.

**Fase 3 — Modul gameplay & performa**
Weather, Toggle Sprint/Auto Run, Fullbright (pilih strategi yang bekerja, dokumentasikan), ProfileManager + VanillaSnapshot.
- **Gate:** AC §6.9–6.12 lolos.

**Fase 4 — Library UI + shell + halaman**
Theme tokens, sprite nine-slice, semua komponen §4.4, shell §5.0, lalu Home, Performance, HUD list, Modules, Settings. Hubungkan **semua** kontrol ke state nyata.
- **Gate:** tidak ada tombol palsu; checklist UI §9 lolos.

**Fase 5 — HUD Editor**
Drag, snap, guides, inspector, undo, scroll-scale, context menu.
- **Gate:** AC §5.4 lolos.

**Fase 6 — Polish, QA, dokumentasi**
Animasi, tooltip, toast, edge case §8, uji resolusi & GUI scale, uji Sodium/Iris, uji 30 menit, tulis README + `QA_REPORT.md`.
- **Gate:** seluruh Definition of Done §9 tercentang.

### Aturan keras untuk agent
1. **Dilarang** membuat tombol/toggle yang tidak terhubung ke fitur nyata, data palsu/hardcode di HUD, atau komentar `TODO` pada hasil akhir.
2. **Dilarang** menandai tugas selesai sebelum diuji di game yang berjalan. Compile sukses ≠ fitur berfungsi.
3. Jika API Minecraft 26.2 berbeda dari asumsi PRD, **cari API yang benar di source/dokumentasi**, jangan memakai workaround rapuh (mis. reflection berlebihan) tanpa mencatat alasannya di `docs/DECISIONS.md`.
4. Jika sebuah fitur tidak mungkin diimplementasikan sesuai spesifikasi, jangan diam-diam dilewati: tandai `UNAVAILABLE` di UI, catat di `docs/DECISIONS.md`, dan usulkan alternatif.
5. Kerjakan perubahan kecil dan commit per sub-fitur dengan pesan yang jelas.

---

## 11. Ide lanjutan (P2, di luar rilis pertama)

- Profil HUD (simpan beberapa layout, pindah cepat).
- Frame-time graph overlay & memory graph.
- Zoom (OptiFine-style), Freelook, Waypoints/coords bookmark, Armor swap warning.
- Tema tambahan (light, high contrast) dan font TTF bundel.
- Sinkronisasi config dengan launcher Rawcraft (profil per instance).
