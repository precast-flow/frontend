# 00 — Ortak blok — Planlama / Tasarım prompt paketi

Her `plan-XX` dosyasını çalıştırmadan önce aşağıdaki blokları **üst üste** bağla:

1. `docs/10-ui-prototype/prompts/00-ORTAK-BLOK.md` — tam metin (ROL, kod politikası, görsel dil, çıktı formatı).
2. `docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md` — görsel kurallar.
3. `docs/13-ui-production-prompts/00-ORTAK-BLOK-URETIM-UI.md` — üretim özeti (12 analiz, fabrika bağlamı, roller, kalite ekranı yok, beton mock).

**Bu pakete özel:**

- Ekran türü: **planlama ızgarası** (Excel benzeri: üstte zaman sütunları, solda kalıp satırları).
- Ana etkileşim: **sürükle-bırak** + **hücre/detay** + **günlük özetler**.
- `00c` şablonu: ızgara yüzeyinde zorunlu değil; **bekleyen iş havuzu** veya **yan liste** varsa `00c` ile uyumlu düşünülebilir.
- **Düzeltme paketi:** `plan-09-duzeltme-ve-iyilestirmeler.md` — zoom, DnD, resize, çoklu iş ve gün özeti gibi prototip sonrası iyileştirmeler; önceki plan maddeleriyle çelişirse **plan-09 önceliklidir**.

**Standart çıktı** (00-ORTAK ile uyumlu, ek madde):

9) **Rol matrisi:** planlama / şef / vardiya amiri için bu ekranda hangi aksiyonlar açık (tek tablo).
