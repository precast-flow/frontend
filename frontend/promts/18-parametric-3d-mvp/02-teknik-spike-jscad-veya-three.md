# 02 — Teknik spike: JSCAD vs Three.js extrude (komut)

```
[Buraya 00-ORTAK-BLOK-PARAMETRIC-3D.md yapıştır]

GÖREV: **Tek eleman** (dikdörtgen kesit kolon) ile **2–3 günlük spike** planı hazırla. İki seçenek karşılaştırılacak: **A) JSCAD** tabanlı parametrik üretim, **B) Three.js** `BoxGeometry` veya `ExtrudeGeometry` ile basit prizma.

SPIKE ÇIKTILARI (her biri için madde madde):
- Aynı giriş JSON’u (örnek ver) ile hangi adımların çalıştığı.
- Tarayıcıda yeniden boyutlandırma (parametre değişince model yenilenir) davranışı.
- Export ihtiyacı (STL/GLB) MVP’de gerekli mi?
- Paket boyutu / build karmaşıklığı (kabaca).
- Hangi seçenek **bu ekibe** önerilir ve **neden** (3 kriter: hız, bakım, geometri zenginliği).

### P0
- Kolon için minimal parametre seti: `sectionWidth`, `sectionDepth`, `height` (mm).
- İki seçenek için **karşılaştırma tablosu** (en az 6 satır).
- Spike sonunda “karar” paragrafı (tek seçenek veya hibrit: örn. JSCAD üret + Three viewer).

### P1
- Performans notu: 60 FPS hedefi için mesh basitleştirme.
- Hata durumu: NaN, sıfır yükseklik.

### P2
- İkinci spike: aynı JSON’u **Replicad** ile okumak (sadece plan).

ÇIKTI: Spike checklist (gün gün) + tablo + karar + P0/P1/P2 + sorular
```
