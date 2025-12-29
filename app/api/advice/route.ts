import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const { balance, date, goal } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('Advice Request:', { balance, date, goal, hasApiKey: !!apiKey });

        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY for Advice');
            return NextResponse.json({
                success: true,
                advice: `(Demo Modu) Bakiye: ${balance} TL. Hedef: ${goal?.description || 'Genel'}. Altın ve döviz sepeti yapmanızı öneririm.`
            });
        }

        // Goal context
        let goalPrompt = '';
        if (goal && goal.type !== 'none') {
            goalPrompt = `
            KULLANICI HEDEFİ:
            - Hedef: ${goal.description}
            - Hedeflenen Tutar: ${goal.amount} TL
            - Mevcut Durum: Kullanıcının varlıkları bu hedefe ulaşmak için nasıl değerlendirilmeli?
            
            Lütfen tavsiyeni BU HEDEFE ULAŞMAYA ODAKLI ver. Sadece altın/gümüş değil, sepet yaparak (Döviz, Altın Tipleri, Mevduat vb.) bu hedefe en hızlı ve güvenli nasıl ulaşır anlat.
            `;
        } else {
            goalPrompt = 'Kullanıcının henüz özel bir hedefi yok. Genel varlık arttırma stratejileri öner.';
        }

        const prompt = `
        Sen uzman bir Türk finans danışmanısın. FinFlow adlı uygulamada kullanıcılara tavsiyeler veriyorsun.
        
        KULLANICI DURUMU:
        - Tarih: ${date}
        - Toplam Bakiye/Varlık: ${balance} TL
        ${goalPrompt}

        GÖREVİN:
        Bu bakiyeyi kullanarak kullanıcının hedefine (veya genel kar optimizasyonuna) en uygun yatırım sepetini oluştur.
        Şu varlık tiplerini kullanabilirsin: Gram Altın, Çeyrek/Yarım/Tam/Reşat Altın, Dolar, Euro.
        
        KURALLAR:
        1. Asla yasal yatırım tavsiyesi (YTD) olmadığını belirten sıkıcı uyarılar yapma, samimi ve arkadaşça ol.
        2. Kısa, öz ve maddeler halinde konuş.
        3. Emojiler kullan (🚀, 💰, 🏠, 🚗).
        4. Sepet önerisi yaparken mutlaka ORAN ver (Örn: %40 Gram Altın, %30 Dolar...).
        5. Eğer bir hedef varsa (Ev/Araba), "Şu kadar sürede ulaşabiliriz" gibi motive edici konuş.
        
        ÇIKTI FORMATI:
        Samimi bir selamlama, ardından analiz, sonra somut sepet önerisi ve kapanış.
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

