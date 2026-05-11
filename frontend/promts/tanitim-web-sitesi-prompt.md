# Precast Flow — tanıtım sitesi brief’i (içerik + bilgi mimarisi)

**Amaç:** Precast Flow için **pazarlama / tanıtım web sitesi** üzerinde çalışacak yapay zekâ veya içerik üreticisine verilecek **tek kaynak brief**.  
**Kapsam:** Ürün gerçeği, hedef kitle, vaat, problem çerçevesi, yetenek alanları, önerilen **sayfa/içerik envanteri** ve **metin çıktı şablonu**.  
**Kapsam dışı (bilinçli):** Görsel tasarım — renk, tipografi, grid, bileşen stili, animasyon, illüstrasyon tarzı. Bunlar **Google Stitch** (Google Labs) veya seçtiğin tasarım aracında ayrı üretilir.

**Stitch ile çalışma notu:** Stitch, doğal dil ve referanslarla arayüz taslakları üretebilir; bu dosyayı Stitch’e **ürün bağlamı + sayfa listesi + mesaj hiyerarşisi** olarak yapıştırabilirsin. Görsel dil için Stitch’te kendi yönergelerini kullan; bu brief **ne söyleneceği** ve **hangi ekranların hangi işi gördüğü** üzerine odaklanır.

---

## 1) Tek satırlık komut (LLM’e yapıştır)

> Sen bir B2B SaaS pazarlama stratejistisin ve precast (ön döküm beton) fabrikalarına hitap ediyorsun. Aşağıdaki “Ürün gerçeği” ve “Modül grupları” bölümlerine **sadık kal**; abartılı süperlative kullanma; prototip veya gelişmekte olan alanları dürüstçe “yol haritası / gelişen kapsam” diliyle işaretle. **Tasarım veya layout önerme.** Çıktıyı bu dosyadaki “Çıktı şablonu (YAML)” yapısında üret. Dil: Türkçe (isteğe bağlı ikinci çıktı: İngilizce özet).

---

## 2) Ürün kartı (fact sheet)

| Alan | Değer |
|------|--------|
| Ürün adı | Precast Flow |
| Sektör | Prefabrik / precast beton üreticileri ve tedarik zinciri |
| Tür | Web tabanlı operasyon & planlama platformu (istemci: React + TypeScript + Vite — tanıtımda **isteğe bağlı**, “modern web uygulaması” olarak geçebilir) |
| Ana vaat | Satıştan sahaya kadar tek hatta **bilgi bütünlüğü**, planlama–üretim–kalite–lojistik görünürlüğü, **iş kuyruğu** ve **kurumsal yönetişim** (roller, onaylar, tanımlar) |
| Ton | Güvenilir, net, ölçülü B2B; “her şey hazır” yerine gerektiğinde **ürün olgunluğu** şeffaflığı |

---

## 3) İdeal müşteri profili (ICP)

- Orta ve büyük ölçekli precast fabrikalar; çok modüllü operasyonu olan organizasyonlar.
- Satış / teklif ile üretim arasında kopukluk yaşayan ekipler.
- Planlama (kalıp–vardiya–gün) ile sahadaki gerçek yükü eşleştirmek isteyen yöneticiler.
- Kalite–beton–MES hattında izlenebilirlik arayan kalite ve üretim liderleri.
- Lojistik ve şantiye koordinasyonunu üretim olaylarıyla hizalamak isteyen operasyon.

---

## 4) Jobs-to-be-done (ziyaretçi ne “işini” hallediyor?)

Site ziyaretçisi genelde şunu araştırır:

1. “Bu ürün **bizim fabrika** gerçekliğine uyuyor mu?”
2. “Hangi süreçleri kapsıyor; ERP’nin yerini mi alıyor yoksa **yanında** mı duruyor?”
3. “Planlama ve üretim arasındaki **boşluğu** nasıl kapatıyor?”
4. “**Rol ve onay** gibi kurumsal gereksinimleri karşılıyor mu?”
5. “Demo / pilot / entegrasyon beklentisi nedir?”

