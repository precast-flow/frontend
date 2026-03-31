# plan-04 — Günlük alt özet: adet, m³, demir ve tahminler

```
[Buraya 00-ORTAK-BLOK-PLANLAMA-TASARIM.md bağlamını ekle]
[Buraya 00-ORTAK-BLOK.md + 00b + 00-ORTAK-BLOK-URETIM-UI.md içeriklerini yapıştır veya dosya yollarıyla bağla]

GÖREV: Her **gün sütunu** için **toplamlar** ve “günün yükü” özeti tasarla (planlayıcı kararını destekler).

## 🔍 Konu tanımı
Üst ızgaradan sonra kullanıcı, seçili aralıkta her gün için **ne kadar iş yüklendiğini** sayısal olarak görmeli (adet, hacim, demir, riskli iş sayısı vb.).

## 🎯 Amaç
Günlük kapasite planlaması: abartılı günler ve sakin günler bir bakışta ayırt edilsin.

### P0
- Her gün için **alt özet bandı** (sticky footer veya gün sütununun altında kompakt blok).
- **Metrikler (mock tutarlı birimler):**
  - Planlanan **toplam adet** (eleman).
  - Tahmini **m³ beton**.
  - Tahmini **demir (kg)** veya demir yoğunluğu × hacim açıklaması (tooltip).
- **Uyarı rozeti:** örn. “kapasite üstü”, “eksik reçete seçimi olan iş var” (sayı göstergesi).

### P1
- Vardiya kırılımı: gün toplamının altında V1/V2/V3 dağılımı (mini bar veya üç rakam).
- “Riskli termin” sayısı (gecikme ihtimali yüksek işler).

### P2
- Senaryo karşılaştırması (taslak A vs taslak B) — sadece wireframe etiketi.

### Mock tablolar (zorunlu)
1) **Günlük özet:** 7 satır — `date`, `pieces`, `volumeM3`, `steelKg`, `warningsCount`.  
2) **Uyarı kodları:** 5 satır — `code`, `label`, `severity`.

ÇIKTI: Yerleşim şeması + metrik hiyerarşisi + P0/P1/P2 + sorular
```
