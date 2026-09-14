# Ürün Pasaportu · Frontend

React + TypeScript + Material UI ile geliştirilmiş, Türkçe arayüzlü ürün yönetim uygulaması.
Backend ayrı bir projedir (`product-passport-backend`) ve Spring Boot ile REST API sağlar.

Bu teslimde hazır olanlar: giriş/oturum yönetimi, kategori CRUD ekranı ve pasaport liste/detay
görünümü. Kalan modüller (marka, tedarikçi, model, garanti, servis) aynı desenler üzerinden
genişletilecek şekilde tasarlanmıştır.

## İçindekiler

1. [Teknoloji yığını](#1-teknoloji-yığını)
2. [Kurulum ve çalıştırma](#2-kurulum-ve-çalıştırma)
3. [Ortam değişkenleri](#3-ortam-değişkenleri)
4. [Giriş / test hesapları](#4-giriş--test-hesapları)
5. [Proje yapısı](#5-proje-yapısı)
6. [Kalite kontrolleri](#6-kalite-kontrolleri)
7. [Sık karşılaşılan sorunlar](#7-sık-karşılaşılan-sorunlar)
8. [Dağıtım notu](#8-dağıtım-notu)
9. [İlgili dokümanlar](#9-i̇lgili-dokümanlar)

## 1. Teknoloji yığını

| Katman | Teknoloji |
|---|---|
| Framework | React 19 + TypeScript |
| Build/dev sunucu | Vite 8 |
| Yönlendirme | react-router-dom 7 |
| Arayüz kitaplığı | Material UI (MUI) 9 |
| HTTP istemcisi | Native `fetch` (ince sarmalayıcılar: `src/shared/api`) |
| Test | Vitest + Testing Library (birim), Playwright (uçtan uca) |
| Kod kalitesi | ESLint (flat config) + Prettier |

Durum yönetimi için harici bir kütüphane kullanılmaz; oturum bilgisi `useSyncExternalStore`
ile, veri çekme ise sayfa başına küçük bir `useResource` kancasıyla yönetilir.

## 2. Kurulum ve çalıştırma

Gereksinim: **Node.js 24** (`.nvmrc`; minimum desteklenen sürüm 22.12.0).

```powershell
cd C:\tein_repos\product-passport-frontend
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

- Frontend: **http://localhost:5173**
- Backend: **http://localhost:8080** (ayrı projede `docker compose up --build --wait`)

API adresi farklıysa `.env` içindeki `VITE_API_BASE_URL` değerini güncelleyip Vite'ı yeniden
başlatın. Backend tarafında `AUTH_ALLOWED_ORIGINS` değişkeni tam olarak `http://localhost:5173`
içermelidir; `localhost` ile `127.0.0.1` karıştırılmamalıdır (CORS reddeder). Port 5173 doluysa
`--strictPort` nedeniyle sunucu farklı bir porta sessizce geçmez, hata verir.

## 3. Ortam değişkenleri

`.env.example` dosyasından kopyalanan `.env` içinde tek değişken vardır:

| Değişken | Açıklama | Varsayılan |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API kök adresi | `http://localhost:8080/api/v1` |

Vite'a verilen `VITE_` önekli değişkenler tarayıcıya gömülür ve herkese açıktır; buraya
parola, anahtar veya gizli bilgi eklenmemelidir.

## 4. Giriş / test hesapları

Kayıt işlemi backend'de her zaman `USER` rolüyle hesap oluşturur; `MANUFACTURER` rolü sonradan
bir ADMIN tarafından atanır. Kayıt, parola kurtarma ve kullanıcı yönetimi ekranları bu teslimde
yoktur (backend API'si mevcuttur, arayüzü henüz eklenmemiştir).

Roller arasındaki fark:

- **ADMIN** — kategori/tedarikçi yazma-silme dahil tüm kayıtları yönetir.
- **MANUFACTURER** — yalnızca kendi oluşturduğu marka/model/pasaport ve bunlara bağlı
  garanti/servis kayıtlarını yazar; sahiplik backend tarafından denetlenir.
- **USER** — yalnızca okuma yetkisine sahiptir.

Yerel/dev backend'de hızlı test için `admin` / `123456` kısayolu kullanılabilir (yalnızca
dev/test profilinde açıktır, production'da kapalıdır). Diğer roller için ekip sorumlusundan
test hesabı isteyin veya backend README'sindeki bootstrap admin komutuyla ilk hesabı oluşturun.

## 5. Proje yapısı

```text
src/
  app/                   Tema, yönlendirme ve ana sayfa yerleşimi
  features/
    auth/                Giriş ekranı, oturum context'i ve token koordinasyonu
    categories/          Uçtan uca tamamlanmış örnek CRUD modülü
    passports/           Pasaport liste ve detay (salt okunur)
  shared/
    api/                 HTTP istemcisi, hata tipleri, kimlik doğrulamalı fetch sarmalayıcı
    hooks/                Veri yükleme ve URL tabanlı sayfalama kancaları
    ui/                   Ortak yükleniyor/hata/sayfalama bileşenleri
    types.ts              Backend yanıtlarına karşılık gelen TypeScript tipleri
e2e/                     Playwright uçtan uca testleri
docs/                    API sözleşmesi, kimlik doğrulama ve geliştirme rehberleri
scripts/                 Yardımcı script'ler
```

Yeni bir ekran eklerken `src/features/categories` modülü referans alınmalıdır: liste →
form → `api.ts` → ortak `api()` istemcisi akışı bütün modüllerde aynıdır.

## 6. Kalite kontrolleri

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

Uçtan uca testler varsayılan olarak taklit (mock) API ile çalışır:

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Chromium indirilemiyorsa kurulu Chrome kullanılabilir: `$env:PLAYWRIGHT_CHANNEL = 'chrome'`.
Gerçek backend'e karşı çalışan senaryo için [test rehberi](docs/TEST_REHBERI.md)'ni izleyin;
varsayılan koşuda bu senaryo atlanır, tam koşu `E2E_REAL=1` ile yapılır.

## 7. Sık karşılaşılan sorunlar

- **PowerShell: "running scripts is disabled on this system"** — Windows'un varsayılan
  `Execution Policy` ayarı `npm.ps1` betiğini engeller. `npm` yerine `npm.cmd` /
  `npx.cmd` kullanın, ya da tek seferlik olarak kullanıcı kapsamında izin verin:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
- **CORS hatası / istekler backend'e ulaşmıyor** — backend `AUTH_ALLOWED_ORIGINS` ile
  frontend origin'i (`http://localhost:5173`) birebir eşleşmiyor olabilir.
- **401 döngüsü / sürekli çıkışa atma** — access token yalnızca bellekte tutulur; sayfa
  yenilendiğinde `passport_refresh` çerezi üzerinden sessiz yenileme yapılır. Çerez
  engelleniyorsa (üçüncü taraf çerez kısıtlaması, farklı origin) oturum açılamaz.

## 8. Dağıtım notu

`npm run build` çıktısı `dist/` klasörüne yazılır; statik sunucu bilinmeyen adresleri
`index.html`'e yönlendirecek şekilde (SPA fallback) yapılandırılmalıdır. Üretimde
frontend ve backend aynı site altında HTTPS üzerinden sunulmalı; backend `Secure` çerez
ve kalıcı RSA anahtar ayarlarıyla çalışmalıdır. Geliştirme sunucusu üretim dağıtımı için
uygun değildir.

## 9. İlgili dokümanlar

- [API sözleşmesi](docs/API_CONTRACT.md) — uç noktalar, istek/yanıt şekilleri, hata kodları
- [Kimlik doğrulama](docs/AUTHENTICATION.md) — JWT/çerez akışı, roller, ortam değişkenleri
- [Başlangıç rehberi](docs/BASLANGIC_REHBERI.md) — yeni bir modül eklerken izlenecek adımlar
- [Test rehberi](docs/TEST_REHBERI.md) — gerçek backend'e karşı uçtan uca test kurulumu