İçerik bu sorulara doğrudan cevap verecek şekilde kurgulanmalı.

---

## 5) Problem → çözüm (anlatı iskeleti)

**Problem kökleri (abartmadan):**

- Müşteri–teklif–proje–eleman bilgisinin farklı dosya ve araçlara dağılması.
- Planın (kapasite, kalıp, vardiya) sahada görünen öncelik ve gecikmelerle senkron olmaması.
- Üretim emirleri, beton / santral, kalite kayıtları arasında **zayıf iz sürmek**.
- Lojistik ve şantiye işlerinin üretim ve stok olaylarıyla **geç veya manuel** bağlanması.
- Onay politikası ve erişim kontrolünün ürün içinde **tekrarlanabilir** olmaması.

**Çözüm çerçevesi:**

- Tek platformda modüler görünürlük: planlama girişinden birim iş kuyruğuna, CRM’den projeye, tanımlardan üretim planlamaya.
- Eleman kimliği ve kataloglar ile **standartlaşmış ürün dili**.
- Sistem modülü ile onay, rol ve kullanıcı yönetimi.
- Üretim–kalite–lojistik–saha tarafında **vizyon ve prototip** alanları için ölçülü dil (tamamlanmış ürün iddiası yerine “hedef kapsam”).

---

## 6) Yetenek alanları — modül grupları (içerik üretiminde kaynak)

Aşağıdaki başlıklar ürün yol haritası ve MVP prototipleriyle uyumludur. Tanıtım metninde **kullanıcı faydası** dilini kullan; iç kod, prompt numarası veya ekran adı verme.

### A) Planlama & ticari–proje hattı

- Planlama özeti / giriş (modüller arası operasyon bağlamı).
- Birim iş kuyruğu: birimlere atanmış işler; “bana atanan / atadığım” perspektifi ve birim filtreleri.
- Müşteri yönetimi (CRM): müşteri ve kontak; liste–detay ve ilişki omurgası.
- Teklif ve keşif: versiyon, kalem düzeyi, onaya uygun akış.
- İş başlatma: üretim öncesi kararlar; mühendislik ve üretim hazırlığına köprü.
- Proje yönetimi: özet, elemanlar, zaman çizelgesi ekseninde yaşam döngüsü.
- Üretim planlama (ürün planı): kalıp × gün × vardiya; taslak/yayın, özet ve filtreler.

### B) Tanımlar & veri standardizasyonu

- Tanımlar merkezi (eleman kimliği, malzeme, standart seri ürün girişleri).
- Eleman kimlik ve isimlendirme: firma kodları, tipoloji eşlemesi, IFC içe aktarma, isimlendirme şablonları.
- Malzeme kataloğu ve standart seri ürünler.

### C) Üretim, kalite, lojistik, saha (vizyon + prototip)

Bu blok geniş bir yelpaze: üretim özeti, MES benzeri emirler, kalıp panosu, öncelik kuyrukları, beton reçetesi, santral operasyonu, kalite ve numune, yard ve lokasyon, sevkiyat, şantiye görevleri, raporlama, mobil web önizleme.  
Tanıtım dilinde **entegre görünürlük hedefi** ve **modüler genişleme** vurgulanır; her alt başlık için “tam ürün” iddiası yerine olgunluk derecesine uygun ifade kullan.

### D) Sistem & yönetim

- Onay akışı tasarımcısı (hiyerarşik şablonlar, süreç tipleri).
- Roller ve izinler (RBAC anlayışı).
- Kullanıcı yönetimi (rol ve fabrika erişimi gibi kurumsal kimlik).
- Eleman kimlik yönetimi (yönetici görünümü).

### E) Hesap

- Profil ve ayarlar.

---

## 7) Önerilen tanıtım sitesi bilgi mimarisi (içerik sayfaları / bölümler)

Tasarım veya bileşen seçimi yok; yalnızca **hangi başlıkların** sitede iş göreceği envanteri. Stitch’te ekran üretirken bu listeyi “sayfa başına birincil mesaj” ile eşleştirebilirsin.

