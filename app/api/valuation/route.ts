import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { type, details } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'API Key missing'
            }, { status: 500 });
        }

        let prompt = '';

        if (type === 'car') {
            prompt = `Sen bir araç değerleme uzmanısın. Şu özelliklerdeki aracın Türkiye ikinci el piyasasındaki ortalama tahmini değerini (TL) söyle:
      Marka: ${details.brand}
      Model: ${details.model}
      Yıl: ${details.year}
      KM: ${details.km}
      
      Sadece tek bir sayısal değer (TL) ver. Açıklama yapma. Örn: 1250000`;
        } else if (type === 'home') {
            prompt = `Sen bir gayrimenkul değerleme uzmanısın. Şu özelliklerdeki evin Türkiye piyasasındaki ortalama tahmini değerini (TL) söyle:
      Konum: ${details.location}
      Büyüklük: ${details.m2} m2
      
      Sadece tek bir sayısal değer (TL) ver. Açıklama yapma. Örn: 5000000`;
        } else if (type === 'land') {
            prompt = `Sen bir gayrimenkul değerleme uzmanısın. Şu özelliklerdeki arsanın Türkiye piyasasındaki ortalama tahmini değerini (TL) söyle:
      Konum: ${details.location}
      Büyüklük: ${details.m2} m2
      
      Sadece tek bir sayısal değer (TL) ver. Açıklama yapma. Örn: 3000000`;
        } else {
            return NextResponse.json({ success: false, error: 'Invalid type' });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract number from text (remove non-numeric chars)
        const price = parseInt(text.replace(/[^0-9]/g, ''));

        if (isNaN(price)) {
            throw new Error('Fiyat tahmin edilemedi');
        }

        return NextResponse.json({
            success: true,
            estimatedPrice: price
        });

    } catch (error) {
        console.error('Valuation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to estimate value' },
            { status: 500 }
        );
    }
}
