# plan-08 — Mock veri şeması, kenar durumları, optimistic UI ve P2

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Planlama ekranı için **veri modeli** (mock), **kenar durumları** ve **P2** kapsamını netleştir.

## 🔍 Konu tanımı
Frontend prototipi ve backend sözleşmesi için tek tip alan isimleri; boş/yükleme/hata senaryoları; ileride genişleyecek alanlar.

## 🎯 Amaç
Tüm `plan-01`…`plan-07` parçalarını aynı mock şemada birleştir.

### P0 — Şema (minimum alanlar)
**PlanItem** (ızgara öğesi):
- `id`, `title`, `productId`, `imageUrl | null`
- `moldId`
- Zaman: `startAt`, `endAt` **veya** `anchorDayId` + `startShiftIndex` + `durationHours` (bir yaklaşım seç ve tutarlı kal)
- `status` (plan-05 anahtarları ile aynı)
- `priority` (1–5 mock)
- `concreteRecipeId` (mock onaylı liste referansı)
- `estimatedVolumeM3`, `estimatedSteelKg`
- `projectId`, `orderId` (opsiyonel string)
- `tags[]`, `warnings[]` (string)

**Mold**, **Shift**, **Day** tabloları plan-01 ile uyumlu.

### P0 — Kenar durumları
- **Loading:** iskelet ızgara + shimmer notu.
- **Boş:** “Bu aralıkta plan yok” + “İş ekle” CTA.
- **Hata:** üst banner (text-red-700 üstü) + yeniden dene.
- **Kısmi yetki:** salt okunur şeridi.

### P1
- **Optimistic UI:** taşıma anında kart yeni yerde; hata olursa geri dön + toast.
- Çakışma uyarısı sunucudan gelince kart kenarında ikon.

### P2
- Sanal scroll, export, çoklu seçim, performans notları.
- Mobil: ızgara yerine gün seçici + liste (alternatif layout).

### Mock tablolar (zorunlu)
1) **PlanItem:** **25 satır** (çeşitli status + span örnekleri).  
2) **API hata örnekleri:** 4 satır — `code`, `userMessage`.  
3) **Beton reçete havuzu (mock):** 6 satır — `recipeId`, `label`, `strengthClass`.

### Çıktı formatı ekleri
- Tek sayfada **alan sözlüğü** (field → açıklama → örnek değer).
- **Entegrasyon soruları:** MES gerçek zamanlı durum ile plan durumu çakışırsa hangisi baskın?

ÇIKTI: Şema + tablolar + kenar durumları + P0/P1/P2 + sorular
```
