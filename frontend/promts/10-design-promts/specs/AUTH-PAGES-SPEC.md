# Giriş, kayıt ve hata sayfaları

Görsel dil: `prompts/00b-NEOMORPHISM-TAILWIND.md` — gri–beyaz, **protrude** kart, **inset** alanlar.

## Rotalar (`react-router-dom`)

| Yol | Bileşen | Açıklama |
|-----|---------|----------|
| `/login` | `LoginPage` | E-posta, şifre, beni hatırla, şifremi unuttum (placeholder), → `/` gönderimi |
| `/register` | `RegisterPage` | Şirket, ad, e-posta, şifre, kullanım koşulları metni, → `/` gönderimi |
| `/403` | `ForbiddenPage` | Yetki yok mesajı, ana sayfa / giriş linkleri |
| `*` | `NotFoundPage` | 404, bilinmeyen tüm yollar |
| `/` | `AppShell` | Ana uygulama (mevcut kabuk) |

**Not:** Prototipte gerçek kimlik doğrulama yok; formlar `navigate('/')` ile ana uygulamaya yönlendirir.

## Ortak bileşenler

- **`PublicPageHeader`**: PF logosu (protrude), koyu/açık tema düğmesi, “Uygulamaya dön” → `/`.
- **`AuthLayout`**: Auth sayfaları için üst başlık + altında **protrude** form kabı (`rounded-3xl shadow-neo-out`).

## Footer (ana uygulama)

`AppFooter` içinde **Giriş**, **Kayıt**, **403 demo** linkleri (hızlı erişim).

## Dosyalar

- `app/src/App.tsx` — `BrowserRouter`, `Routes`
- `app/src/pages/LoginPage.tsx`, `RegisterPage.tsx`, `ForbiddenPage.tsx`, `NotFoundPage.tsx`
- `app/src/pages/AuthLayout.tsx`, `PublicPageHeader.tsx`
