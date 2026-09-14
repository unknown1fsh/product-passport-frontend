# Kimlik doğrulama ve yetkilendirme

## Oturum modeli

Erişim tokenı `Authorization: Bearer <accessToken>` başlığıyla gönderilir. İmza RS256'dır;
`iss`, `aud`, `sub` (kullanıcının public UUID'si), `sid`, `iat`, `nbf`, `exp` doğrulanır.
JWT zaman kontrolünde 30 saniye saat toleransı vardır. Oturumun mutlak bitişi ayrıca toleranssız kontrol edilir.
Tokenın varsayılan ömrü 15 dakika, oturumun mutlak ömrü 7 gündür; yenileme oturumun bitişini uzatmaz.

Her Bearer isteğinde kullanıcı ve oturum veritabanından okunur. Güncel veritabanı rolü kullanılır;
istemcinin bildirdiği rol güvenilir kabul edilmez. Çıkış ve hesap kapatma sonraki istekte etkili olur.
Çıkış yalnızca ilgili tarayıcı oturumunu kapatır; diğer cihaz oturumlarını kapatmaz.

Refresh token, 32 rastgele baytın Base64URL gösterimidir. Veritabanına yalnızca SHA-256 özeti yazılır.
Yenileme tek transaction içinde oturum satırını kilitler ve eski tokenı tüketilmiş olarak işaretler.
Tüketilmiş tokenın yeniden gönderilmesi o oturumun tüm tokenlarını iptal eder; bu iptal `401` dönerken de commit edilir.
İstemci **tek bir ortak yenileme isteği** kullanmalı; sekmeler arasında yenilemeyi koordine etmelidir.
Aynı tokenla eşzamanlı iki yenilemenin biri başarılı olur, diğeri tekrar kullanım sayılarak oturumu kapatır.
Yanıt kaybından sonra eski refresh tokenla körlemesine tekrar denemek yerine yeniden giriş yapılır.

## Tarayıcı akışı

Backend ve frontend'in aynı site altında yayımlanması varsayılır. Access token yalnızca bellekte tutulur;
sayfa yenilendiğinde refresh cookie ile yeni access token alınır. Refresh token JSON yanıtında bulunmaz.

Cookie `passport_refresh`: `HttpOnly`, üretimde `Secure`, `SameSite=Lax`, `Path=/api/v1/auth`, Domain belirtilmez.
`XSRF-TOKEN` cookie'si de HttpOnly'dir; JavaScript CSRF tokenını JSON uç noktasından alır.
CSRF başlığı kayıt, giriş, yenileme, çıkış ve eski kayıt uç noktası için zorunludur.
İş API'leri yalnızca Bearer ile doğrulandığı için bu cookie'ler iş verilerine erişim sağlamaz.

```javascript
// API aynı origin'de ters proxy ile sunuluyorsa base = '' kullanın.
const base = '';
const csrfResponse = await fetch(`${base}/api/v1/auth/csrf`, {
  credentials: 'include', cache: 'no-store'
});
if (!csrfResponse.ok) throw new Error('CSRF tokenı alınamadı');
const csrf = await csrfResponse.json();
const authHeaders = {
  'Content-Type': 'application/json',
  [csrf.headerName]: csrf.token
};

const login = await fetch(`${base}/api/v1/auth/login`, {
  method: 'POST', credentials: 'include', headers: authHeaders,
  body: JSON.stringify({ email: 'user@example.com', password: enteredPassword })
});
if (!login.ok) throw new Error('Giriş başarısız');
let { accessToken } = await login.json();

const profile = await fetch(`${base}/api/v1/auth/me`, {
  headers: { Authorization: `Bearer ${accessToken}` }
});

const refresh = await fetch(`${base}/api/v1/auth/refresh`, {
  method: 'POST', credentials: 'include', headers: authHeaders
});
if (!refresh.ok) throw new Error('Yeniden giriş gerekli');
({ accessToken } = await refresh.json());

await fetch(`${base}/api/v1/auth/logout`, {
  method: 'POST', credentials: 'include', headers: authHeaders
});
accessToken = undefined;
```

Auth cookie işlemlerinde Bearer başlığı göndermeyin; süresi dolmuş Bearer tokenı varsa filtre onu reddeder.
Cookie temizlendiğinde CSRF tokenını yeniden alın. `403` CSRF hatası, otomatik refresh döngüsü başlatmamalıdır.

| Uç nokta | Girdi | Başarılı yanıt |
|---|---|---|
| `GET /api/v1/auth/csrf` | — | `200 {headerName, token}` |
| `POST /api/v1/auth/register` | `firstName,lastName,email,password` | `201`, boş gövde |
| `POST /api/v1/users` | Aynı kayıt gövdesi (uyumluluk) | `201`, boş gövde |
| `POST /api/v1/auth/login` | `email,password` | `200 {accessToken,tokenType,expiresIn,user}` + cookie |
| `POST /api/v1/auth/refresh` | Refresh cookie + CSRF başlığı | Girişle aynı yanıt + yeni cookie |
| `POST /api/v1/auth/logout` | Refresh cookie + CSRF başlığı | `204`, cookie silinir; tekrarı güvenlidir |
| `GET /api/v1/auth/me` | Bearer | `200 UserResponse` |

Kayıt her zaman `USER` oluşturur. E-postalar küçük harfle saklanır; silinen hesapların adresleri ayrılmış kalır.
Mevcut parola politikası 8–50 karakter, en az bir harf ve rakamdır. İsim/soyisim kayıt ve güncellemede en fazla 50 karakterdir; e-posta en fazla 50 karakterdir.
Kayıt olan kullanıcı oturum açmak için ayrıca login çağırır. Yerel/dev profilinde geçici
kolay giriş için `admin` değeri, `DEV_ADMIN_EMAIL` ile yapılandırılmış ADMIN hesabına
eşlenebilir ve `DEV_ADMIN_PASSWORD` varsayılan olarak `123456`'dır. Bu alias yalnızca
dev/test yapılandırmasında açıktır; `prod` profilinde kapalıdır. Production için gerçek
e-posta ve güçlü parola kullanılmalıdır. Bu geçici kolaylık, kalıcı login çözümü değildir.

Örnek giriş yanıtı:

```json
{
  "accessToken": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {"publicId": "<UUID>", "firstName": "Ada", "lastName": "Test", "email": "ada@example.com", "active": true, "role": "USER"}
}
```

Kimlik doğrulama hataları `401`, rol/sahiplik/CORS/CSRF hataları `403`, doğrulama hataları `400`,
ayrılmış e-posta `409` döner. Bilinmeyen hesap, hatalı parola ve kapalı hesap aynı giriş hatasını verir.
Auth yanıtları `Cache-Control: no-store` ile döner. Hata biçimi:

```json
{
  "success": false,
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials or inactive session",
  "path": "/api/v1/auth/login",
  "timestamp": "2026-09-10T12:00:00",
  "details": []
}
```

## Yetki matrisi

| İşlem | USER | MANUFACTURER | ADMIN |
|---|---|---|---|
| İş verilerini okuma, kendi `/auth/me` profili | Evet | Evet | Evet |
| Kullanıcı listesi, `/users/{id}`, güncelleme, silme | Hayır | Hayır | Evet |
| Kategori ve tedarikçi yazma/silme | Hayır | Hayır | Evet |
| Marka/model/pasaport oluşturma ve güncelleme | Hayır | Kendi kayıtları ve kendi üst ilişkileri | Evet |
| Marka/model/pasaport silme | Hayır | Hayır | Evet |
| Garanti ve servis oluşturma/güncelleme/silme | Hayır | Kendi pasaportuna ait kayıtlar | Evet |

Yeni kayıtların `createdBy` değeri sunucuda kullanıcı UUID'siyle yazılır ve güncellenmez.
Eski `NULL`, `SYSTEM` veya UUID ile eşleşmeyen sahiplik değerlerini yalnızca ADMIN yönetebilir.
Garanti/servis güncelleme DTO'ları pasaport bağlantısını değiştirmez; sahiplik bağlı pasaport üzerinden kontrol edilir.
Tüm iş okumaları giriş yapmış rollere açıktır; bu sürüm kiracı bazlı okuma izolasyonu veya son kullanıcı ürün mülkiyeti sunmaz.
Kullanıcı iş yanıtları artık `ApiResponse` ile sarılır; `/auth/me` ve login/refresh yanıtları ham auth biçimini korur.
ADMIN, mevcut kullanıcı güncelleme uç noktasında `role=MANUFACTURER` atayabilir.

## Yapılandırma ve anahtarlar

| Ortam değişkeni | Varsayılan / açıklama |
|---|---|
| `JWT_ISSUER` | `product-passport` |
| `JWT_AUDIENCE` | `product-passport-api` |
| `JWT_ACCESS_TTL` | `15m` |
| `JWT_SESSION_TTL` | `7d`, mutlak süre |
| `JWT_PRIVATE_KEY` | PKCS#8 PEM kaynak adresi, ör. `file:/run/secrets/jwt-private.pem` |
| `JWT_PUBLIC_KEY` | X.509 PEM kaynak adresi, ör. `file:/run/secrets/jwt-public.pem` |
| `AUTH_ALLOWED_ORIGINS` | Boş; gerekiyorsa virgülle ayrılmış tam origin'ler; `*` kabul edilmez |
| `AUTH_SECURE_COOKIE` | Yerelde `false`; `prod` profilinde Secure zorunlu |
| `DEV_ADMIN_ALIAS_ENABLED` | Yerel/dev varsayılanı `true`; production `false` |
| `DEV_ADMIN_EMAIL` | Dev aliasının eşleneceği ADMIN e-postası; bootstrap e-postasına düşer |
| `DEV_ADMIN_PASSWORD` | Dev alias parolası; varsayılan `123456`, production’da kullanılmaz |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | Üretim PostgreSQL bağlantısı |

Anahtarları güvenli bir dizinde oluşturun ve uygulamaya salt okunur secret olarak bağlayın:

```sh
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out jwt-private.pem
openssl pkey -in jwt-private.pem -pubout -out jwt-public.pem
```

Üretimde eksik, uyumsuz veya 2048 bitten kısa RSA anahtarları başlangıcı durdurur.
Tüm uygulama örnekleri aynı anahtar çiftini, issuer/audience değerlerini ve oturum veritabanını kullanmalıdır.
Anahtar değişimi eski access tokenlarını geçersiz kılar; hâlâ geçerli refresh tokenıyla yeni imzalı token alınabilir.
Anahtar sızıntısında anahtarı değiştirin ve veritabanındaki oturumları iptal edin; eski anahtarla doğrulamayı sürdürmeyin.
HTTPS ters proxy kullanın ve parolaları, Authorization/Set-Cookie/Cookie başlıklarını loglamayın.

Üretimde Swagger/OpenAPI kapalıdır. Yerelde Swagger'ın Authorize alanındaki `bearerAuth` access token içindir;
auth POST çağrıları için önce `/auth/csrf` yanıtındaki tokenı `csrf` alanına girin.

## İşletim

Giriş/yenileme `401`, yetki `403`, sunucu `5xx` oranlarını ve veritabanı bağlantı/kilit sürelerini izleyin.
Auth uç noktaları için dağıtım katmanında istek hızı sınırı uygulayın. Uygulama bu sürümde dağıtık rate limiter içermez.
Replay tespiti için tüketilmiş refresh kayıtları oturum bitene kadar korunmalıdır.
Süresi dolan oturumları bakım göreviyle silmek ilişkili refresh özetlerini de kaldırır:

```sql
DELETE FROM auth_session WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '1 day';
```

Üretim migration'ında refresh foreign key'i `ON DELETE CASCADE` içerir. Bu bakım sorgusu yalnızca süresi dolmuş
oturumlara uygulanır; aktif oturumların tüketilmiş token kayıtları silinmez.
E-posta doğrulama, parola kurtarma ve MFA bu sürümün kapsamında değildir.

## React entegrasyonu

İş API'lerinin sayfalama, UUID, hata ve pasaport detay alanları için
[React sözleşmesini](API_CONTRACT.md) kullanın. Garanti güncelleme/silme yolları
`/warranties/edit/{id}` ve `/warranties/remove/{id}` olarak korunur.

Ürün pasaportu detayları oturum gerektirir ve düzenleme için tam veri döndürür.
Bu sürüm oturumsuz QR endpoint'i içermez. Kullanıcı hesabında `active=false`, mevcut uyumluluk
davranışı gereği hesabı mantıksal kapatır; katalog varlıklarının `active=false` olması ise
silinme değildir ve tek başına okumayı veya ilişki kurmayı engellemez.