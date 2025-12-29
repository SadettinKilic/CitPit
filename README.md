# 🌊 FinFlow - Kişisel Finans & Yatırım Takibi

FinFlow, gelir/gider yönetimi ve yatırım portföyünüzü (altın, döviz, emlak, araç) takip etmenizi sağlayan, yapay zeka destekli ve **leaderboard** sistemiyle rekabetçi bir yaklaşım sunan modern Next.js uygulamasıdır.

**Canlı Demo:** [https://finflow-teal-omega.vercel.app](https://finflow-teal-omega.vercel.app)

## ✨ Özellikler

### 🤖 Yapay Zeka Destekli Varlık Yönetimi
FinFlow, portföyünüzü yönetirken Google Gemini AI teknolojisinden faydalanır:
- **Otomatik Değerleme:** Aracınızın modeline ve km'sine veya evinizin metrekaresine göre yapay zeka destekli anlık fiyat tahmini.
- **Yatırım Asistanı:** Bakiyenize ve güncel piyasa koşullarına göre kişiselleştirilmiş, nötr yatırım önerileri.

### 💰 Gelir/Gider Yönetimi
- Gelir ve gider işlemleri takibi
- Kategori bazlı harcama analizi
- Aylık özet ve trend grafikleri

### 🪙 Geniş Varlık Desteği
FinFlow, **10 farklı varlık tipi** ile tüm yatırımlarınızı tek yerden yönetmenizi sağlar:

**Döviz & Emtia (Canlı Borsa Verisi):**
- **Gram, Çeyrek, Yarım, Tam, Reşat Altın**
- **Dolar (USD), Euro (EUR)**
*(Fiyatlar canlı API üzerinden anlık güncellenir)*

**Gayrimenkul & Taşıt (AI Değerleme):**
- **Araba** (Marka, Model, Yıl, KM bazlı değerleme)
- **Ev** (Konum, m² bazlı değerleme)
- **Arsa** (Konum, m² bazlı değerleme)

### 📊 Dashboard ve Analizler
- **Gerçek Kar/Zarar Hesabı:** Varlığın *alış tarihindeki maliyeti* ile *güncel piyasa değeri* karşılaştırılarak net kar/zarar hesaplanır.
- Toplam varlık ve net değer (Net Worth) takibi
- İnteraktif grafikler ve pasta dilimleri

### 🏆 Leaderboard Sistemi
- **Nick-based** rekabet sistemi
- Toplam kar sırlaması
- Otomatik güncellenen canlı liste
- Serverless backend altyapısı

### 🔒 Güvenlik ve Gizlilik
- **Privacy-First:** Tüm finansal verileriniz sadece **cihazınızda (IndexedDB)** saklanır. Sunucuya asla gönderilmez.
- Nick + PIN ile güvenli giriş
- Oturum bazlı kilitleme
- JSON Yedekleme/Geri Yükleme

## 🛠️ Teknolojiler

- **Framework:** Next.js 14+ (App Router)
- **AI:** Google Gemini 1.5 Flash
- **Database:** IndexedDB (Dexie.js)
- **Styling:** Tailwind CSS
- **Backend:** Vercel Serverless Functions
- **Api:** finans.truncgil.com + Gemini AI

## 🚀 Kurulum

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd finflow
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment Variable Ayarları:**
`.env.local` dosyası oluşturun ve Gemini API anahtarınızı ekleyin:
```bash
GEMINI_API_KEY=AIzaSyDBxy8Y5XevKB9dcyXxWWnW3bcjw3GXRzw
```

4. **Başlatın:**
```bash
npm run dev
```

## 🌐 Deployment

Bu proje Vercel üzerinde çalışmak üzere optimize edilmiştir.
Deploy ederken **Environment Variables** kısmına `GEMINI_API_KEY` eklemeyi unutmayın.

---

**Made with ❤️ using Next.js & Bitcoin DeFi Aesthetic**
