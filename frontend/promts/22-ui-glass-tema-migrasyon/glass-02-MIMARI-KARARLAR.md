# glass-02 — Mimari karar özeti (≤10 satır)

1. **Saf CSS:** `html[data-ui-template='glass']` + `.gm-glass-outlet-scope` veya `.gm-glass-sidebar-root` ile neo sınıfları (`bg-pf-surface`, `bg-gray-*`) eşlemek; çoğu modül **ek JSX gerektirmeden** camlaşır.  
2. **Yardımcı sınıflar:** Tekrar eden desenler `.gm-glass-surface-panel`, `.gm-glass-control`, `.gm-glass-divider` ile standartlaştırılır; showcase ve yeni bloklarda öncelik bunlara verilir.  
3. **Bileşen `variant="glass"`:** Aynı bileşenin classic’te farklı markup gerektirdiği veya CSS seçicinin güvenli olmadığı (çok genel `button`) durumlarda **minimal** koşullu `className`.  
4. **Yeni alt bileşen (`GlassButton` vb.):** Yalnızca paylaşılan API + test ihtiyacı doğduğunda; aksi halde token + utility yeter.  
5. **Yoğun veri:** Tablo/ızgara satırlarında `.gm-glass-solid-row` — blur kapalı, düz widget rengi (`glass-08` ile genişletilir).  
6. **Tek kaynak:** Renk/blur/gölge **yalnızca** `glassmorphism.css` custom properties; TS’te `glassTokens.ts` inline stil köprüsü için.  
7. **Classic güvence:** Yeni utility’ler `html[data-ui-template='glass']` veya `.gm-glass-scope` ile sınırlı; klasik shell’de yanlışlıkla sınıf kalsa bile `--glass-*` tanımsız kalır (utility kullanılmamalı).
