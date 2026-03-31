# mvp-03 — Roller ve izinler (RBAC, onay akışı ile uyumlu)

```
[Buraya 00-ORTAK-BLOK-MVP-UI.md içeriğini yapıştır]

GÖREV: Rol ve izin yönetimi; `mvp-detailed-analysis-report.md` ile uyumlu; onay akışı ekranından ayrı düşün ama çapraz referans ver.

### P0
- Sol: rol listesi (mock: Yönetici, Satış, Planlama, Üretim, Kalite, Sevkiyat, Saha, Salt okunur).
- Sağ: rol detay; sekmeler **Genel**, **İzinler**, **Bu role atanmış kullanıcılar** (sayı mock).
- İzinler: modül grupları (CRM, Teklif, Proje, Mühendislik, Üretim, Kalite, Yard, Sevkiyat, Saha, Rapor, Yönetim).
- Atomik izin örnekleri mock: `teklif.goruntule`, `teklif.duzenle`, `teklif.onayla`, `uretim.emri.olustur`, `uretim.durum.degistir`, `kalite.kayit`, `sevkiyat.cikis.kaydet`, `yonetim.rol.yonet`.
- Sistem rolü koruması (silinemez ikon + açıklama).

### P1
- İzin arama kutusu; toplu seçim “modülün tüm izinleri”.
- Rol şablonu içe aktar (dropdown mock).

### P2
- İzin bağımlılığı uyarısı mock (örn. `onayla` seçilince `goruntule` otomatik önerilir — metin uyarısı).

MOCK: İzin matrisinde en az 8 satır görünür; geri kalanı “+48 izin” linki.

ÇIKTI: Wireframe + hangi izinlerin onay akışındaki “aksiyona” denk geldiği küçük tablo + UX soruları
```
