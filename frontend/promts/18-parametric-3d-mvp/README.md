# Adım 18 — Parametrik 3B prefab elemanları (MVP araştırma + komutlar)

Web’de ölçü girişine göre **otomatik 3B geometri** üretimi için çalışma paketi. Ürün: **parametre modeli**, **geometri kuralları**, **viewer/ERP bağlantısı** tasarımı; tam uygulama kodu bu dokümanların konusu değildir — **komut/prompt** çıktıları üretmek içindir.

## Ön koşul

- `docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md` — parametre formu ve önizleme çerçevesi için görsel dil (UI geçen her prompt’ta).
- İsteğe bağlı: `docs/03-contexts-modules/` içinde mühendislik / ürün tipi bağlamı.

## Çalıştırma sırası

| Sıra | Dosya | Amaç |
|------|--------|------|
| 0 | `00-ORTAK-BLOK-PARAMETRIC-3D.md` | Her LLM komutunun başına yapıştır |
| 1 | `00-kapsam-katmanlar-ve-teknoloji-arastirmasi.md` | Okuma: problem katmanları, kütüphane özeti, faz stratejisi |
| 2 | `01-parametre-json-sozlesmesi-ve-validasyon-kurallari.md` | Ortak JSON şeması + validasyon |
| 3 | `02-teknik-spike-jscad-veya-three.md` | Teknoloji spike komutu (kolon prototipi) |
| 4 | `03-eleman-kolon-dikdortgen-kesit.md` | Eleman 1 — kolon |
| 5 | `04-eleman-kiriş-prizmatik.md` | Eleman 2 — kiriş |
| 6 | `05-eleman-kutu-menfez.md` | Eleman 3 — kutu menfez (CSG) |
| 7 | `06-eleman-duvar-doseme-paneli.md` | Eleman 4 — panel |
| 8 | `07-eleman-l-veya-u-profil-perde.md` | Eleman 5 — L/U profil |
| 9 | `08-viewer-olcek-ve-erp-form-baglanti.md` | Viewer UX + birim + ERP alan eşlemesi |

## Çıktı beklentisi

Her komut dosyası **LLM’e verilecek talimat** olarak yazılmıştır; yanıtta **P0/P1/P2**, **örnek JSON**, **geometri kuralları**, gerekirse **kısa Tailwind** (form/önizleme çerçevesi) ve **açık sorular** istenir.
