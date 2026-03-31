# mvp-17 — Organizasyon rapor hattı (`reports_to`) + görev panosu (salt okunur üst görünürlük)

```
[Buraya 00-ORTAK-BLOK-MVP-UI.md içeriğini yapıştır]

BAĞLAM (domain):
docs/02-actors/organizasyon-hiyerarsi-ve-gorev-gorunurlugu.md dosyasındaki mantık ZORUNLUDUR. Özet:
- Kullanıcı kaydında üst kişi seçimi: alan adı ürün dilinde örn. "Rapor gönderimi" / teknik `reports_to`.
- Astın ekranına düşen görevler, üst kullanıcıya iş akışı üste atamasa bile SALT OKUNUR yansır.
- "Bana / gruba atanan" çalışılır; "benim başlattığım ve başkasına atadığım" salt takip; "astlarımın işleri" üst için salt okunur.

GÖREV: Aşağıdaki ekranları Neomorphism + gri-beyaz ile tasarla; tamamen MOCK veri.

---

## A) Kullanıcı formu genişlemesi (mvp-04 ile entegre)

### P0
- Kullanıcı oluştur/düzenle formunda alan: **Rapor gönderimi** (veya "Bağlı olduğu yönetici") — kullanıcı arama / select (mock: Tahir Y., Ayşe K.).
- Seçim sonrası küçük **org önizleme** metni: "Bu kullanıcı [Üst Ad Soyad]'a bağlıdır (ast)."
- İsteğe bağlı alan: **Benim durumum** (serbest metin veya önceden tanımlı durum select — mock).
- Döngü engeli notu: kullanıcı kendisini veya altını üst seçemez (validasyon metni, mock).

### P1
- "Doğrudan astları" sayısı badge (mock: 3 kişi).
- Mini org chart ASCII veya basit ağaç (1 üst, astlar listesi).

### P2
- Çoklu üst / matris organizasyon placeholder (disabled + "ileride" tooltip).

MOCK KULLANICILAR: Tahir (müdür, üstü yok), Sen (uzman, reports_to=Tahir), Emre (iş atayan, aynı departman).

---

## B) Görev / iş panosu (yeni sayfa veya mevcut dashboard’a sekme)

### P0 — Sekmeler veya sol filtre (net ayrım)

1. **Bana atananlar** — tam etkileşim (aç, güncelle, tamamla — mock butonlar).
2. **Grubuma atananlar** — grup kuyruğu (mock takım "Muhasebe"); çalışılabilir yetki notu.
3. **Başlattığım / delegasyon** — ben oluşturdum, başkasına atadım; **salt okunur** satırlar (durum, bekleyen gün, assignee mock).
4. **Astlarımın işleri** (sadece `reports_to` zincirinde üst olan kullanıcıya görünür) — **tamamen salt okunur** liste:
   - Kolonlar mock: Görev no, başlık, ast adı, atayan (ör. Emre), durum, üzerinde kalma süresi (gün), son güncelleme.
   - Satır tıklanınca **detay drawer salt okunur**: yorum yazma alanı YOK veya disabled + açıklama "Üst izleme modu".

### P1
- Üst panoda özet kart: "Astlarında geciken (3+ gün): N görev" (protrude KPI).
- Filtre: fabrika bağlamı ile uyumlu (ast farklı fabrikadaysa göster/gizle kuralı — mock not).

### P2
- Üstten "hatırlatma gönder" (bildirim mock) — ayrı izin `organizasyon.hatirlat` vb.

---

## C) Senaryo doğrulama (metin + mock)

Kısa hikâyeyi UI’da kanıtla:
- Emre, Sen’e görev atar; Tahir’in "bana atanan" kuyruğunda **görünmez**.
- Tahir, **Astlarımın işleri** sekmesinde aynı görevi **salt okunur** görür.
- Sen görevi tamamlayınca Tahir’de satır durumu güncellenir (mock state).

---

## ÇIKTI ZORUNLULUĞU

1) ASCII veya blok wireframe: Kullanıcı formu (reports_to vurgulu) + Görev panosu 4 sekme
2) MOCK tablo: en az 6 görev satırı (farklı atayan, farklı ast, gecikme örneği)
3) Her ana blok için 1 satır Tailwind (`00b` uyumlu)
4) RBAC ile ayrım: hangi izin olmadan "Astlarımın işleri" sekmesi gizlenir (örn. `organizasyon.ast_gorevleri.izle`)
5) 4–6 UX sorusu (gizlilik, çoklu üst, yorum yetkisi)

NOT: Bu prompt `mvp-04-kullanici-yonetimi.md` ile arka arkaya veya birleştirilmiş çıktı üretilecek şekilde çalıştırılabilir.
```
