# prod-08 — Fabrika özel vardiya, kalıp ve ekip yönetimi (yeni komut)

```
[Buraya 00-ORTAK-BLOK-URETIM-UI.md yapıştır]

GÖREV: Seçili fabrikaya göre vardiya, kalıp ve ekip yönetimi ekranlarını tasarla.

HEDEF:
- Fabrika bazlı farklı vardiya modelini göstermek
- Kalıp ekleme/çıkarma/pasifleştirme yönetimi
- Çalışan ekleme/çıkarma ve vardiyaya atama akışı
- Üretim board/raporlarının bu ayarlara göre nasıl değiştiğini göstermek

### P0
- Fabrika detay paneli: vardiya modeli, aktif kalıp sayısı, aktif çalışan sayısı
- Kalıp listesi: kod, durum, son bakım, aktif/pasif
- Çalışan listesi: ad, rol, vardiya, aktif/pasif, fabrikadan çıkar
- “Vardiya modeli” alanı: fabrika override (firma default gösterilsin)

### P1
- Toplu çalışan atama (vardiyaya)
- Kalıp bakım planı satırları (mock)
- Fabrika bazlı “bekleyen iş” özet kartı

### P2
- Fabrikalar arası çalışan transferi (placeholder)
- Fabrikalar arası kalıp transferi (placeholder)

MOCK VERİ:
- 2 fabrika
- her fabrika için farklı vardiya modeli
- en az 8 çalışan, 10 kalıp satırı

ÇIKTI:
1) ASCII wireframe (fabrika seçici + üç sekme: Vardiya, Kalıp, Ekip)
2) P0/P1/P2 net ayrım
3) Bileşen başına kısa Tailwind satırı
4) Hangi rol neyi değiştirir (şef, vardiya amiri, fabrika admin)
5) 3–5 açık UX sorusu
```
