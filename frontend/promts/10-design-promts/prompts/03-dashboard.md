# Prompt 03 — Dashboard (Neomorphism KPI kartları)

```
[Buraya prompts/00-ORTAK-BLOK.md içeriğini yapıştır]
[00b-NEOMORPHISM-TAILWIND.md]

GÖREV: Giriş sonrası “Genel Bakış” — neumorphic KPI kart grid’i (gri-beyaz, okunaklı).

İSTENENLER:
- KPI kartları (protrude): Aktif projeler, Bugün üretilen eleman, Yard’da bekleyen, Bugünkü sevkiyat, Açık kalite bekleyen — sayılar bold, açıklama gri-600+.
- “Kritik uyarılar”: inset liste well veya protrude uyarı kartları (tehlike için kırmızı sadece metin/ikon, arka plan yine nötr).
- Mini üretim özeti: inset grafik alanı (placeholder) veya hafif protrude mini kart.
- Hızlı aksiyonlar: 3 protrude pill button veya bir primary + iki secondary (hepsi gri tonları).

NEOMORPHISM ÖZEL:
- KPI kartları aynı grid’de eşit yükseklik; gölge yoğunluğu tek tip (farklı renk yerine hiyerarşi).
- Kart içinde ikincil metin: asla gray-400’ün altına düşme.

ÇIKTI:
1) Bölüm düzeni + grid sütun sayısı (md/lg için)
2) Her KPI kartı için içerik + [protrude] notu + 1 satır Tailwind
3) Uyarı listesi için yüzey tipi + Tailwind
4) KPI’ya tıklanınca hangi modüle gidilir (menü hedefi)
5) 3–5 UX sorusu
```
