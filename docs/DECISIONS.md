# ARSITEKTUR & KEPUTUSAN TEKNIS (DECISIONS) — RAWCRAFT CLIENT

> Dokumen pencatatan keputusan arsitektural dan teknis dalam pengembangan Rawcraft Client untuk Minecraft 26.2 (Fabric).

---

## ADR 01: Core Architecture Rewrite vs Incremental Refactor
- **Status:** Diterima (Accepted)
- **Konteks:** Struktur kode lama memiliki method stub kosong di seluruh widget, mixin menarget method/class Minecraft versi lama yang sudah tidak ada di 26.2, dan UI menggunakan tombol vanilla bertumpuk.
- **Keputusan:** Menulis ulang arsitektur inti modul, HUD renderer, mixins, dan UI design system sesuai PRD §3. Kode lama yang tidak terhubung atau mati dibersihkan secara total.
- **Konsekuensi:** Menghilangkan technical debt dan memastikan integrasi langsung dengan API Minecraft 26.2 (Mojang official mappings).

---

## ADR 02: Mekanisme Rendering HUD di Minecraft 26.2
- **Status:** Diterima (Accepted)
- **Konteks:** Pada Minecraft 26.2, rendering HUD tidak lagi berada di `Gui.render(DrawContext, ...)` melainkan pada sistem state extraction: `net.minecraft.client.gui.Hud.extractRenderState(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker)`.
- **Keputusan:** Menggunakan `@Inject` pada `Hud.extractRenderState` di `rawcraft.mixins.json` (`HudMixin.java`) untuk memanggil `HudRenderer.render(extractor, deltaTracker)`.
- **Konsekuensi:** Kompatibel penuh dengan arsitektur rendering modern Minecraft 26.2 dan renderer seperti Sodium.

---

## ADR 03: Strategi Fullbright / Gamma Boost
- **Status:** Diterima (Accepted)
- **Konteks:** PRD §6.10 menawarkan dua strategi:
  1. Override pipeline lightmap via mixin (tidak merusak `options.txt`).
  2. Fallback manipulasi programatis `options.gamma()`.
- **Keputusan:** Menggunakan strategi 1 sebagai prioritas utama lewat `@Inject` di `net.minecraft.client.renderer.LightmapRenderStateExtractor.extract(LightmapRenderState state, float tickDelta)`. Saat Fullbright aktif, `state.brightness` ditingkatkan dan `state.blockFactor`/`state.skyFactor` dimaksimalkan, dengan fallback otomatis ke `options.gamma()` bila diperlukan.
- **Konsekuensi:** Dunia di dalam gua/kegelapan menjadi terang benderang seketika tanpa mengubah file `options.txt` pemain secara permanen.

---

## ADR 04: Weather Precipitation Mute
- **Status:** Diterima (Accepted)
- **Konteks:** Method `renderSnowAndRain` di `LevelRenderer` telah dihapus di Minecraft 26.2 dan digantikan oleh `WeatherEffectRenderer`.
- **Keputusan:** Menggunakan `@Inject(method = "render", at = @At("HEAD"), cancellable = true)` pada `net.minecraft.client.renderer.WeatherEffectRenderer`. Jika `weatherPrecipitation` dimatikan oleh pemain, pemanggilan dibatalkan (`ci.cancel()`).
- **Konsekuensi:** Garis hujan dan salju visual langsung hilang saat dinonaktifkan tanpa reload dunia.

---

## ADR 05: Click Tracker & Mouse Input Capture
- **Status:** Diterima (Accepted)
- **Konteks:** Method `onPress` pada `MouseHandler` telah digantikan oleh `onButton(long window, MouseButtonInfo info, int action)`.
- **Keputusan:** Mixin `MouseHandler.onButton` membaca `info.button()` (0 = LMB, 1 = RMB) dan `action == 1` (GLFW_PRESS). Klik dicatat ke `ClickTracker` hanya bila tidak ada screen terbuka (sesuai opsi `ignoreWhenScreenOpen`).
- **Konsekuensi:** Pengukuran CPS akurat dan tidak mencatat klik saat pemain mengklik tombol di menu atau inventaris.
