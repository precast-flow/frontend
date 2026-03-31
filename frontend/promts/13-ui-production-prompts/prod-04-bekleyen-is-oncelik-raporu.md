# prod-04 — Bekleyen işler / öncelik raporu

```
[Buraya 00-ORTAK-BLOK-URETIM-UI.md yapıştır]

[ZORUNLU ŞABLON — bu ekranın veri kabuğu]
[Buraya docs/10-ui-prototype/prompts/00c-DINAMIK-VERI-GORUNUMU-SABLONU.md içeriğini yapıştır veya özetini bağla]
Bu ekran, 00c şablonunun İLK uygulamasıdır: aynı bekleyen iş kuyruğu verisi dört görünümde (ikon | liste | tablo | galeri) gösterilmeli; toolbar’da görünüm seçici ve tercih mock persist notu bulunmalıdır.

GÖREV: Şef/vardiya için sıralanabilir bekleyen iş kuyruğu; veri sunumu 00c ile tutarlı olsun.

### P0
- **00c dört mod:** Öncelik kuyruğu kayıtları ikon, liste, tablo ve galeri modlarında aynı mock veriyle.
- **Tablo (kolon) modunda:** öncelik sıra no, emir, parça, bekleyen gün, termin riski (badge), önerilen sıra (mock skor).
- **Galeri modunda:** her iş için kart; termin riski ve öncelik no kart üzerinde okunaklı.
- **İkon / liste modlarında:** hızlı tarama; en az birincil tanımlayıcı + 1–2 kritik metrik.
- Sırayı değiştir (şef tam yetki mock); vardiya kısıtlı notu — **tablo ve galeri**de sürükle veya satır aksiyonu mock.
- Filtre: hat, proje, aciliyet (toolbar 00c ile hizalı).

### P1
- Gecikme nedeni seçimi (select mock) — raporlama için.
- Toplu “önceliği yükselt” (çoklu seçim); seçim şeridi 00c ile.
- Tablo modunda isteğe bağlı sütun görünürlüğü.

### P2
- Otomatik öneri açıklama metni (“termin yakın” — kural metni, algoritma yok).

ÇIKTI: Wireframe + 15 satır mock + dört görünümde alan eşlemesi + P0/P1/P2 + kısa Tailwind + sorular
```
