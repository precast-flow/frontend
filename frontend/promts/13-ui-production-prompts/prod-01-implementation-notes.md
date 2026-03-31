# prod-01 — Üretim özet dashboard (uygulama notları)

Kaynak prompt: `prod-01-uretim-ozet-dashboard.md` + `00-ORTAK-BLOK-URETIM-UI.md`.

## ASCII (blok)

```
┌ Fabrika + vardiya (Sabah / Akşam / Gece) ─────────────────┐
├─ KPI (protrude) ──────────────────────────────────────────┤
│ [ planlı ] [ üretimde ] [ geciken ] [ santral kuyruk ]     │
├─ KPI (protrude-sm) ───────────────────────────────────────┤
│ [ kalite bekleyen ] [ bugün tamam ] [ dün kalan ] [ hat % ]│
├─ inset tablo (5 satır)          │ Astlar salt özet │ P2 bar │
│  WO | parça | gecikme | etiket  │   + link         │ spark  │
└─────────────────────────────────┴──────────────────┴──────────┘
```

## 8 KPI tutarlı tablo

| Alan | Değer (sabah) | Birim |
|------|----------------|-------|
| Bugün planlı emir | 14 | adet |
| Üretimde | 6 | adet |
| Geciken | 3 | adet |
| Santralde bekleyen döküm | 2 | kuyruk |
| Kalite bekleyen | 4 | adet |
| Bugün tamamlanan | 2 | adet |
| Dün tamamlanmayan | 2 | adet |
| Hat yükü (plan) | 87 | % |

Vardiya çarpanı: `SHIFT_FACTORS` — akşam/gece KPI’lar hafif düşer (mock).

## Tailwind (00b)

| Blok | Sınıf özeti |
|------|-------------|
| KPI kart | `rounded-2xl bg-gray-50 p-4 shadow-neo-out dark:bg-gray-900/90` |
| Kritik tablo kabı | `rounded-2xl bg-gray-100 p-4 shadow-neo-in dark:bg-gray-950/80` |
| Vardiya seçici | `rounded-2xl bg-gray-100 p-1 shadow-neo-in` + aktif `bg-gray-800 text-white shadow-neo-out-sm` |
| Sparkline bar | `rounded-t-md bg-gray-400` + yükseklik yüzde |

## Roller (salt / düzenle)

| Rol | Bu ekranda |
|-----|------------|
| Üretim şefi | KPI + kritik liste + vardiya; MES’e git; ast özeti görür |
| Vardiya amiri | Aynı; operasyonel odak |
| Usta / santral operatörü | Özet salt okunur (demo select disabled — üretimde RBAC) |
| Planlama | İsteğe bağlı görüntü; düzenleme MES’te |

## Kod

| Dosya | Açıklama |
|-------|----------|
| `app/src/data/productionSummaryMock.ts` | KPI, kritik 5 satır, haftalık seri, ast özeti |
| `app/src/components/production/ProductionSummaryDashboard.tsx` | UI |
| `app/src/data/navigation.ts` | `production-summary` → `/uretim-ozet` |

Navigasyon: **Üretim & Kalite → Üretim özeti** (MES’in üstünde).

## UX soruları

1. Sabah özeti tek sayfa mı kalmalı, yoksa mobilde ilk kart “kritik 3” ile mi sıkıştırılmalı?
2. Vardiya değişiminde KPI’lar gerçek zamanlı mı yenilenecek, yoksa sabit “vardiya raporu” snapshot mı?
3. Santral kuyruk ile MES emir durumu çakışınca öncelik hangi sistemden?
4. Astların açık emirleri üretim özetinde mi kalmalı, yoksa yalnızca görev panosunda mı?
