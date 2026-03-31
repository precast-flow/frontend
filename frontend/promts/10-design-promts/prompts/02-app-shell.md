# Prompt 02 — App Shell (Neomorphism + Tailwind)

```
[Buraya prompts/00-ORTAK-BLOK.md içeriğini yapıştır]
[00b-NEOMORPHISM-TAILWIND.md — protrude/inset kuralları geçerli]

GÖREV: “Precast Flow” ana kabuğunu neumorphic macOS-benzeri gri-beyaz düzende tasarla.

İSTENENLER (YAPISAL):
- Üst bar: logo alanı, global arama (inset well), bildirim (protrude icon button), kullanıcı menüsü, ortam etiketi (DEMO) — hepsi nötr gri.
- Sol sidebar: 01’deki 4 grup; grup başlıkları + modül satırları; aktif modül belirgin ama mor kullanmadan (koyu gri veya inset seçili well).
- Ana alan: büyük rounded içerik konteyneri (rounded-3xl) — modül sayfaları bu “kart alanı” içinde yaşar.
- Alt bilgi: sürüm, son senkron placeholder, destek linki — sade tipografi.

NEOMORPHISM ÖZEL:
- Sidebar: ya “floating protrude panel” ya da ana zemine gömülü inset kolon — birini seç ve tüm üründe tutarlı kalmasını yaz.
- Üst bar ile içerik konteyneri arasında hiyerarşi: hangi katman daha “yüksek” (gölge) görünür?

ÇIKTI:
1) ASCII wireframe (sidebar + topbar + main rounded container + footer) — her bloğa [protrude] / [inset] etiketi
2) Sidebar tam ağaç listesi (grup + modül)
3) Üst bar davranış notları + arama kapsamı önerisi
4) Her ana kabuk parçası için 1 satır Tailwind utility (00b ile uyumlu)
5) 3–5 UX sorusu
```
