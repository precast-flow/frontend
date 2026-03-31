# UI prompt’ları — Neomorphism + Tailwind (gri–beyaz)

Tüm arayüz prompt’ları **Neomorphism** (protrude / inset), **macOS-benzeri yuvarlak kart** dili ve **Tailwind utility önerileri** ile uyumludur. **Mor veya renkli dekoratif temalar yok**; sadece nötr gri ve beyaz. Okunabilirlik önceliklidir.

## Okuma / hazırlık (kod üretmeden önce)

| Dosya | Amaç |
|--------|------|
| `00b-NEOMORPHISM-TAILWIND.md` | Görsel dil referansı (palet, gölgeler, switch mantığı, checklist) |
| `00-ORTAK-BLOK.md` | Her prompt’a yapıştırılacak ortak metin |

## Çalıştırma sırası

| Adım | Dosya | Amaç |
|------|--------|------|
| 0b | `00b-NEOMORPHISM-TAILWIND.md` | Önce oku (LLM’e ayrıca yapıştırılabilir) |
| 0 | `00-ORTAK-BLOK.md` | Her prompt’un başına yapıştır |
| 1 | `01-temel-mantik-ve-arayuz.md` | Foundation + bileşen sözlüğü (neumorphic) |
| 2 | `02-app-shell.md` | Kabuk |
| 3 | `03-dashboard.md` | Dashboard |
| 4–14 | `04-modul-*.md` … `14-modul-mobil-onizleme.md` | Modüller |
| 15 | `15-tasarim-sistemi-derinlestirme.md` | Token / derinleştirme (isteğe bağlı) |
| 16 | `16-uctan-uca-demo-akisi.md` | Tutarlılık testi |

## Notlar

- Ortak blok artık **kısa Tailwind satırı** önerilmesine izin verir; uzun React üretimi istenmez.
- Switch örneği: klasik CSS yerine **inset track + protrude thumb** mantığı `00b` içinde Tailwind perspektifinde anlatılır.
