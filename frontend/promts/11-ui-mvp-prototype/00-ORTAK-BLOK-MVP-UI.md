# Ortak blok — Adım 11 (MVP + mock)

**Her `mvp-*.md` promptunu çalıştırmadan önce** aşağıyı yapıştır. Üzerine ilgili dosyanın görev metnini ekle.

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
