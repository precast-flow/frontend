# Ortak blok — Parametrik 3B prefab MVP komutları (Adım 18)

```
[Buraya docs/10-ui-prototype/prompts/00b-NEOMORPHISM-TAILWIND.md kurallarının özetini veya tamamını ekle: gri–beyaz, neumorphic kart, okunabilirlik.]

PARAMETRİK 3B ORTAK KURALLAR:
- Amaç: Prefab beton elemanları (kolon, kiriş, menfez, panel, L/U perde) için **ölçü → geometri** boru hattını tanımlamak; üretim ERP formu ile uyumlu **tek tip JSON** düşünmek.
- Üç katmanı ayır: (1) Parametre modeli, (2) Geometri üretim kuralları (extrude, CSG), (3) Web’de gösterim (orbit/zoom/birim).
- Bu prompt paketi **tam uygulama kodu üretmeyi zorunlu tutmaz**; istenirse geometri **madde madde algoritma** veya **sözde kod** ile anlatılır. React/Three/JSCAD tam dosya kodu sadece açıkça istenirse kısa özet snippet seviyesinde verilir.
- Her yanıtta: **P0 / P1 / P2** ayrımı; en az **2 örnek JSON** (geçerli + bir geçersiz veya sınır durumu); **birim** (mm önerilir, tutarlılık şart).
- UI geçen görevlerde: parametre formu + 3B önizleme alanı wireframe; Tailwind için 3–6 kısa utility satırı yeterli.
- Donatı, demir çizimi, IFC export, kalıp çizimi: **MVP dışı** notu düş; sadece beton dış yüzeyi (solid) hedeflenir.
- Risk: manifold geometri, coplanar yüzeyler, boolean hataları — ilgili prompt’ta kısaca belirt.

ÇIKTI FORMATI (varsayılan):
1. Kısa özet (1 paragraf)
2. Parametre tablosu veya JSON şeması
3. Geometri adımları (numaralı)
4. P0 / P1 / P2
5. Örnek JSON(ler)
6. UI wireframe (sadece UI içeren komutlarda)
7. Tailwind ipuçları (UI varsa)
8. Açık sorular (≤5)
```
