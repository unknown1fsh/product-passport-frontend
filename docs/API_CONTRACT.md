# API sözleşmesi

İlk entegrasyon için [başlangıç rehberini](BASLANGIC_REHBERI.md) izleyin. Bu belge ayrıntılı başvuru kaynağıdır; Bu kopya backend React hazırlığı sözleşmesini referans alır.
Temel yol `/api/v1`; kimlik alanlarının tümü public UUID'dir. Sayısal veritabanı ID'leri kullanılmaz.
Geliştirmede Swagger `/swagger-ui.html`, OpenAPI `/v3/api-docs` adresindedir; üretimde kapalıdır.

## Ortak cevaplar

İş API'lerinde başarılı tek kayıt:

```json
{"success": true, "data": {"publicId": "00000000-0000-0000-0000-000000000001"}}
```

Bütün iş listelerinde:

```json
{
  "success": true,
  "data": {
    "content": [],
    "page": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

Oluşturma `201`, okuma/güncelleme `200`, silme `204` ve boş gövdedir.
`204` yanıtını JSON olarak ayrıştırmayın. Kullanıcı kaydı (`/auth/register` ve eski `POST /users`)
`201` ve boş gövde döndürür. Diğer auth yanıtları sarılmaz; `/auth/me` doğrudan `UserResponse` döndürür.

```typescript
type ApiResponse<T> = { success: true; data: T };
type PageResponse<T> = {
  content: T[]; page: number; size: number;
  totalElements: number; totalPages: number;
};
type ApiError = {
  success: false; status: number; error: string; message: string;
  path: string; timestamp: string; details: string[];
};
```

## Endpointler ve sayfalama

Aşağıdaki yollar `/api/v1` altındadır. `{id}` public UUID'dir.

| Kaynak | Oluştur / listele | Detay | Güncelle | Sil |
|---|---|---|---|---|
| Kategori | POST / GET `/categories` | GET `/categories/{id}` | PUT `/categories/{id}` | DELETE `/categories/{id}` |
| Tedarikçi | POST / GET `/product-suppliers` | GET `/product-suppliers/{id}` | PUT `/product-suppliers/{id}` | DELETE `/product-suppliers/{id}` |
| Marka | POST / GET `/product-brands` | GET `/product-brands/{id}` | PUT `/product-brands/{id}` | DELETE `/product-brands/{id}` |
| Model | POST / GET `/product-models` | GET `/product-models/{id}` | PUT `/product-models/{id}` | DELETE `/product-models/{id}` |
| Pasaport | POST / GET `/product-passports` | GET `/product-passports/{id}` | PUT `/product-passports/{id}` | DELETE `/product-passports/{id}` |
| Garanti | POST `/warranties`; GET `/warranties/product/{productId}` | GET `/warranties/{id}` | PUT `/warranties/edit/{id}` | DELETE `/warranties/remove/{id}` |
| Servis | POST `/service-records`; GET `/service-records/product/{productId}` | GET `/service-records/{id}` | PUT `/service-records/{id}` | DELETE `/service-records/{id}` |
| Kullanıcı | POST / GET `/users` | GET `/users/{id}` | PUT `/users/edit/{id}` | DELETE `/users/remove/{id}` |

Garanti ve servis için genel liste endpoint'i yoktur; pasaport seçildikten sonra ürüne göre listelenir.

Bütün listelerde `page=0`, `size=20`, `sortBy`, `sortDir` kullanılır.
Negatif sayfa 0'a, 1'den küçük boyut 20'ye, 100'den büyük boyut 100'e çekilir.
`sortDir=desc` azalan, diğer değerler artan sıralamadır. Boş `sortBy` yalnızca public UUID ile sıralar.
İzin verilmeyen alan `400` döndürür; eşitlikler her zaman `publicId ASC` ile çözülür.

| Liste | Sıralama alanları | Varsayılan | Ek filtreler |
|---|---|---|---|
| Kategori | name, code, createdAt | name asc | — |
| Tedarikçi | name, code, createdAt | name asc | name, active |
| Marka | name, createdAt | name asc | search, active |
| Model | name, code, createdAt | name asc | search, brandPublicId |
| Pasaport | serialNumber, purchaseDate, createdAt | serialNumber asc | — |
| Garanti | startDate, endDate, createdAt | startDate asc | URL'de productId |
| Servis | serviceDate, createdAt | serviceDate desc | URL'de productId |
| Kullanıcı | firstName, lastName, email, createdAt | firstName asc | — |

## Form alanları

Kesin alan şemaları OpenAPI'dedir. PUT işlemleri tam güncelleme formları olarak kullanılmalıdır.

| Form | Zorunlu alanlar | İsteğe bağlı alanlar / farklar |
|---|---|---|
| Kategori oluştur | code, name | description; güncellemede code değişmez, active zorunlu |
| Tedarikçi oluştur | code, name | description, active (varsayılan true), contactName, email; güncellemede code değişmez, active zorunlu |
| Marka oluştur | name | güncellemede name, active zorunlu; description isteğe bağlı |
| Model oluştur | code, name, brandPublicId | description; güncellemede active de zorunlu |
| Pasaport oluştur/güncelle | serialNumber, productModelId, categoryId, purchaseDate | invoiceNumber, description; active değişikliği bu formda yok |
| Garanti oluştur | productPassportPublicId, startDate, endDate | güncellemede pasaport bağlantısı değişmez; active verilmezse mevcut değer korunur |
| Servis oluştur | productId, serviceDate, description | güncellemede productId gönderilmez, bağlantı değişmez |
| Kullanıcı kayıt | firstName, lastName, email, password | role gönderilse de kayıt her zaman USER oluşturur |
| Kullanıcı güncelle | firstName, lastName, active, role | e-posta/parola değişmez; ADMIN işlemi |

Kategori/model/tedarikçi kodu ve marka adında baş/son boşluklar kırpılır; benzersizlik büyük-küçük harften bağımsızdır.
Kategori/model/tedarikçi kodları ve seri numarası en fazla 100; katalog adları en fazla 150 karakterdir.
Seri numarası yalnızca ASCII harf, rakam ve tire kabul eder.
Ad/soyad en fazla 50, kullanıcı e-postası en fazla 50 karakterdir.
Parola 8–50 karakterdir; en az bir ASCII harf ve rakam içermeli, yalnızca harf/rakam ve `@$!%*#?&` sembollerini kullanmalıdır.
Tedarikçi e-postası en fazla 254, servis açıklaması en fazla 1000, diğer açıklamalar en fazla 500 karakterdir.
Tarihleri `YYYY-MM-DD` olarak gönderin. Satın alma/servis tarihi gelecekte olamaz; garanti bitişi başlangıçtan önce olamaz.
Garanti başlangıç ve bitişi aynı gün olabilir.

