# mvp-16 — Uçtan uca mock senaryo (P0 + P1 parçaları)

## Ortak blok (Adım 11 — MVP + mock)

Aşağıdaki kutu, `00-ORTAK-BLOK-MVP-UI.md` ile aynıdır; her `mvp-*.md` görevinde üst bağlam olarak kullanılır.

```
ÖNCELİK: Bu görev Adım 11 — MVP UI prototipidir. Tam backend yok; tüm liste ve formlar MOCK veri ile doldurulur.

ÜST BAĞLAM (10-ui-prototype):
- docs/10-ui-prototype/prompts/00-ORTAK-BLOK.md ve 00b-NEOMORPHISM-TAILWIND.md kuralları geçerlidir: Neomorphism, gri-beyaz, mor yok, macOS-benzeri kartlar, bileşen başına kısa Tailwind satırı.

İŞ MODELİ (karar özeti):
- Tek şirket varsayımı; UI’da birden fazla FABRİKA seçici (mock: İstanbul Hadımköy, Kocaeli, Ankara).
- Onaylar: teklif dışında da tüm süreçlerde hiyerarşik, dinamik akış tasarımcısı ile yönetilir (mock süreç tipleri).
- Kalite: üretimle bitişik modül; sadece “kapanış onayı” değil.
- Mühendislik: dosya yükleme + manuel alanlar (mock dosya listesi).
- Şantiye: web odaklı; mobil sonraki faz.
- Şirketler arası admin / modül satın alma ekranları: bu prompt paketinde ÜRETİLMEZ; tek cümle not yeterli.

ÇIKTI ZORUNLULUKLARI:
1) Her özellik için P0, P1 veya P2 etiketi
2) Mock veri: en az bir örnek tablo veya JSON-benzeri liste (müşteri, emir, teklif no, fabrika kodu vb.)
3) Fabrika bağlamı: hangi ekranda filtre/seçici olduğunu yaz
4) Yetkisiz görünüm: en az bir “bu rol göremez” notu (hangi rol)
5) 2–4 açık UX sorusu (isteğe bağlı iyileştirme için)

KOD: Uzun React projesi yazma; kısa Tailwind + yapı yeterli.
```

---

## Görev

**GÖREV:** Tek senaryoda tüm MVP ekranlarını sırayla gez; her adımda mock veri güncellenmiş gibi göster.

**SENARYO ADIMLARI (18 adım):** Aşağıdaki tablo minimum kapsamdır. Uygulama içi rehber: **Ayarlar → Uçtan uca senaryo** (`SettingsPage`, `app/src/data/e2eScenarioMock.ts`).

| # | Ekran | Basılan kontrol | P0/P1 | Mock state değişimi |
|---|--------|-----------------|-------|----------------------|
| 1 | Giriş · üst çubuk (fabrika) | `/login` “Giriş yap”; sonra üst çubukta fabrika **IST-HAD** seçilir | P0 | Oturum ve bağlam kodu IST-HAD (İstanbul Hadımköy) |
| 2 | Roller ve İzinler | Yeni rol / izin ızgarası kaydet | P0 | Örnek rol + izin kümesi listeye eklenmiş gibi |
| 3 | Onay Akışı Tasarımcısı | Süreç tipi Teklif; **3 adım** (rol + tutar eşiği) kaydet | P0 | Teklif şablonu tek kayıt + önizleme |
| 4 | Kullanıcı Yönetimi | Kullanıcı ekle: **Satış** rolü, tek fabrika | P0 | Tabloda yeni satır + rol etiketi |
| 5 | Profil / oturum notu | Demo “Satış” bağlamı (çoklu oturum yok) | P1 | UI “Satış temsilcisi” gibi etiketlenir |
| 6 | CRM / İletişim | Yeni müşteri kaydet | P0 | Müşteri listesinde yeni kayıt |
| 7 | Teklif & Keşif | Yeni teklif, kalemler, onaya gönder | P0 | Durum “Onay bekliyor”; onay çekmecesi |
| 8 | Teklif (onaycı 1) | Onay çekmecesi: 1. onay | P0 | Adım 1 tamam; 2. onaycıda bekler |
| 9 | Teklif (onaycı 2 + eşik) | 2. onay; tutar eşiği → 3. adım mock | P1 | 3. adım veya “onaylandı” |
| 10 | Proje Yönetimi | Onaylı tekliften projeyi aç | P0 | Proje kartı + örnek elemanlar |
| 11 | Mühendislik | Dosya satırları + manuel alan; üretime hazır | P0 | Paket/checklist mock güncellenir |
| 12 | Üretim (MES) | Üretim emri oluştur, başlat | P0 | Emir “Çalışıyor”; kalite referansı |
| 13 | Kalite | Ölçü gir, onayla | P0 | Kayıt onaylı; MES çapraz mock |
| 14 | Yard | Lokasyon ata; sevkiyata hazır | P0 | Harita/etiket güncellenir |
| 15 | Sevkiyat | Çıkış + sevkiyat onay şablonu mock | P0 | Çıkış onaylı; sevk no |
| 16 | Saha (Şantiye) | Teslim alındı | P0 | Görev tamamlandı mock |
| 17 | Genel Bakış | KPI kartları | P0 | mvp-14 özet KPI güncel |
| 18 | Üst çubuk bildirimleri | Bildirim zili; tamamlandı mock | P0 | Liste “tamamlandı” öğeleri |

---

## Eksik kalan tek risk maddesi

**Çoklu kullanıcı / rol değişimi:** Gerçek kimlik doğrulama ve oturum başına RBAC olmadan “onaycı 1/2” ve “Satış kullanıcısı” adımları yalnızca **not veya aynı oturumda bağlam etiketi** ile temsil edilir; demo ile üretim davranışı bire bir örtüşmez — entegrasyon testi için ayrı ortam gerekir.

---

## UX soruları (açık)

1. Onay zincirinde **otomatik hatırlatma** (SLA) MVP’de gösterilmeli mi, yoksa yalnızca bildirim listesi mi?
2. Tekliften projeye geçiş **tek tık zorunlu** mu, yoksa proje yöneticisi manuel oluşturmalı mı?
3. Sevkiyat ve saha için **aynı sevk numarası** tek kaynak mı (tek doğruluk), yoksa iki modülde çift yazım mock mu kabul?
4. Dashboard’da **fabrika özeti vs. tek fabrika** varsayılanı rol bazlı mı kilitlenmeli?

---

## Çıktı özeti

- **Belge:** Bu dosya (tablo + risk + sorular).
- **Kod:** `app/src/data/e2eScenarioMock.ts` + Ayarlar sekmesi **Uçtan uca senaryo** — adım başına “Modüle git” / giriş / IST-HAD kısayolu.
