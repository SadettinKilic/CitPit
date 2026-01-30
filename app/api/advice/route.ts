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
            
            Lütfen tavsiyeni BU HEDEFE ULAŞMAYA ODAKLI ver. Sadece altın/gümüş değil, sepet yaparak (Döviz, Altın Tipleri, Mevduat, Gümüş vb.) bu hedefe en hızlı ve güvenli nasıl ulaşır anlat.
            `;
        } else {
            goalPrompt = 'Kullanıcının henüz özel bir hedefi yok. Genel varlık arttırma stratejileri öner.';
        }

        const prompt = `
        Sen FinFlow uygulamasının zeki ve veri odaklı finansal danışmanısın.
        
        KULLANICI VERİLERİ:
        - Kullanıcı Nick: ${nick}
        - Tarih: ${date}
        - Mevcut Nakit Bakiye: ${balance} TL
        - Finansal Geçmiş (Son 6 Ay): ${JSON.stringify(trends)}
        ${marketInfo}
        ${goalPrompt}
        
        GÖREVİN:
        Kullanıcının durumunu analiz et ve ASAĞIDAKİ FORMATTA yanıt ver. Yanıtın kısa, öz ve motive edici olsun.
        
        KESİN UYULMASI GEREKEN FORMAT:
        
        Selam ${nick},
        ${date} itibariyle durumunu değerlendirelim.
        Bakiyen: ${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(balance)} TL
        
        Sana önerim: 
        (Buraya kullanıcının elindeki bakiyeyi ve piyasa durumunu düşünerek EN MANTIKLI yatırım senaryosunu tek bir cümleyle yaz. Örn: "Doların stabil olduğu bu dönemde elindeki nakit ile X gram altın alarak portföyünü güçlendirebilirsin.")
        
        (Buraya Gelecek Vizyonu: Kullanıcının son 6 aydaki gelir/gider dengesine bakarak 1-2 cümlelik yorum yap. Eğer giderleri gelire çok yakınsa uyar, birikim yapıyorsa tebrik et. Örn: "Son aylarda giderlerin gelirine çok yaklaşmış, biraz daha dikkatli olup nakit akışını pozitife çevirmelisin." veya "İstikrarlı bir şekilde artıda kalman harika, bu disiplinle hedeflerine hızlıca ulaşabilirsin.")
        
        (Buraya Uyarı/Tavsiye: Harcama alışkanlıklarına dair kısa, arkadaşça bir yorum ekle. Maksimum 1 cümle. Örn: "Yatırımlarını çeşitlendirerek riskini dağıtmayı düşünebilirsin." veya "Harcamalarını biraz daha kısabilirsen yatırım için elin çok daha güçlenir.")
        
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

