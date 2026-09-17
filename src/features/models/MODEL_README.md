# 📦 Katalog (Model) Modülü - Geliştirici & İnceleme Rehberi

Bu belge, **ECR-09** (Uçtan Uca İnceleme) ve **ECR-10** (Modül Devri) görevleri kapsamında hazırlanmıştır. Model modülü başarıyla tamamlanmış ve proje ekibine devredilmeye hazırdır.

---

## 🔍 ECR-09: Uçtan Uca İnceleme Notları

Sistemdeki hiyerarşik veri akışı ve sayfa içi URL bazlı filtreleme mekanizmaları test edilmiş ve sorunsuz çalıştığı doğrulanmıştır.

1. **Marka -> Model -> Pasaport Hiyerarşisi:**
   - Yeni bir ürün modeli oluşturulurken geçerli bir `brandPublicId` (Marka UUID) girilmesi zorunlu kılınmıştır.
   - Oluşturulan bu model (örn: `ENT-01`), **Ürün Pasaportları** sekmesinde `ModelSelect` bileşeni üzerinden başarıyla seçilebilmekte ve pasaporta bağlanabilmektedir.
   - Eğer bir modele bağlı pasaport varsa, ADMIN yetkilisi bile modeli silmeye çalıştığında **409 Conflict** hatası yakalanmakta ve silme işlemi engellenerek veri bütünlüğü korunmaktadır.

2. **URL Bazlı Arama ve Filtreleme (`usePageQuery` Entegrasyonu):**
   - Modeller sayfasında yapılan metin aramaları (`search`) ve Marka ID aramaları (`brandPublicId`) doğrudan URL parametrelerine yansımaktadır.
   - Örnek: `?search=test&brandPublicId=29f7432c...&page=0`
   - Bu yapı sayesinde kullanıcı sayfayı yenilese veya linki başka birine gönderse bile arama/filtreleme sonuçları kaybolmamaktadır.

---

## 🛠 ECR-10: `ModelSelect` Bileşeni Kullanım Rehberi

Diğer geliştiricilerin formlarında Model seçtirme ihtiyacı olduğunda, her seferinde baştan API isteği yazmalarına gerek yoktur. Özel olarak hazırlanan `<ModelSelect />` bileşeni projeye entegre edilmiştir.

### 📌 Özellikler
- **Otomatik Veri Çekme:** Yüklendiğinde `/product-models` endpointine giderek mevcut modelleri çeker ve önbellekler.
- **Yüklenme (Loading) Durumu:** API isteği devam ederken kullanıcıya `CircularProgress` döndürgeci gösterilir.
- **Veri Kaybını Önleme (ECR-08):** Pasaport düzenleme (Edit) ekranlarında, eğer seçili UUID sayfalamada görünmüyorsa `initialName` prop'u sayesinde modelin adı ekranda doğru şekilde gösterilir.

### 💻 Örnek Kullanım

Herhangi bir forma (örneğin Pasaport formuna) modeli entegre etmek için aşağıdaki gibi kullanabilirsiniz:

```tsx
import { useState } from "react";
import { ModelSelect } from "../models/ModelSelect";

export function OzetFormu({ existingModelId, existingModelName }) {
    // 1. Seçili modelin UUID'sini tutacak State'i oluşturun
    const [selectedModelId, setSelectedModelId] = useState(existingModelId || "");

    return (
        <form>
            {/* 2. Bileşeni forma yerleştirin */}
            <ModelSelect onChange="{(uuid)" value="{selectedModelId}"> setSelectedModelId(uuid)}
                initialName={existingModelName} // Sadece düzenleme formları için gereklidir
                disabled={false} // İsteğe bağlı
            />
        </form>
    );
}


⚙️ Alabileceği Prop'lar (API)Prop AdıTürZorunlu mu?AçıklamavaluestringEvetSeçili modelin UUID değeri (Boşsa "" gönderin).onChange(uuid: string) => voidEvetKullanıcı yeni bir model seçtiğinde tetiklenir.initialNamestringHayırDüzenleme (Edit) modunda, eski modelin adını ekranda tutmak için kullanılır.disabledbooleanHayırBileşeni tıklanamaz hale getirir.errorbooleanHayırForm doğrulama (validation) hatalarında kutuyu kırmızı yapar.helperTextstringHayırKutunun altındaki açıklama / hata metni.