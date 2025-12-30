import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function GET() {
    try {
        console.log('RESETTING LEADERBOARD');
        await redis.del('leaderboard');
        await redis.del('leaderboard:metadata');

        return NextResponse.json({
            success: true,
            message: 'Liderlik tablosu başarıyla sıfırlandı. Yeni puanlama sistemine hazır.'
        });
    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ success: false, error: 'Sıfırlama başarısız' }, { status: 500 });
    }
}
