# prod-08 — Fabrika özel vardiya, kalıp ve ekip komutu (uygulama notları)

Kaynak: `prod-08-fabrika-ozel-vardiya-kalip-ve-ekip-komutu.md`.

## Wireframe (ASCII)

```
┌ Fabrika seçici: [IST-HAD | KOC-01] ─ Bekleyen iş kartı
├ Sekmeler: [Vardiya] [Kalıp] [Ekip]
│
├ Vardiya
│  ├ Firma default vardiya modeli
│  ├ Fabrika override modeli
│  └ Rol yetkileri (şef / vardiya amiri / fabrika admin)
│
├ Kalıp
│  ├ Kalıp listesi: kod, durum, son bakım, aktif/pasif
│  └ Bakım planı satırları (P1 mock)
│
└ Ekip
   ├ Çalışan listesi: ad, rol, vardiya, aktif/pasif, fabrikadan çıkar
   └ Toplu vardiya atama (P1)
```

## P0 / P1 / P2 ayrımı

| Seviye | Özellik |
|---|---|
| P0 | Fabrika detay paneli, vardiya override, kalıp listesi, çalışan listesi |
| P1 | Toplu çalışan atama, kalıp bakım planı, bekleyen iş özet kartı |
| P2 | Çalışan transferi placeholder, kalıp transferi placeholder |

## Veri ve bileşenler

- `app/src/data/productionFactoryOpsMock.ts`
  - 2 fabrika
  - 8 çalışan
  - 10 kalıp satırı
- `app/src/components/production/ProductionFactoryOpsView.tsx`
  - Fabrika seçici + 3 sekme
  - Satır bazlı mock aksiyonlar
  - Toplu vardiya atama toast

## Bileşen başına kısa Tailwind satırı

- Fabrika paneli: `rounded-2xl bg-gray-50 p-4 shadow-neo-out`
- Sekme şeridi: `flex gap-2 rounded-2xl bg-gray-100 p-1.5 shadow-neo-in`
- Kalıp/Ekip tabloları: `overflow-auto rounded-2xl bg-gray-50 shadow-neo-in`
- P2 placeholder: `rounded-2xl border border-dashed`

## Rol yetkisi (mock)

- Şef: vardiya modeli + ekip atama değiştirir.
- Vardiya amiri: ekip vardiya ataması yapar, modeli izler.
- Fabrika admin: kalıp ve çalışan aktivasyon/pasif yönetir.

## UX soruları

1. Vardiya modeli değişince mevcut atamalar otomatik yeniden dağıtılsın mı?
2. Pasif kalıplar ana listede gösterilsin mi, arşiv tabına mı taşınsın?
3. Fabrikadan çıkarılan çalışan geçmiş raporlarda nasıl gösterilmeli?
4. Toplu atamada rol temelli sınır hangi kural setinden beslenecek?
5. Transfer işlemlerinde çift onay gerekir mi?
