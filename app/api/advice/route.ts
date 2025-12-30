import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
    try {
        const { balance, date, goal, prices, nick } = await request.json();
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
        Sen FinFlow uygulamasının yatırım asistanısın.
        
        KULLANICI VE PİYASA DURUMU:
        - Kullanıcı Nick: ${nick}
        - Tarih: ${date}
        - Bakiye: ${balance} TL
        ${marketInfo}
        ${goalPrompt}
        
        GÖREVİN:
        Verilen GÜNCEL PİYASA FİYATLARINI analiz ederek, kullanıcının hedefine ulaşması için matematiksel ve mantıklı bir yatırım sepeti öner.
        Sadece "altın al" deme; "Gram altın şu an X TL, bakiyenle Y adet alabilirsin" gibi somut konuş.
        
        KESİN FORMAT KURALLARI (Buna birebir uy):
        1. Başlangıç cümlesi: "Selam ${nick}, ${date} itibariyle ${balance} tl bakiyeni ${goal?.description || 'varlıklarını artırma'} hedefin için şu şekilde değerlendirebiliriz:"
        2. Analiz cümlesi: Güncel fiyatlara atıfta bulun (Örn: "Doların X TL, Gümüşün Y TL olduğu bu dönemde...").
        3. Sonuç cümlesi: "Sana önerim şu olabilir: [Önerin]"
        4. En fazla 3-4 cümle. Uzun paragraflar YOK.
        5. Emojileri (🚀, 📈, 💎) kullan.
        
        Yasal uyarı yapma. Arkadaşça, zeki ve veri odaklı ol.
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

