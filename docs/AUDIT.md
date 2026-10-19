# AUDIT TEKNIS & AKAR MASALAH — RAWCRAFT CLIENT (MINECRAFT 26.2 FABRIC)

> **Tanggal Audit:** 19 Oktober 2026  
> **Target Game:** Minecraft 26.2 (Fabric Loader 0.20.0, Java 25)  
> **Status Verifikasi:** Diverifikasi langsung terhadap decompiled bytecode `instances/prof-9021/versions/rawcraft/rawcraft.jar`, runtime log `instances/prof-9021/logs/latest.log`, dan source code `rawcraft-client/`.

---

## 1. Ringkasan Eksekutif & Keputusan Arsitektur

Berdasarkan audit mendalam terhadap source code lama dan runtime Minecraft 26.2, **hampir seluruh fitur mod client saat ini berada dalam kondisi stub (kosong/placeholder)**. 
Meskipun mod berhasil dimuat oleh Fabric Loader tanpa crash (seperti terlihat pada `latest.log` baris 8 & 14-18), **tidak ada satupun HUD atau modifikasi game yang berjalan**.

### Keputusan:
Sesuai PRD §3 & §10 (Fase 0), dilakukan **tulis ulang inti (core rewrite)** untuk sistem modul, HUD renderer, mixins, dan UI design system, serta membuang seluruh kode stub/mati lama.

---

## 2. Peta Alur Data Lama vs Masalah Utama

```
[UI Menu (Tombol Vanilla)] 
       │
       ▼ (Menulis boolean/angka ke field memory)
[Manager / Module Singleton]
       │
       ▼
[STUB METHOD / TIDAK ADA PEMANGGILAN RENDERER] ──X──> (Layar Minecraft kosong / Game tidak berubah)
```

1. **Kompatibilitas API Minecraft 26.2:**  
   Minecraft 26.2 memperkenalkan arsitektur render state extraction baru:
   - Rendering HUD dipindahkan dari `net.minecraft.client.gui.Gui` ke `net.minecraft.client.gui.Hud`.
   - Menggunakan `extractRenderState(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker)` alih-alih `render(GuiGraphics, float)`.
   - Rendering cuaca dipindahkan dari `LevelRenderer.renderSnowAndRain` ke `net.minecraft.client.renderer.WeatherEffectRenderer.render(...)`.
   - Event mouse handler diubah dari `onPress(long, int, int, int)` menjadi `onButton(long window, MouseButtonInfo info, int action)`.
   - Lightmap rendering menggunakan `net.minecraft.client.renderer.LightmapRenderStateExtractor`.
   - Input pemain menggunakan record `net.minecraft.world.entity.player.Input` di `net.minecraft.client.player.KeyboardInput.tick()`.

2. **Semua Widget HUD Memiliki Body Kosong:**  
   Seluruh class di `com.rawcraft.client.hud.widgets.*` meng-override `public void render(Object drawContext, float tickDelta)` dengan komentar stub `// Rendered via native DrawContext` tanpa menulis instruksi render sama sekali.

3. **Tidak Ada Hook Render HUD:**  
   Tidak ada mixin atau Fabric HUD callback yang memanggil `HudManager` atau widget-widgetnya saat frame digambar.

---

## 3. Akar Masalah Pasti per Fitur

