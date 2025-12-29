import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const { nick, totalProfit } = await request.json();

        if (!nick || typeof totalProfit !== 'number') {
            return NextResponse.json(
                { success: false, error: 'Invalid data' },
                { status: 400 }
            );
        }

        console.log('Redis Submit:', nick, totalProfit);

        // Use Sorted Set for ranking (Score = Profit, Member = Nick)
        await redis.zadd('leaderboard', totalProfit, nick);

        // Use Hash for metadata (Last Update time)
        await redis.hset('leaderboard:metadata', {
            [nick]: JSON.stringify({ lastUpdate: new Date().toISOString() })
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Leaderboard submit error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' + JSON.stringify(error) },
            { status: 500 }
        );
    }
}
