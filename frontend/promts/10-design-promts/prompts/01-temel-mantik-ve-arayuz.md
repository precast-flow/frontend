# Prompt 01 — Temel mantık + Neomorphism arayüz çerçevesi (önce bunu çalıştır)

Modül ekranlarına geçmeden önce: **ürün mantığı**, **bilgi mimarisi**, **global sayfa şablonu** ve **Neomorphism + Tailwind görsel sistemi** tek çatı altında netleşir.

---

## Yapıştırılacak tam prompt

```
[Buraya prompts/00-ORTAK-BLOK.md içeriğini yapıştır]
[00b-NEOMORPHISM-TAILWIND.md kurallarını özümsediğini belirt]

GÖREV (FOUNDATION — TEK MODÜL EKRANI YOK):
“Precast Flow” için TEMEL MANTIK + GLOBAL NEOMORPHIC ARAYÜZ çerçevesini üret.

A) ÜRÜN MANTIĞI (KISA)
- Kullanıcılar: ofis + fabrika + şantiye (tek cümle)
- Uçtan uca zincir (tek satır): CRM → Teklif → Proje → Mühendislik → Üretim → Kalite → Yard → Sevkiyat → Saha → Raporlama
- Her modülün kullanıcıya tek cümlelik vaadi (11 modül)

B) BİLGİ MİMARİSİ — SOL SIDEBAR (4 GRUP)
1) Satış & Müşteri
2) Proje & Mühendislik
3) Üretim & Kalite
4) Lojistik & Saha
- Her grupta: Türkçe menü etiketi + slug notu
- Reporting ve Mobile önizleme: menüde nereye konur, neden?

C) APP SHELL — NEOMORPHIC YAPISI (macOS hissi, gri-beyaz)
- Sayfa zemini: açık gri (ör. bg-gray-100)
- Sol sidebar: protrude veya hafif “floating panel” (rounded-3xl) — karar ver ve gerekçelendir
- Üst bar: inset arama kutusu + protrude ikon butonları (bildirim, kullanıcı)
- Ana içerik alanı: büyük rounded konteyner içinde modül içeriği (macOS kart alanı gibi)
- Alt bilgi: minimal, inset şerit veya düz metin

D) GLOBAL SAYFA ŞABLONU (TÜM MODÜLLER)
- Üst: başlık + breadcrumb + sağ üst aksiyonlar (primary sayısı kuralı)
- Filtre şeridi: inset “well” içinde mi, protrude chip’ler mi? (birini seç)
- Liste-detay / form / board için 3 satırlık karar matrisi: hangi modül hangi düzeni kullanır?
- Sağ drawer: ne zaman açılır? (global kural)

E) NEOMORPHISM BİLEŞEN SÖZLÜĞÜ (Tailwind odaklı)
Şunları TANIMLA (her biri için protrude/inset + rounded + 1 satır örnek shadow utility):
- Birincil buton, ikincil buton, tehlikeli buton
- Icon button
- Text input, search, select, textarea
- Card / KPI kartı
- Data table container
- Tabs, segmented control (pill)
- Modal / drawer yüzeyi
- Toggle switch (track inset + thumb protrude; LED isteğe bağlı gri tonları veya tek sarı sadece LED)
- Badge / status pill (düz veya çok hafif protrude; kontrastlı metin)

F) OKUNAKLILIK VE SADELİK
- Minimum metin rengi seviyeleri (gray-700+ gövde)
- Ne zaman inset’i bırakıp düz beyaz panel kullanılır? (çok içerik yoğunluğunda)
- Focus ring standardı (ring-2 ring-gray-400 …)

G) TUTARLILIK
- Fiil sözlüğü: Kaydet / İptal / Gönder / Onayla / Reddet / Sil
- Tehlikeli aksiyon: onay modalı mı undo mu? (birini seç)

H) ÇIKTI
1) ASCII: tam app shell (sidebar + üst bar + ana kart alanı) neumorphic etiketleriyle (protrude/inset yaz)
2) “Bileşen sözlüğü” tablo formatında: Bileşen | Yüzey tipi | Tailwind özet satırı
3) 10 maddelik UI checklist (neomorphism + okunabilirlik)
4) 3–5 açık soru

NOT: CRM/MES modül içi ekran üretme.
```

---

## Sonraki adım

`02-app-shell.md` → `03-dashboard.md` → `04`–`14` modüller → `15` (isteğe bağlı) → `16` demo akışı.