| # | Fitur | Status Lama | Akar Masalah Pasti di Source Code | Solusi Sesuai PRD & MC 26.2 |
|---|-------|-------------|-----------------------------------|-----------------------------|
| 1 | **FPS Counter** | `[ON]` di UI tapi tidak tampil | `FpsWidget.java:19-21` memiliki method `render()` kosong. `HudManager` tidak dipanggil oleh mixin/event manapun. | Hook ke `Hud.extractRenderState` via mixin; gambar teks FPS menggunakan `extractor.text(font, text, x, y, color)`. |
| 2 | **Ping / Latency** | `[ON]` di UI tapi tidak tampil | `PingWidget.java:18-20` memiliki method `render()` kosong. Tidak ada pengambilan latency dari `ClientPacketListener.getPlayerInfo(uuid).getLatency()`. Singleplayer tidak ditangani (menampilkan angka palsu 0). | Ambil latency aktual dari tab list; deteksi singleplayer (`mc.hasSingleplayerServer()`) dan tandai `UNAVAILABLE` (`Ping: —`). |
| 3 | **XYZ Coordinates** | `[ON]` di UI tapi tidak tampil | `CoordsWidget.java:18-20` method `render()` kosong. Tidak ada pembacaan koordinat `mc.player.getX/Y/Z()` atau arah hadap `mc.player.getDirection()`. | Render format koordinat 1 baris / 3 baris dengan arah mata angin dan konversi koordinat Nether (×8 / ÷8). |
| 4 | **Keystrokes** | `[ON]` di UI tapi tidak tampil | `KeystrokesWidget.java:17-19` method `render()` kosong. Tidak membaca status tombol dari `mc.options.keyUp/Down/Left/Right/Jump/Sprint.isDown()`. | Render layout tombol (W, A, S, D, Space, LMB, RMB) dengan warna idle/pressed dan transisi fade halus. |
| 5 | **CPS Counter** | `[ON]` di UI tapi tidak tampil | `CpsWidget.java:20-22` method `render()` kosong. Selain itu, `MouseMixin.java:14` mencoba meng-inject method non-existent `onPress` pada `MouseHandler` (di 26.2 method-nya adalah `onButton(long, MouseButtonInfo, int)`), sehingga klik tidak pernah tercatat di `ClickTracker`. | Perbaiki mixin pada `MouseHandler.onButton`; hitung CPS riil menggunakan `ArrayDeque<Long>` nanoTime sesuai sliding window (0.5–5.0s). |
| 6 | **Active Potion Effects** | `[ON]` di UI tapi tidak tampil | `PotionHudWidget.java:37-39` method `render()` kosong. Tidak membaca `mc.player.getActiveEffects()`. Tidak ada mixin untuk mematikan HUD efek potion vanilla. | Baca efek aktif, render ikon/nama/durasi (`mm:ss`), sembunyikan overlay potion vanilla via mixin jika dikonfigurasi. |
| 7 | **Armor Durability** | `[ON]` di UI tapi tidak tampil (Duplikat) | `ArmorHudWidget.java:55-57` method `render()` kosong. Modul muncul ganda di HUD Studio dan Modules. Tidak membaca `mc.player.getInventory().armor`. | Hapus duplikasi di Modules (jadikan satu modul HUD). Render item slot armor dan durabilitas (angka, %, atau bar progres). |
| 8 | **Custom Crosshair** | `[ON]` di UI tapi tidak tampil (Duplikat) | `CustomCrosshairWidget.java:36-38` method `render()` kosong. `InGameHudMixin.java:15` mencoba inject `renderCrosshair` di `net.minecraft.client.gui.Gui` yang sudah tidak ada di 26.2. | Di 26.2, crosshair diekstrak di `net.minecraft.client.gui.Hud.extractCrosshair`. Batalkan vanilla crosshair di method tersebut saat Custom Crosshair aktif, dan render reticle custom (Cross, Plus-gap, Dot, Circle, T-shape). |
| 9 | **Fullbright / Gamma Boost** | `[ON]` di UI tapi dunia gelap | `FullbrightModule.java:33-40` method `onEnable()` dan `onDisable()` kosong tanpa implementasi. Tidak ada hook pada lightmap atau options. | Implementasikan mixin pada `LightmapRenderStateExtractor.extract` untuk menaikkan brightness/faktor cahaya saat aktif tanpa merusak `options.txt`, plus fallback options jika diperlukan. |
| 10 | **Toggle Sprint & Auto Run** | `[ON]` di UI tapi tidak sprint | `ToggleSprintModule.java` hanya POJO 21 baris tanpa hook input. Tidak ada fitur Auto Run sama sekali. | Inject pada `KeyboardInput.tick()` untuk memodifikasi `keyPresses` (`Input` record) secara sah saat bergerak maju / tombol auto run aktif. Bersihkan state saat inventory terbuka atau player mati. |
| 11 | **Weather Precipitation** | Toggle ada tapi hujan tetap turun | `WorldRendererMixin.java:14` meng-inject `LevelRenderer.renderSnowAndRain` yang sudah dihapus di Minecraft 26.2. | Pindahkan mixin ke `WeatherEffectRenderer.render(...)` (atau `addWeatherPass`), lalu batalkan render visual saat `weatherPrecipitation == false`. |
| 12 | **Performance Profiles** | Tombol diklik tapi setting tidak berubah | `PerformanceManager.java:64-66` method `applyToGameOptions()` kosong! Tidak mengubah `OptionInstance` pada `mc.options` dan tidak menyimpan ke `options.txt`. | Terapkan nilai nyata ke `mc.options.renderDistance().set()`, `simulationDistance()`, `cloudStatus()`, `particles()`, dll., lalu panggil `mc.options.save()`. Simpan `vanilla-options-snapshot.json` sekali untuk fitur Restore. |
| 13 | **UI & HUD Studio** | Tampilan jelek vanilla bertumpuk | `RawCraftMenuScreen.java` menggunakan tombol standar vanilla tanpa design system dark purple. `HudEditorScreen.java` hanya berupa tombol "CYCLE ANCHOR", bukan editor drag-and-drop. Tidak ada card, slider, color picker, keybind picker, konfirmasi dialog, atau status badge. | Tulis ulang UI menggunakan design system dark purple (PRD §4–5), custom widgets (Button, ToggleSwitch, Slider, ColorPicker, KeybindPicker, Dialog, Toast, HUD Drag & Drop Editor dengan snapping & 9 anchor). |
| 14 | **Diagnostik & Safety** | Tidak ada diagnostik saat error | Tidak ada error containment: jika sebuah modul crash, seluruh client berpotensi freeze/crash. Tidak ada command `/rawcraft diag`. | Bungkus eksekusi modul dengan try/catch di `ModuleManager` (status `ERROR`, game lanjut), tambahkan client command `/rawcraft diag` dan `/rawcraft reset`. |

