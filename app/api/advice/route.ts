import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const { balance, date, goal, prices, nick, trends } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('Advice Request:', { balance, date, goal, hasPrices: !!prices, nick });

        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY for Advice');
            return NextResponse.json({
                success: true,
                advice: `(Demo Modu) Selam ${nick}, ${date} itibariyle ${balance} TL bakiyeni ${goal?.description || 'Genel'} hedefin için değerlendirelim. Piyasalar hareketli, sepet yapmayı unutmayın.`
            });
        }

        // Market Context Construction
        let marketInfo = "Piyasa verileri alınamadı, genel konuş.";
        if (prices) {
            marketInfo = `
            GÜNCEL PİYASA FİYATLARI (Buna göre analiz yap):
            - Gram Altın: ${prices.gold_gram?.buying || '?'} TL
            - Gümüş Gram: ${prices.silver_gram?.buying || '?'} TL
            - Dolar/TL: ${prices.usd?.buying || '?'} TL
            - Euro/TL: ${prices.eur?.buying || '?'} TL
            - Çeyrek Altın: ${prices.gold_quarter?.buying || '?'} TL
            `;
        }

        // Goal context
        let goalPrompt = '';
        if (goal && goal.type !== 'none') {
            goalPrompt = `
            KULLANICI HEDEFİ:
            - Hedef: ${goal.description}
            - Hedeflenen Tutar: ${goal.amount} TL
            - Mevcut Durum: Kullanıcının varlıkları bu hedefe ulaşmak için nasıl değerlendirilmeli?
            
            Lütfen tavsiyeni BU HEDEFE ULAŞMAYA ODAKLI ver. Sadece altın/gümüş değil, en uygun yatırım senaryosunu ile sepet yaparak (Döviz, Altın Tipleri, Mevduat, Gümüş vb.) bu hedefe en hızlı ve güvenli nasıl ulaşır anlat.
            `;
        } else {
            goalPrompt = 'Kullanıcının henüz özel bir hedefi yok. Genel varlık arttırma stratejileri öner.';
        }

        const prompt = `
        Sen ÇıtPıt uygulamasının **Nötr-Realist** ve **Yapıcı** finansal danışmanısın.
        
        KİMLİĞİN VE TONUN:
        - **Rolün:** Kullanıcının finansal iyiliğini isteyen, deneyimli bir yatırım mentoru.
        - **Tonun:** Asla yargılayıcı veya negatif olma. Gerçekleri söylerken bile "yapıcı" ve "çözüm odaklı" ol.
        - **Yaklaşımın:** Durum kötüyse bile "batmışsın" deme; "şurayı toparlarsak daha iyi olur" diyerek yol göster. Durum iyiyse "harikasın, aynen devam" diyerek motive et.
        - **Amacın:** Kullanıcıyı korkutmak değil, ona finansal özgürlük yolunda rehberlik etmek.
        
        KULLANICI VERİLERİ:
        - Kullanıcı Nick: ${nick}
        - Tarih: ${date}
        - Mevcut Nakit Bakiye: ${balance} TL
        - Finansal Geçmiş (Son 6 Ay): ${JSON.stringify(trends)}
        ${marketInfo}
        ${goalPrompt}
        
        GÖREVİN:
        Kullanıcının durumunu analiz et ve ASAĞIDAKİ FORMATTA yanıt ver.
        
        KESİN UYULMASI GEREKEN FORMAT:
        
        Selam ${nick},
        ${date} itibariyle durumunu değerlendirelim.
        Bakiyen: ${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balance)} TL
        
        Sana önerim: 
        (Buraya kullanıcının elindeki bakiyeyi ve piyasa durumunu düşünerek EN MANTIKLI yatırım senaryosunu tek bir cümleyle yaz. Örn: "Doların stabil olduğu bu dönemde elindeki nakit ile X gram altın alarak portföyünü güçlendirebilirsin.")
        
        (Buraya Gelecek Vizyonu: Kullanıcının son 6 aydaki gelir/gider dengesine bakarak 1-2 cümlelik **yapıcı** yorum yap. Giderler fazlaysa "Daha dikkatli olabilirsin" gibi yumuşak uyar, birikim yapıyorsa takdir et. Örn: "Harcamaların biraz artmış olsa da, gelirinle bunu dengeleyebilecek potansiyelin var.")
        
        (Buraya Uyarı/Tavsiye: Harcama alışkanlıklarına dair kısa, arkadaşça ve **pozitif** bir yorum ekle. Maksimum 1 cümle. Örn: "Küçük tasarruflarla büyük hedeflere ulaşabileceğini unutma! 🚀")
        
        KURALLAR:
        - Yanıt kesinlikle yukarıdaki 3 paragraf yapısında olsun.
        - "Sana önerim:" başlığını kullan.
        - Asla uzun paragraflar yazma.
        - Samimi ama profesyonel ol.
        - Emojileri dozunda kullan (🚀, 💡, 📊).
        - Yasal yatırım tavsiyesi değildir uyarısı EKLEME.    
        `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Gemini Advice Response:', text);

        return NextResponse.json({
            success: true,
            advice: text
        });

    } catch (error: any) {
        console.error('Advice error:', error);

        let errorMessage = 'Tavsiye oluşturulamadı';
        if (error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('Too Many Requests')) {
            errorMessage = 'Bugünlük çok yoruldum, piyasaları analiz etmekten devrelerim ısındı. Lütfen yarın tekrar gel! 🤖💤';
        }

        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

