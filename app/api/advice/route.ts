import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { balance, date } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('Advice Request:', { balance, date, hasApiKey: !!apiKey });

        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY for Advice');
            // Mock response if API key is missing (fallback)
            return NextResponse.json({
                success: true,
                advice: `(Demo Modu - API Key Eksik) Mevcut bakiye: ${balance} TL. Altın fiyatları yükseliş trendinde olabilir. Portföyünüzü çeşitlendirerek %60 altın, %40 gümüş değerlendirebilirsiniz.`
            });
        }

        const prompt = `Sen bir finansal yatırım danışmanısın. Kullanıcının ${balance} TL bakiyesi var. Tarih: ${date}. 
    Kısa, nötr ve profesyonel bir dille, bu bakiye ile şu anki piyasa koşullarına göre mantıklı bir altın/gümüş sepeti önerisi yap.
    Örnek format: "Şu anki piyasada X TL ile Y alabilirsin çünkü Z."
    Yatırım tavsiyesi değildir uyarısı ekleme, sadece dostane bir öneri sun. Çok kısa tut (max 2-3 cümle).`;

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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error (Advice):', response.status, errorText);
            throw new Error(`Gemini API Failed: ${response.status}`);
        }

        const data = await response.json();
        console.log('Gemini Advice Response:', JSON.stringify(data));
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tavsiye oluşturulamadı.';

        return NextResponse.json({
            success: true,
            advice: text
        });

    } catch (error) {
        console.error('Advice error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate advice' },
            { status: 500 }
        );
    }
}