1. **Ana sayfa:** Tek cümlelik pozisyon + 3–5 fayda + güven unsurları (ör. sektör odağı, kurumsal yönetişim).
2. **Ürün / platform:** Uçtan uca hikâye; modül gruplarına kısa kartlar (A–E).
3. **Kimin için:** Rol bazlı sayfa veya tek sayfada segmentler (planlama, satış, kalite, lojistik, IT).
4. **Akışlar / senaryolar:** En az 2 uçtan uca örnek (ör. teklif→onay→proje→plan; birim iş kuyruğu→üretim görünürlüğü).
5. **Güven & şeffaflık:** Veri modeli, entegrasyon beklentisi, pilot yaklaşımı (bağlayıcı vaat yok).
6. **SSS:** Entegrasyon, güvenlik, demo, yol haritası.
7. **İletişim / demo talebi:** Kısa form veya CTA metinleri (metin burada üretilir; form alanları tasarımda).

---

## 8) Google Stitch için kısa bağlam paketi (kopyala–yapıştır)

Aşağıdaki paragrafı Stitch’e ürün bağlamı olarak verebilirsin; **görsel yönerge ekleme** zorunluluğu yok — Stitch tarafında kendi estetik brief’ini yazarsın.

```text
Precast Flow, precast beton fabrikaları için web tabanlı bir operasyon ve planlama platformudur.
Kapsam: CRM ve teklif/keşiften proje ve üretim planlamaya; eleman kimliği ve katalog tanımlarından
birim iş kuyruğu ve sistem yönetimine (onay akışları, roller, kullanıcılar) kadar modüler bir hat.
Tanıtım sitesi; tek platformda bilgi bütünlüğü, planlama–üretim–kalite–lojistik görünürlüğü ve
kurumsal yönetişim mesajını anlatmalı. Hedef kitle fabrika yönetimi, planlama, satış, mühendislik,
kalite, lojistik ve IT. Abartısız B2B tonu; prototip veya gelişen alanlar için şeffaf dil.
```

---

## 9) Çıktı şablonu (YAML) — LLM’den istenecek yapı

Aşağıdaki yapıyı doldurarak üret; alan adlarını koru.

```yaml
meta:
  dil: tr
  urun: Precast Flow
  ton: B2B, olculu, seffaf-olgunluk
positioning:
  one_liner: ""
  value_props: [] # 3-5 madde
  icp_summary: ""
problem_solution:
  problems: [] # madde listesi
  solution_narrative: "" # 2-4 kısa paragraf
pillars: # A–E gruplarıyla uyumlu 5-7 başlık
  - title: ""
    body: ""
personas:
  - name: ""
    pains: []
    outcomes: []
scenarios:
  - title: ""
    steps: [] # 4-7 adım, kullanıcı dili
pages:
  home: { headline: "", subhead: "", proof_points: [] }
  platform: { sections: [] }
  who_its_for: { segments: [] }
  flows: [] # her biri: { title, bullets: [] }
  trust: { body: "" }
faq: [] # { q, a }
cta:
  primary: ""
  secondary: ""
  demo_copy: ""
optional_en_summary:
  one_liner: ""
  value_props: []
```

---

## 10) Kalite çubuğu (içerik kontrol listesi)

- [ ] Precast / fabrika gerçekliğine uygun, jenerik “inşaat yazılımı” diline kaymıyor.
- [ ] Modül listesiyle çelişen vaat yok; prototip alanlar için temkinli ifade var.
- [ ] ERP / MES / IFC gibi terimler geçiyorsa **iş açıklaması** ile destekleniyor.
- [ ] Hukuki garanti, kesin entegrasyon vaadi veya uyumluluk sertifikası iddiası yok.
- [ ] Tasarım veya layout önerisi yok (Stitch ayrı).

---

## 11) Sürüm notu

Bu brief, tanıtım sitesinin **metin ve bilgi mimarisi** ile **Stitch’e verilecek ürün bağlamını** birlikte kapsayacak şekilde güncellenmiştir. Görsel tasarım kararları bu dosyada tanımlanmaz.
