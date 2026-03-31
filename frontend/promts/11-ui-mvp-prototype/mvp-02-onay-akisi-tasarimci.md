# mvp-02 — Onay akışı tasarımcısı (tüm süreçler, hiyerarşik, dinamik)

```
[Buraya 00-ORTAK-BLOK-MVP-UI.md içeriğini yapıştır]

GÖREV: Tekliften bağımsız, **yeniden kullanılabilir** onay akışı yapılandırma ekranı. Roller/kullanıcılar ile hiyerarşi. Mock.

### P0
- Süreç tipi seçimi (dropdown mock): `Teklif`, `Sevkiyat çıkışı`, `Üretim emri yayınlama` (en az 3 tip listelenir).
- Adım listesi (sıralı): her adımda **Rol seç** veya **Kullanıcı seç** (radio: rol bazlı / kişi bazlı); sıra numarası; “zorunlu” checkbox.
- Kaydet / Taslak butonları (neumorphic).
- Önizleme paneli: akış şeması metin veya yatay stepper (mock).

### P1
- Ek süreç tipleri mock: `Kalite ret sonrası yeniden üretim`, `Proje revizyonu`.
- **Eşik alanı** (numeric + para birimi) — sadece `Teklif` tipinde görünür conditional UI notu; diğer tiplerde gizli.
- “Şablondan kopyala” (dropdown: mevcut şablon adları mock).

### P2
- Paralel onay kolonları (dal-split) placeholder: “Dal A / Dal B” görsel notu.
- SLA / hatırlatma günü alanı (disabled mock).

MOCK: En az 2 kayıtlı şablon (ad, süreç tipi, adım sayısı); birini açınca adımlar dolu.

ROL NOTU: Sadece `Yönetici` ve `Süreç yöneticisi` mock rolü bu ekrana girer.

ÇIKTI: Tam sayfa wireframe + conditional eşik davranışı açıklaması + RBAC ile ilişki (onay akışı ≠ izin ayrımı) + UX soruları
```
