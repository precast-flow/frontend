# mvp-09 — Üretim + Kalite (bitişik modül, mock)

```
[Buraya 00-ORTAK-BLOK-MVP-UI.md içeriğini yapıştır]

GÖREV: Üretim (MES) ve Kaliteyi **aynı iş akışı bağlamında** tasarla: üretim emrinden kalite kaydına geçiş; ayrı menüde de olabilir ama ekranlarda cross-link zorunlu.

### P0
- Üretim emri listesi: no, proje, hat mock, durum (Planlandı, Üretimde, Kalite bekliyor, Tamamlandı), fabrika.
- Emir detay: üst özet protrude; sekmeler **Genel**, **Hat olayları**, **Kalite** (aynı detay içinde sekme olarak zorunlu).
- Kalite sekmesi: ölçü alanları mock, fotoğraf placeholder inset, Onayla / Ret butonları; ret sebebi kodu select mock.
- Durum geçişi: Üretimde → Kalite bekliyor (otomatik mock notu) → Tamamlandı.

### P1
- Kalite kuyruk görünümü (aynı fabrikada tüm bekleyenler) — ayrı sayfa veya sol panel.
- Paralel: üretim satırından “Kalite kaydı aç” drawer.

### P2
- Nonkonformite kodu kataloğu (10 satır mock tablo yönetimi — mini admin içinde).

MOCK: En az 3 emir; biri `Kalite bekliyor` durumunda detaylı form dolu.

ÇIKTI: Bitişik navigasyon şeması + izin notları (`kalite.kayit`, `uretim.durum`) + UX soruları
```