Pasaport detay/listelerindeki tam DTO:

```typescript
type ProductPassportResponse = {
  publicId: string;
  serialNumber: string;
  productModelId: string;
  productModelName: string;
  categoryId: string;
  categoryName: string;
  purchaseDate: string;
  invoiceNumber: string | null;
  description: string | null;
  active: boolean;
};
```

Pasaport detay yanıtı doğrudan düzenleme formunu doldurur. Kategori/tedarikçi cevaplarında önceki `id` alanı artık `publicId`'dir.

## Oturum ve yetkiler

Ayrıntılı protokol [AUTHENTICATION.md](AUTHENTICATION.md) içindedir.

1. `GET /auth/csrf` isteğinde `credentials: 'include'` kullanın; JSON'dan token/headerName alın.
2. Register/login/refresh/logout POST isteklerinde cookie ve CSRF başlığını gönderin.
3. Access token yalnızca bellekte tutulur. İş istekleri `Authorization: Bearer ...` kullanır.
4. Sayfa yenilendiğinde CSRF alın, refresh cookie ile bir kez yenileyin.
5. Eşzamanlı 401 yanıtları için tek ortak refresh isteği kullanın; sekmeleri Web Locks/BroadcastChannel ile koordine edin.
   Yeni sekme eski refresh tokenla tekrar denememeli; ağ cevabı kaybında yeniden giriş istenmelidir.
6. Auth isteklerine Bearer eklemeyin. Refresh başarısızsa veya oturum kapanmışsa giriş ekranına dönün.
   CSRF/rol kaynaklı 403 için refresh döngüsü başlatmayın.

Geliştirmede React origin'i `AUTH_ALLOWED_ORIGINS=http://localhost:5173` ile izinli olur.
`localhost` ile `127.0.0.1`'i karıştırmayın. Üretimde aynı site altında HTTPS ters proxy kullanın;
`SameSite=Lax` cookie, farklı site dağıtımı için tasarlanmamıştır.

Tüm iş okumaları giriş gerektirir. USER okur; ADMIN tüm yönetim işlemlerini yapar.
MANUFACTURER kendi marka/model/pasaportlarını oluşturur/günceller; kendi pasaportunun garanti/servisini de siler.
Marka/model/pasaport silme ve kategori/tedarikçi yazma yalnızca ADMIN'e açıktır.
Sahiplik kontrolü backend'dedir; başka üreticinin kaydı veya üst ilişkisi kullanılırsa 403 döner.
Kayıt sahibini istemciden göndererek değiştirmek mümkün değildir.

## Hata ve silme davranışı

| Durum | İstemci davranışı |
|---|---|
| 400 | Alan/tarih/UUID/sıralama hatasını göster; details alanını formda kullan |
| 401 | İş isteğinde tek refresh dene; auth hatasında tekrar döngüsüne girme |
| 403 | Yetki veya CSRF hatasını göster |
| 404 | Kayıt silinmiş/yok; listeyi yenile |
| 405 / 415 | İstek yöntemini / Content-Type değerini düzelt |
| 409 | Benzersiz anahtar, bağlı kayıt veya eşzamanlı değişiklik çakışmasını göster |
| 429 | Pasaport detay sınırını bekle; sık otomatik tekrar yapma |
| 500 | Genel hata göster; kullanıcıya iç hata ayrıntısı verme |

Marka altında model; model/kategori altında pasaport; pasaport altında garanti/servis varsa silme 409 döner.
Önce silinmemiş alt kayıtlar kaldırılmalıdır. `active=false` alt kayıtlar da silmeyi engeller.
Silme mantıksaldır; silinen kayıt listede/detayda görünmez. Silinen pasaportun eski alt kayıtları da erişilemez.
Katalogda pasiflik silinme değildir. Kullanıcı hesabını kapatma ise mevcut active/deleted eşlemesini korur.

## Uyumluluk değişiklikleri

React başlamadan uygulanmıştır: kullanıcı/garanti yanıtları sarıldı; kategori/tedarikçi/pasaport listeleri sayfalandı;
kullanıcı listesi Spring Page yerine ortak PageResponse oldu; kategori/tedarikçi `id` alanı `publicId` oldu;
pasaport detayından kısıtlı public DTO kaldırıldı. Endpoint yolları ve auth yanıtları korundu.
