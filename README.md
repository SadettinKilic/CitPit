# 🌊 ÇıtPıt - Kişisel Finans Yönetimi

**ÇıtPıt**, harcamalarınızı, gelirlerinizi ve varlıklarınızı (Altın, Gümüş, Döviz vb.) kolayca takip etmenizi sağlayan modern bir web uygulamasıdır. Canlı piyasa verileriyle varlıklarınızın güncel değerini anlık olarak hesaplar.

🔗 **Canlı Demo:** [ÇıtPıt App](https://citpit.vercel.app)

## ✨ Özellikler

### 🤖 Kişiselleştirilmiş Yapay Zeka Asistanı
ÇıtPıt, portföyünüzü yönetirken Google Gemini AI teknolojisinden faydalanır:
- **Kişisel Karşılama:** Size isminizle hitap eder, güncel bakiye ve hedefinize (örn: Araba, Ev) göre analize başlar.
- **Veri Odaklı Tavsiyeler:** Canlı piyasa verilerini analiz ederek matematiksel ve somut yatırım sepeti önerileri sunar.
- **Otomatik Değerleme:** Aracınızın modeline/km'sine veya evinizin metrekaresine göre AI destekli anlık fiyat tahmini yapar.

### 💰 Gelir/Gider Yönetimi & Akıllı Grafikler
- Gelir ve gider işlemleri takibi.
- **Dinamik Gider Grafiği:** Sadece bulunulan ayın verilerini gösterir ve "Diğer" kategorisindeki harcamalarda not yazılıysa grafikte o notu başlık olarak kullanır.
- Aylık özet ve trend analizleri.

### 🏆 Yeni Nesil Liderlik Tablosu (Leaderboard)
- **Yüzdelik Kâr Sistemi:** Kimin kaç TL'si olduğu değil, portföyünü yüzde kaç büyüttüğü (%58.2 gibi) baz alınır. Bu sayede gizlilik korunur ve adil bir rekabet sağlanır.
- **Global Nickname Kontrolü:** Redis tabanlı sistem sayesinde her kullanıcının kendine özel, benzersiz bir nicki vardır.
- **Anlık Güncelleme:** Veriler Redis (Vercel KV) üzerinde tutulur.

### 🪙 Geniş Varlık Desteği
ÇıtPıt, **Birçok farklı varlık tipi** ile tüm yatırımlarınızı tek yerden yönetmenizi sağlar:

**Döviz & Emtia (Canlı Borsa Verisi):**
- **Gram, Çeyrek, Yarım, Tam, Reşat Altın**
- **Gümüş (Gram)**
- **Dolar (USD), Euro (EUR)**
*(Fiyatlar canlı API üzerinden anlık güncellenir - finans.truncgil.com)*

**Gayrimenkul & Taşıt (AI Değerleme):**
- **Araba, Ev, Arsa** (Yapay zeka analizli değerleme)

### 📱 Mobil Öncelikli (App-Like) Deneyim
- **Alt Navigasyon Menüsü:** Mobil cihazlarda kullanımı kolaylaştıran özel navigasyon barı.
- **Responsive Layout:** Tüm ekranlarda tam uyumlu, "Uygulama" hissi veren moder tasarım.

### 🔒 Güvenlik ve Gizlilik
- **Privacy-First:** Finansal verileriniz sadece **cihazınızda (IndexedDB)** saklanır. Sunucuya sadece anonim kâr yüzdeniz gönderilir.
- Nick + PIN ile güvenli giriş ve JSON Yedekleme/Geri Yükleme.

## 🛠️ Teknolojiler

- **Frontend:** Next.js 14 (App Router), Lucide Icons, Tailwind CSS
- **AI:** Google Gemini-1.5-Flash
- **Database:** IndexedDB (Dexie.js) + Redis (Vercel KV)
- **State:** React Hooks & Local Storage
- **API:** finans.truncgil.com + Finflow AI Layer

## 🚀 Kurulum

1. **Projeyi klonlayın ve bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment Variables:**
`.env.local` dosyasına şunları ekleyin:
```bash
GEMINI_API_KEY=your_key
KV_URL=your_redis_url
KV_REST_API_READ_ONLY_TOKEN=your_token
KV_REST_API_TOKEN=your_token
KV_REST_API_URL=your_url
```

3. **Başlatın:**
```bash
npm run dev
```

---
**Made with ❤️ using Next.js & Bitcoin DeFi Aesthetic**


