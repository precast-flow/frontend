# Uçtan uca demo akışı — Prompt 16

Neomorphism tutarlılık testi: tek kullanıcı hikâyesi, her adımda **protrude / inset** yüzeyi ve **basılan kontrol**. Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md`.

---

## Senaryo özeti

CRM → Teklif → Proje → Mühendislik → MES → Kalite → Yard → Sevkiyat → Saha → Genel bakış (KPI).

---

## Adım adım (ekran + kontrol + Tailwind özeti)

### 1) CRM — müşteri seç

| | |
|--|--|
| **Ekran** | CRM / İletişim · liste–detay |
| **Kontrol** | Liste satırı veya müşteri seçimi; sekmeler, isteğe bağlı drawer |
| **Yüzey** | Liste öğeleri protrude veya hover’lı düz satır; arama **inset well** |
| **Tailwind (1 satır)** | Seçilebilir satır: `rounded-xl bg-gray-100 shadow-neo-out-sm`; arama: `rounded-2xl shadow-neo-in text-gray-800`. |
| **Boş / hata inset** | Müşteri yok: `shadow-neo-in rounded-xl p-4` içinde açıklama + secondary `shadow-neo-out-sm` “Yeni müşteri”. |

### 2) Teklif — oluştur → onay

| | |
|--|--|
| **Ekran** | Teklif & Keşif · kalem tablosu |
| **Kontrol** | Satır ekleme; versiyon; **onay** drawer / modal birincil CTA |
| **Yüzey** | Ana kab **protrude**; özet ve şartlar **inset** |
| **Tailwind** | Onay CTA: `bg-gray-800 text-white shadow-neo-out-sm`; özet metin: `rounded-xl shadow-neo-in`. |
| **Boş / hata** | Kalem yok: **inset** uyarı kutusu, başlık `text-red-700`. |

### 3) Proje — panoyu aç

| | |
|--|--|
| **Ekran** | Proje Yönetimi · sekmeler |
| **Kontrol** | Tab: Özet / Elemanlar / Zaman çizelgesi |
| **Yüzey** | Sekme track **inset**; aktif sekme **protrude** pill |
| **Tailwind** | Track: `rounded-full shadow-neo-in p-1`; içerik kartı: `rounded-2xl shadow-neo-out-sm`. |
| **Boş / hata** | Eleman listesi boş: inset bilgi metni. |

### 4) Mühendislik — üretime hazır

| | |
|--|--|
| **Ekran** | Mühendislik · paket listesi + checklist |
| **Kontrol** | Checklist toggle; **Üretime hazır** modal onayı |
| **Yüzey** | Paket kartları **protrude**; checklist satırları **inset** |
| **Tailwind** | Modal: `rounded-2xl shadow-neo-out`; alan: `rounded-xl shadow-neo-in`. |
| **Boş / hata** | Dosya kilidi: inset uyarı + `text-red-800`. |

### 5) MES — emir oluştur → tamamla

| | |
|--|--|
| **Ekran** | Üretim (MES) · pano / tablo |
| **Kontrol** | Slot veya emir seç; tamamla; çakışmada modal |
| **Yüzey** | Ana sahne **protrude**; hücre/track **inset** hissi |
| **Tailwind** | Seçili slot: `ring-2 ring-gray-800`; modal: `shadow-neo-out-sm`. |
| **Boş / hata** | Boş gün: inset açıklama + `text-gray-700`. |

### 6) Kalite — kontrol (MVP sınırı)

| | |
|--|--|
| **Ekran** | Kalite · kuyruk + form |
| **Kontrol** | Kuyruk satırı; onay / ret / tamir (prototip sade) |
| **Yüzey** | Kuyruk **inset** liste; birincil aksiyonlar **protrude** |
| **Tailwind** | Kuyruk kabı: `rounded-2xl shadow-neo-in`; onay: `bg-gray-800 shadow-neo-out-sm`. |
| **Boş / hata** | Kuyruk boş: `shadow-neo-in` “Bekleyen kayıt yok”. |
| **Atlandı / sadeleşme notu** | Tam NCR-CAPA MVP dışı; üretimde UI sadeleşir: tek sütun kuyruk, çok adımlı drawer yerine tek ekran formlar. |

### 7) Yard — lokasyon

| | |
|--|--|
| **Ekran** | Yard / Sahası · harita veya grid |
| **Kontrol** | Lokasyon seç; transfer / sevkiyat hazırlık CTA |
| **Yüzey** | Karo **protrude**; seçili hücre **inset** vurgu |
| **Tailwind** | Karo: `shadow-neo-out-sm`; seçili: `shadow-neo-in ring-1 ring-gray-400`. |
| **Boş / hata** | Veri yok: inset gri alan + açıklama. |

### 8) Sevkiyat — çıkış

| | |
|--|--|
| **Ekran** | Sevkiyat · plan ve yükleme adımları |
| **Kontrol** | Adım ilerletme; çıkış kaydı primary |
| **Yüzey** | Adım kartları **protrude**; durum özeti **inset** |
| **Tailwind** | Adım: `rounded-2xl shadow-neo-out-sm`; özet şerit: `shadow-neo-in py-2`. |
| **Boş / hata** | Plan boş: inset uyarı; risk `text-red-800`. |

### 9) Saha — teslim / montaj

| | |
|--|--|
| **Ekran** | Saha (Şantiye) · görev listesi |
| **Kontrol** | Görev kartı; **Teslim alındı** / **Montaj tamamlandı** |
| **Yüzey** | Kartlar hafif **protrude** (dış mekan okunurluğu); detay **inset** |
| **Tailwind** | Kart: hafif çift gölge + `ring-1 ring-gray-300/70`; CTA: `min-h-14 shadow-neo-out-sm`. |
| **Boş / hata** | Görev yok: inset mesaj; senkron rozeti inset pill. |

### 10) Dashboard — KPI

| | |
|--|--|
| **Ekran** | Genel Bakış |
| **Kontrol** | KPI **protrude** kartlara tık; uyarılar **inset** listeden modüle git |
| **Yüzey** | KPI protrude-sm; uyarılar inset kuyruk; mini grafik inset |
| **Tailwind** | KPI: `min-h-[148px] rounded-2xl shadow-neo-out-sm`; uyarılar: `rounded-2xl shadow-neo-in`. |
| **Boş / hata** | KPI veri yok: kart içi inset alt metin veya tek satır hata. |

---

## Navigasyon şeması (modül id)

```text
crm → quote → project → engineering → mes → quality → yard → dispatch → field → dashboard
```

---

## UX soruları

1. Demo akışı “rehber modunda” adımları sırayla kilitlemeli mi, yoksa serbest gezinme mi kalsın?  
2. Kalite atlandığında metriklerde “N/A” mı, yoksa son adımı otomatik işaretleme mi?  
3. Şantiye offline iken demo aynı ekranları mı gösterir, yoksa inset “çevrimdışı” şeridi mi?  
4. Dashboard KPI tıklanınca doğrudan ilgili modül filtresi açılmalı mı (derin link)?  
5. Bu akış eğitim videosu için adım zaman damgasıyla export edilebilir mi (JSON)?

---

## Uygulama (prototip)

- Senaryo adımları ve modül id’leri: `app/src/data/demoFlow.ts` (isteğe bağlı; sunum / dokümantasyon için).
- Genel Bakış ekranında **grafik panosu** (`dashboardMock.ts`, `DashboardCharts.tsx`); uçtan uca adım listesi UI’da kaldırıldı.

Raporlama ve Mobil önizleme bu 10 adımlı hikâyede zorunlu değildir; tam modül seti menüde kalır.
