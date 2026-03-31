# bie-05 — Birim iş kuyruğu: üzerime atanan (birim) ve atadığım işler

```
[Buraya 00-ORTAK-BLOK-BIRIM-IS-UI.md içeriğini bağlam olarak ekle]

BAĞLAM: docs/20-proje-is-akisi-deep-dive/02-birim-kuyruklari-ve-rol-orgusu.md. Bu ekran **eski kişi bazlı görev panosunun yerini** alır.

GÖREV: Global veya modül içi **“İşlerim”** sayfası: iki sekme — **Üzerime atanan (birim)** | **Atadığım işler**. Neomorphism; MOCK. Örnek: satış, proje ofisi, mühendislik, üretim, kalite rolleri için aynı şablon, farklı mock satırlar.

---

## P0

- Üstte **birim bağlamı** (hangi birimin kuyruğu — select mock).
- **Sekme 1 — Üzerime atanan:** tablo kolonları — İş emri no, Proje, Tür (metraj / üretim öncesi mühendislik / üretim / kalite / lojistik / saha), Durum, Öncelik, Üzerinde kalma (gün), Son güncelleme.
- Satır tıklanınca **detay drawer**: özet + proje linki + aksiyonlar (Başlat, Tamamla, Bloke — mock).
- **Sekme 2 — Atadığım işler:** aynı kolonlar + **Hedef birim** sütunu; salt takip vurgusu (read-only ilerleme veya sınırlı iptal).

## P1

- Özet KPI şeridi: Bekleyen sayısı, Bugün teslim, Bloke (mock sayılar).
- Fabrika filtresi (çok fabrika).

## P2

- Üst yönetim için “birim özetleri” read-only (organizasyon doc ile uyumlu tartışma).

---

## MOCK veri zorunluluğu

- Her sekmede en az **5** satır; farklı iş türleri.
- **4–5 iş** üretim amiri örneği: üzerinde eşzamanlı işler (kullanıcı anlatımıyla uyumlu).

## ÇIKTI ZORUNLULUĞU

1) ASCII wireframe: iki sekme + drawer
2) İki mock tablo
3) Tailwind (`00b`)
4) RBAC notu: hangi rol hangi sekmeyi görür
5) UX soruları: birim değiştirince liste sıfırlanır mı?

```