---

## 4. Rencana Kerja Bertahap (Fase 1 → Fase 6)

### Fase 1 — Fondasi & Arsitektur Inti
- `ConfigManager`: JSON v1 atomic write (`.tmp` → `.json`), recovery file rusak, debounce 500ms.
- `Module` & `ModuleManager`: Lifecycle `onEnable/onDisable/onTick`, try/catch containment, status (`ACTIVE`, `DISABLED`, `ERROR`, `UNAVAILABLE`).
- `KeybindManager`: Registrasi keybind Minecraft resmi (Right Shift default), open screen handler.
- Client command: `/rawcraft diag` dan `/rawcraft reset`.
- **Gate:** Modul ter-register bersih, config otomatis dibuat, `/rawcraft diag` berfungsi di log/chat, unit test config lulus.

### Fase 2 — HUD Renderer & 8 Modul Telemetry
- Hook mixin `Hud.extractRenderState(GuiGraphicsExtractor, DeltaTracker)`.
- Base `HudElement` dengan 9 anchor, offset, scale, opacity, background, shadow.
- Implementasi 8 modul:
  1. FPS Counter
  2. Ping / Latency (handling singleplayer `—`)
  3. XYZ Coordinates (facing + Nether conversion)
  4. Keystrokes (WASD, Space, LMB, RMB highlight)
  5. CPS Counter (`ClickTracker` via `MouseHandler.onButton`)
  6. Active Potion Effects (hide vanilla overlay via mixin)
  7. Armor Durability (durabilitas angka / % / bar)
  8. Custom Crosshair (cancel vanilla crosshair via `Hud.extractCrosshair`)
- **Gate:** Seluruh 8 HUD tampil nyata di dalam game dengan posisi default dan toggle bekerja seketika.

### Fase 3 — Modul Gameplay & Performa
- Weather Precipitation: Mixin pada `WeatherEffectRenderer.render` untuk mute visual hujan.
- Toggle Sprint & Auto Run: Mixin pada `KeyboardInput.tick` dengan integrasi aman.
- Fullbright: Mixin pada `LightmapRenderStateExtractor.extract` untuk menaikkan brightness/faktor cahaya.
- PerformanceManager: Profil Low, Balanced, Quality yang mengubah opsi vanilla nyata (`renderDistance`, `simulationDistance`, `clouds`, `particles`, `entityShadows`, dll.) + `VanillaOptionsSnapshot` untuk restore aman.
- **Gate:** AC §6.9–6.12 lolos di game (gua terang benderang, hujan hilang, sprint toggle bekerja, chunk berubah seketika).

### Fase 4 — Library UI Dark Purple & Halaman Shell
- Theme tokens: Dark purple palette (#120C22, #1B1334, #8B5CF6, #34D399, dll.).
- UI Components: Panel, Card, ToggleSwitch, Slider, ColorPicker, KeybindPicker, Dialog, Toast, ScrollView.
- Shell: Sidebar navigasi dengan active pill, tombol Edit HUD, ✕ close, status bar "Saved ✓".
- 5 Halaman: Home (Dashboard live stats & quick toggles), Performance (Profil cards + Advanced), HUD (Daftar modul HUD + settings drawer), Modules (Gameplay mods), Settings (General, Appearance, CPS, Data, About).
- **Gate:** Semua tombol vanilla lama diganti; tidak ada tombol palsu/dummy; responsive GUI scale 1–4.

### Fase 5 — HUD Studio (Drag-and-Drop Editor)
- Layar HUD Editor live preview dengan game background.
- Drag-and-drop dengan mouse, panah keyboard (unit/shift 5), snapping (grid 4, layar, elemen lain), auto-anchor detection.
- Inspector bawah: Anchor, X, Y, Scale, Opacity, Reset, Done.
- Undo stack (Ctrl+Z).
- **Gate:** AC §5.4 lolos: elemen bisa diseret dan diposisikan bebas, posisi tersimpan dan bertahan setelah restart.

### Fase 6 — Polish, QA Report & Dokumentasi
- Animasi transisi & toggle switch (dengan opsi Reduce Motion).
- Safety edge cases: tutorial hints suppression, corrupt config recovery, shutdown hook flush.
- Compatibility test: Sodium / Iris.
- Pembuatan dokumen: `docs/DECISIONS.md`, `docs/QA_REPORT.md` (checklist Definition of Done §9), dan `README.md`.
- **Gate:** Seluruh checklist Definition of Done PRD §9 tercentang dengan bukti log/screenshot.
